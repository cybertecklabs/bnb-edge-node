import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

export const getClusters = async (req: any, res: Response) => {
    try {
        const clusters = await prisma.cluster.findMany({
            where: { ownerId: req.user.id },
            include: { farmProfiles: true },
        });
        res.json(clusters);
    } catch (err: any) {
        logger.error('Get clusters failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const createCluster = async (req: any, res: Response) => {
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    try {
        const cluster = await prisma.cluster.create({
            data: { name, location: location || 'Global', ownerId: req.user.id },
        });
        res.json(cluster);
    } catch (err: any) {
        logger.error('Create cluster failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const startVm = async (req: any, res: Response) => {
    const { id } = req.body;
    // Simulation of Proxmox/Cloud API call
    logger.info(`Starting Virtual Machine for Cluster Instance ${id}`);

    const io = req.app.get('io');
    if (io) {
        io.emit('newActivity', {
            id: Date.now().toString(),
            type: 'node',
            title: 'Infrastructure Scoped',
            sub: `Scaling up hardware instance in ${id}.`,
            time: 'Just now'
        });
    }

    res.json({ message: 'VM orchestration sequence started' });
};
