const prisma = require('../utils/prisma');
const contractService = require('../services/contractService');
const logger = require('../utils/logger');

// GET /api/nodes  — list caller's nodes
exports.getNodes = async (req, res) => {
    try {
        const nodes = await prisma.node.findMany({
            where: { ownerId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(nodes);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/nodes/all  — list all nodes (for overview dashboard)
exports.getAllNodes = async (req, res) => {
    try {
        const nodes = await prisma.node.findMany({
            orderBy: { reputation: 'desc' },
            include: { owner: { select: { address: true } } },
        });
        res.json(nodes);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/nodes/register
exports.registerNode = async (req, res) => {
    try {
        const { nodeType, metadata } = req.body;
        const io = req.app.get('io');

        // Fire on-chain tx
        const txHash = await contractService.registerNode(nodeType);

        // Persist to DB
        const node = await prisma.node.create({
            data: {
                address: req.user.address,
                ownerId: req.user.id,
                type: nodeType,
                stake: 0.01,
                reputation: 50,
                status: 'active',
                metadata: metadata || {},
            },
        });

        // Activity log
        await prisma.activityLog.create({
            data: {
                userId: req.user.id,
                type: 'node_registered',
                description: `Node ${req.user.address} registered as ${nodeType}`,
                metadata: { txHash, nodeId: node.id },
            },
        });

        // Upgrade role to PROVIDER if not already
        await prisma.user.update({
            where: { id: req.user.id },
            data: { roles: 'PROVIDER,CLIENT' },
        });

        if (io) io.emit('node-registered', { node, txHash });
        logger.info(`Node registered: ${req.user.address} (${nodeType}) tx=${txHash}`);
        res.status(201).json({ node, txHash });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/nodes/heartbeat
exports.sendHeartbeat = async (req, res) => {
    try {
        const node = await prisma.node.findFirst({ where: { ownerId: req.user.id } });
        if (!node) return res.status(404).json({ error: 'No node found for this user' });

        await prisma.node.update({
            where: { id: node.id },
            data: { updatedAt: new Date() },
        });

        await prisma.activityLog.create({
            data: {
                userId: req.user.id,
                type: 'heartbeat',
                description: `Heartbeat from node ${node.address}`,
            },
        });

        res.json({ ok: true, timestamp: new Date() });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /api/nodes/:id  — deregister
exports.deregisterNode = async (req, res) => {
    try {
        const node = await prisma.node.findFirst({
            where: { id: req.params.id, ownerId: req.user.id },
        });
        if (!node) return res.status(404).json({ error: 'Node not found' });

        await prisma.node.update({ where: { id: node.id }, data: { status: 'deregistered' } });

        await prisma.activityLog.create({
            data: {
                userId: req.user.id,
                type: 'node_deregistered',
                description: `Node ${node.address} deregistered (72h unbonding)`,
            },
        });

        res.json({ ok: true, message: '72h unbonding period started' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
