import { Request, Response } from 'express';
import Joi from 'joi';
import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

const proxySchema = Joi.object({
    endpoint: Joi.string().required(),
    protocol: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().optional().allow(null, ''),
    provider: Joi.string().required(),
    trafficLeft: Joi.number().required(),
});

export const getProxies = async (req: any, res: Response) => {
    try {
        const proxies = await prisma.proxy.findMany({ where: { ownerId: req.user.id } });
        res.json(proxies);
    } catch (err: any) {
        logger.error('Get proxies failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const addProxy = async (req: any, res: Response) => {
    const { error } = proxySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details.map(d => d.message) });

    const data = req.body;
    try {
        const proxy = await prisma.proxy.create({
            data: { ...data, ownerId: req.user.id, status: 'active' },
        });
        res.json(proxy);
    } catch (err: any) {
        logger.error('Add proxy failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const assignProxy = async (req: any, res: Response) => {
    const { proxyId, profileId } = req.body;
    try {
        const proxy = await prisma.proxy.findFirst({ where: { id: proxyId, ownerId: req.user.id } });
        if (!proxy) return res.status(404).json({ error: 'Proxy not found' });

        const profile = await prisma.farmProfile.findFirst({
            where: { id: profileId, cluster: { ownerId: req.user.id } }
        });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Remove current assignment if exists
        await prisma.proxy.updateMany({
            where: { assignedProfileId: profileId },
            data: { assignedProfileId: null }
        });

        await prisma.proxy.update({
            where: { id: proxyId },
            data: { assignedProfileId: profileId }
        });

        req.app.get('io').emit('proxyAssigned', { proxyId, profileId });
        res.json({ message: 'Proxy assigned' });
    } catch (err: any) {
        logger.error('Assign proxy failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const buyTraffic = async (req: any, res: Response) => {
    const { vendor, packageGB } = req.body;
    try {
        // Mock simulation of GonzoProxy API call
        const mockProxy = {
            endpoint: `p-${Math.floor(Math.random() * 9999)}.gonzoproxy.net:3128`,
            protocol: 'SOCKS5',
            country: 'US',
            city: 'New York',
            provider: vendor || 'GonzoProxy',
            trafficLeft: packageGB || 10,
            ownerId: req.user.id,
            status: 'active',
        };

        const proxy = await prisma.proxy.create({ data: mockProxy });

        ioEmit(req, 'newActivity', {
            id: Date.now().toString(),
            type: 'payment',
            title: 'Proxy Traffic Acquired',
            sub: `Purchased ${packageGB}GB from ${vendor}.`,
            time: 'Just now'
        });

        res.json(proxy);
    } catch (err: any) {
        logger.error('Buy traffic failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

function ioEmit(req: any, event: string, data: any) {
    const io = req.app.get('io');
    if (io) io.emit(event, data);
}
