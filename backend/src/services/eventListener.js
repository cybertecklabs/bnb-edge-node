const { ethers } = require('ethers');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const { NODE_REGISTRY_ABI } = require('./contractService');

module.exports.start = (io) => {
    const provider = new ethers.JsonRpcProvider(process.env.OPBNB_RPC);
    const nodeRegistry = new ethers.Contract(
        process.env.NODE_REGISTRY_ADDRESS,
        NODE_REGISTRY_ABI,
        provider
    );

    // ── NodeRegistered ─────────────────────────────────────────────
    nodeRegistry.on('NodeRegistered', async (node, nodeType, stake) => {
        logger.info(`Event NodeRegistered: ${node} (${nodeType})`);
        try {
            const address = node.toLowerCase();
            let user = await prisma.user.findUnique({ where: { address } });
            if (!user) {
                user = await prisma.user.create({ data: { address, roles: ['PROVIDER'] } });
            }
            const stakeFloat = parseFloat(ethers.formatEther(stake));
            await prisma.node.upsert({
                where: { address },
                update: { type: nodeType, stake: stakeFloat, status: 'active' },
                create: { address, ownerId: user.id, type: nodeType, stake: stakeFloat, reputation: 50, status: 'active' },
            });
            await prisma.activityLog.create({
                data: {
                    userId: user.id,
                    type: 'node_registered',
                    description: `Node ${address} registered as ${nodeType} with ${stakeFloat} BNB stake`,
                },
            });
            io.emit('node-registered', { node, nodeType, stake: ethers.formatEther(stake) });
        } catch (err) {
            logger.error(`NodeRegistered handler error: ${err.message}`);
        }
    });

    // ── StakeIncreased ─────────────────────────────────────────────
    nodeRegistry.on('StakeIncreased', async (node, additional) => {
        logger.info(`Event StakeIncreased: ${node}`);
        try {
            const address = node.toLowerCase();
            const nodeData = await prisma.node.findUnique({ where: { address } });
            if (nodeData) {
                const added = parseFloat(ethers.formatEther(additional));
                await prisma.node.update({
                    where: { address },
                    data: { stake: nodeData.stake + added },
                });
                io.emit('stake-increased', { node, additional: ethers.formatEther(additional) });
            }
        } catch (err) {
            logger.error(`StakeIncreased handler error: ${err.message}`);
        }
    });

    // ── StakeSlashed ───────────────────────────────────────────────
    nodeRegistry.on('StakeSlashed', async (node, amount, reason) => {
        logger.warn(`Event StakeSlashed: ${node} — ${reason}`);
        try {
            const address = node.toLowerCase();
            const nodeData = await prisma.node.findUnique({ where: { address } });
            if (nodeData) {
                const slashed = parseFloat(ethers.formatEther(amount));
                const newStake = Math.max(0, nodeData.stake - slashed);
                const newRep = Math.max(0, nodeData.reputation - 20);
                await prisma.node.update({
                    where: { address },
                    data: { stake: newStake, reputation: newRep, status: newRep < 20 ? 'critical' : 'warning' },
                });
                await prisma.activityLog.create({
                    data: {
                        type: 'slashing',
                        description: `Node ${address} slashed ${slashed} BNB — ${reason}`,
                        metadata: { reason, amount: slashed },
                    },
                });
                io.emit('stake-slashed', { node, amount: ethers.formatEther(amount), reason });
            }
        } catch (err) {
            logger.error(`StakeSlashed handler error: ${err.message}`);
        }
    });

    // ── NodeDeregistered ───────────────────────────────────────────
    nodeRegistry.on('NodeDeregistered', async (node, refund) => {
        logger.info(`Event NodeDeregistered: ${node}`);
        try {
            const address = node.toLowerCase();
            await prisma.node.update({ where: { address }, data: { status: 'deregistered', stake: 0 } });
            io.emit('node-deregistered', { node, refund: ethers.formatEther(refund) });
        } catch (err) {
            logger.error(`NodeDeregistered handler error: ${err.message}`);
        }
    });

    // Handle provider errors / reconnection
    provider.on('error', (err) => {
        logger.error(`RPC provider error: ${err.message}`);
    });

    logger.info('Event listener started — watching NodeRegistry on opBNB');
};
