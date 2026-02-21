const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Live profit rates (mock — replace with real API calls in prod)
const PROFIT_RATES = {
    Grass: 0.12,
    Dawn: 0.18,
    Nodepay: 0.09,
    BNBEdge: 0.45,
};

function bestProject() {
    return Object.entries(PROFIT_RATES).reduce((a, b) => (a[1] > b[1] ? a : b));
}

// GET /api/optimizer/profit-rates
exports.getProfitRates = async (_req, res) => {
    try {
        const [best, bestRate] = bestProject();
        res.json({
            rates: PROFIT_RATES,
            best,
            bestRate,
            updatedAt: new Date(),
        });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/optimizer/save-settings
exports.saveSettings = async (req, res) => {
    try {
        const { autoOptimize, switchThreshold, includedProjects } = req.body;

        const settings = await prisma.optimizerSettings.upsert({
            where: { ownerId: req.user.id },
            update: { autoOptimize, switchThreshold, includedProjects: includedProjects.join(',') },
            create: { ownerId: req.user.id, autoOptimize, switchThreshold, includedProjects: includedProjects.join(',') },
        });

        // If auto-optimize ON, run a switch pass immediately
        if (autoOptimize) {
            await runOptimizerPass(req.user.id, switchThreshold, includedProjects);
        }

        res.json({ ok: true, settings });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/optimizer/log
exports.getOptimizationLog = async (req, res) => {
    try {
        const logs = await prisma.profitLog.findMany({
            where: { farmProfile: { cluster: { ownerId: req.user.id } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { farmProfile: { select: { name: true } } },
        });
        res.json(logs);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Internal: auto-switch active profiles to highest-paying project
async function runOptimizerPass(ownerId, threshold, includedProjectsArr) {
    try {
        const filtered = Object.entries(PROFIT_RATES).filter(([k]) =>
            includedProjectsArr.includes(k)
        );
        if (filtered.length === 0) return;
        const [bestProj, bestRate] = filtered.reduce((a, b) => (a[1] > b[1] ? a : b));

        const profiles = await prisma.farmProfile.findMany({
            where: { cluster: { ownerId }, status: 'active' },
        });

        for (const profile of profiles) {
            const currentProjects = profile.projects.split(',').map(s => s.trim());
            const currentBest = currentProjects.find((p) => includedProjectsArr.includes(p));
            if (!currentBest) continue;

            const currentRate = PROFIT_RATES[currentBest] || 0;
            const gain = ((bestRate - currentRate) / currentRate) * 100;

            if (gain >= threshold) {
                await prisma.farmProfile.update({
                    where: { id: profile.id },
                    data: { projects: bestProj },
                });
                await prisma.profitLog.create({
                    data: {
                        farmProfileId: profile.id,
                        oldProject: currentBest,
                        newProject: bestProj,
                        profitGain: gain,
                    },
                });
                logger.info(`Optimizer: ${profile.name} switched ${currentBest} -> ${bestProj} (+${gain.toFixed(1)}%)`);
            }
        }
    } catch (err) {
        logger.error(`Optimizer pass failed: ${err.message}`);
    }
}
