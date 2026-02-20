import { Request, Response } from 'express';
import Joi from 'joi';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';
import * as contractService from '../services/contractService.js';
import validate from '../utils/validate.js';

const profileSchema = Joi.object({
    clusterId: Joi.string().required(),
    name: Joi.string().required(),
    projects: Joi.array().items(Joi.string()).required(),
    wallets: Joi.array().required(),
    proxyId: Joi.string().optional().allow(null),
});

export const getProfiles = async (req: any, res: Response) => {
    try {
        const profiles = await prisma.farmProfile.findMany({
            where: { cluster: { ownerId: req.user.id } },
            include: { proxy: true, sessions: true },
        });
        res.json(profiles.map(p => ({
            ...p,
            projects: JSON.parse(p.projects),
            wallets: JSON.parse(p.wallets || '[]')
        })));
    } catch (err: any) {
        logger.error('Get farm profiles failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const createProfile = async (req: any, res: Response) => {
    const { error } = profileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const { clusterId, name, projects, wallets, proxyId } = req.body;
    try {
        const cluster = await prisma.cluster.findFirst({ where: { id: clusterId, ownerId: req.user.id } });
        if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

        const profile = await prisma.farmProfile.create({
            data: {
                clusterId,
                name,
                projects: JSON.stringify(projects),
                wallets: JSON.stringify(wallets),
                fingerprint: JSON.stringify({ browser: 'Chrome', os: 'Linux', hardware: 'High' }),
                proxyId: proxyId || null,
            },
        });

        req.app.get('io').emit('profileCreated', profile);
        res.json(profile);
    } catch (err: any) {
        logger.error('Create farm profile failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const launchProfile = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
        const profile = await prisma.farmProfile.findFirst({
            where: { id, cluster: { ownerId: req.user.id } }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Simulation: On-chain registration check
        // In production, we'd check if this node is already registered on opBNB
        // await contractService.registerNode('DePIN-Farm');

        await prisma.farmProfile.update({ where: { id }, data: { status: 'active' } });

        const projects = JSON.parse(profile.projects);
        const session = await prisma.session.create({
            data: {
                farmProfileId: id,
                project: projects[0] || 'Unknown',
                sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
        });

        req.app.get('io').emit('profileLaunched', { profileId: id, session });
        req.app.get('io').emit('newActivity', {
            id: Date.now().toString(),
            type: 'farm',
            title: 'Farm Profile Launched',
            sub: `Profile ${profile.name} is now mining ${projects[0]}.`,
            time: 'Just now'
        });

        res.json({ message: 'Profile launched', session });
    } catch (err: any) {
        logger.error('Launch profile failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const stopProfile = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
        const profile = await prisma.farmProfile.findFirst({
            where: { id, cluster: { ownerId: req.user.id } }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        await prisma.farmProfile.update({ where: { id }, data: { status: 'paused' } });

        await prisma.session.updateMany({
            where: { farmProfileId: id, status: 'active' },
            data: { status: 'completed', endTime: new Date() }
        });

        req.app.get('io').emit('profileStopped', { profileId: id });
        res.json({ message: 'Profile stopped' });
    } catch (err: any) {
        logger.error('Stop profile failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getEarnings = async (req: any, res: Response) => {
    try {
        const profiles = await prisma.farmProfile.findMany({
            where: { cluster: { ownerId: req.user.id } }
        });
        const total = profiles.reduce((sum, p) => sum + p.earningsUSD, 0);
        res.json({ total, profiles });
    } catch (err: any) {
        logger.error('Get earnings failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};
