import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma.js';
import { verifySiweSignature } from '../utils/siwe.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const nonce = async (req: Request, res: Response) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });

    const nonce = uuidv4();
    try {
        const addressLower = address.toLowerCase();
        await prisma.user.upsert({
            where: { address: addressLower },
            update: { nonce },
            create: {
                address: addressLower,
                nonce,
                roles: JSON.stringify(['CLIENT'])
            },
        });
        res.json({ nonce });
    } catch (err: any) {
        logger.error('Nonce creation failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export const verify = async (req: Request, res: Response) => {
    const { message, signature } = req.body;
    try {
        const data = await verifySiweSignature(message, signature);
        const address = data.address.toLowerCase();

        let user = await prisma.user.findUnique({ where: { address } });
        if (!user) {
            user = await prisma.user.create({ data: { address, roles: JSON.stringify(['CLIENT']) } });
        }

        await prisma.user.update({ where: { address }, data: { nonce: null } });

        const token = jwt.sign(
            { id: user.id, address, roles: JSON.parse(user.roles) },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, address, roles: JSON.parse(user.roles) }
        });
    } catch (err: any) {
        logger.error('SIWE Verification failed', err);
        res.status(401).json({ error: err.message });
    }
};

export const me = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { nodes: true, clusters: true, proxies: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const roles = JSON.parse(user.roles);
        res.json({ ...user, roles });
    } catch (err: any) {
        logger.error('Me endpoint failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};
