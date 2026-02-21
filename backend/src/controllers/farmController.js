const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/farm/profiles
exports.getProfiles = async (req, res) => {
    try {
        const profiles = await prisma.farmProfile.findMany({
            where: { cluster: { ownerId: req.user.id } },
            include: {
                proxy: { select: { endpoint: true, city: true, country: true, status: true } },
                cluster: { select: { name: true } },
                sessions: { where: { endedAt: null }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
        const enriched = profiles.map(p => ({
            ...p,
            projects: p.projects.split(',').map(s => s.trim())
        }));
        res.json(enriched);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/farm/profiles
exports.createProfile = async (req, res) => {
    try {
        const { name, clusterId, projects, fingerprint = {}, wallets = [] } = req.body;

        // Verify cluster ownership
        const cluster = await prisma.cluster.findFirst({
            where: { id: clusterId, ownerId: req.user.id },
        });
        if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

        const profile = await prisma.farmProfile.create({
            data: {
                clusterId,
                name,
                projects: projects.join(','),
                fingerprint,
                wallets,
                status: 'paused',
            },
        });

        logger.info(`Farm profile created: ${name}`);
        res.status(201).json(profile);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/farm/profiles/:id/launch
exports.launchProfile = async (req, res) => {
    try {
        const profile = await prisma.farmProfile.findFirst({
            where: { id: req.params.id, cluster: { ownerId: req.user.id } },
            include: { proxy: true },
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        if (profile.status === 'banned') return res.status(403).json({ error: 'Profile is banned' });
        if (!profile.proxy) return res.status(400).json({ error: 'Assign a proxy before launching' });
        if (profile.proxy.trafficLeft <= 0) {
            return res.status(400).json({ error: 'Proxy traffic exhausted — buy more' });
        }

        // Close any stale sessions
        await prisma.session.updateMany({
            where: { farmProfileId: profile.id, endedAt: null },
            data: { endedAt: new Date() },
        });

        // Create new session per project
        const projectList = profile.projects.split(',').map(p => p.trim());
        const sessions = await Promise.all(
            projectList.map((project) =>
                prisma.session.create({
                    data: {
                        farmProfileId: profile.id,
                        project,
                        sessionId: uuidv4(),
                    },
                })
            )
        );

        await prisma.farmProfile.update({
            where: { id: profile.id },
            data: { status: 'active' },
        });

        logger.info(`Farm profile ${profile.name} launched`);
        res.json({ profile: { ...profile, status: 'active' }, sessions });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/farm/profiles/:id/stop
exports.stopProfile = async (req, res) => {
    try {
        const profile = await prisma.farmProfile.findFirst({
            where: { id: req.params.id, cluster: { ownerId: req.user.id } },
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // End all open sessions
        const closedAt = new Date();
        await prisma.session.updateMany({
            where: { farmProfileId: profile.id, endedAt: null },
            data: { endedAt: closedAt },
        });

        await prisma.farmProfile.update({
            where: { id: profile.id },
            data: { status: 'paused' },
        });

        logger.info(`Farm profile ${profile.name} stopped`);
        res.json({ ok: true, stoppedAt: closedAt });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/farm/earnings
exports.getEarnings = async (req, res) => {
    try {
        const profiles = await prisma.farmProfile.findMany({
            where: { cluster: { ownerId: req.user.id } },
            select: {
                id: true,
                name: true,
                earningsUSD: true,
                status: true,
                sessions: {
                    select: { earnings: true, project: true, startedAt: true },
                    orderBy: { startedAt: 'desc' },
                    take: 20,
                },
            },
        });

        const totalEarnings = profiles.reduce((sum, p) => sum + p.earningsUSD, 0);
        const activeCount = profiles.filter((p) => p.status === 'active').length;

        res.json({ profiles, totalEarnings, activeCount });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
