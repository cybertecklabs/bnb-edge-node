const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// GET /api/jobs
exports.getJobs = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = status ? { status } : {};
        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: Number(limit),
                include: {
                    creator: { select: { address: true } },
                    assignee: { select: { address: true } },
                    node: { select: { address: true, type: true, reputation: true } },
                },
            }),
            prisma.job.count({ where }),
        ]);
        res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/jobs/:id
exports.getJob = async (req, res) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: {
                creator: { select: { address: true } },
                assignee: { select: { address: true } },
                node: true,
            },
        });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/jobs
exports.createJob = async (req, res) => {
    try {
        const { taskCID, payment, minRep = 50 } = req.body;
        const io = req.app.get('io');

        const job = await prisma.job.create({
            data: {
                creatorId: req.user.id,
                taskCID,
                payment,
                minRep,
                status: 'open',
            },
        });

        await prisma.activityLog.create({
            data: {
                userId: req.user.id,
                type: 'job_created',
                description: `Job #${job.jobId} created — $${payment} USDC`,
                metadata: { jobId: job.id },
            },
        });

        if (io) io.emit('job-created', job);
        logger.info(`Job #${job.jobId} created by ${req.user.address}`);
        res.status(201).json(job);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/jobs/:id/accept
exports.acceptJob = async (req, res) => {
    try {
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (job.status !== 'open') return res.status(400).json({ error: 'Job is not open' });

        const node = await prisma.node.findFirst({ where: { ownerId: req.user.id } });
        if (!node) return res.status(400).json({ error: 'You have no registered node' });
        if (node.reputation < job.minRep) {
            return res.status(403).json({ error: `Reputation ${node.reputation} < required ${job.minRep}` });
        }

        const updated = await prisma.job.update({
            where: { id: job.id },
            data: { assigneeId: req.user.id, nodeId: node.id, status: 'assigned' },
        });

        const io = req.app.get('io');
        if (io) io.emit('job-assigned', { jobId: job.id, node: node.address });
        res.json(updated);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/jobs/:id/submit
exports.submitResult = async (req, res) => {
    try {
        const { resultCID, txHash } = req.body;
        const job = await prisma.job.findUnique({ where: { id: req.params.id } });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        if (job.assigneeId !== req.user.id) return res.status(403).json({ error: 'Not your job' });
        if (job.status !== 'assigned') return res.status(400).json({ error: 'Job not in assigned state' });

        const updated = await prisma.job.update({
            where: { id: job.id },
            data: { resultCID, txHash, status: 'completed', completedAt: new Date() },
        });

        await prisma.activityLog.create({
            data: {
                userId: req.user.id,
                type: 'reward_distributed',
                description: `Job #${job.jobId} completed — $${(job.payment * 0.96).toFixed(2)} released`,
                metadata: { jobId: job.id, resultCID, txHash },
            },
        });

        const io = req.app.get('io');
        if (io) io.emit('job-completed', { jobId: job.id, resultCID });
        res.json(updated);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/jobs/activity — recent activity log
exports.getActivity = async (req, res) => {
    try {
        const logs = await prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { user: { select: { address: true } } },
        });
        res.json(logs);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
