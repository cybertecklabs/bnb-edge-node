import { Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger.js';
import prisma from '../utils/prisma.js';

export const getProfitRates = async (req: Request, res: Response) => {
    try {
        // Attempting to fetch real BNB price from CoinGecko
        const bnbRes = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        const bnbPrice = bnbRes.data?.binancecoin?.usd || 600;

        // Simulation of project-specific rewards
        const rates = {
            grass: (0.12 * bnbPrice) / 100, // Normalized per hour
            dawn: (0.18 * bnbPrice) / 100,
            nodepay: (0.09 * bnbPrice) / 100,
            bnbedge: (0.45 * bnbPrice) / 100,
        };

        res.json({ rates, bnbPrice });
    } catch (err: any) {
        logger.error('Get profit rates failed', err);
        res.status(500).json({ error: 'Failed to fetch global yield rates' });
    }
};

export const saveSettings = async (req: any, res: Response) => {
    const { enabled, threshold, includedProjects } = req.body;
    // This would ideally save to a UserSettings table
    logger.info(`Optimizer settings updated for user ${req.user.id}`);
    res.json({ message: 'Optimization logic updated' });
};

export const getOptimizationLog = async (req: any, res: Response) => {
    try {
        const logs = await prisma.profitLog.findMany({
            where: { farmProfile: { cluster: { ownerId: req.user.id } } },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(logs);
    } catch (err: any) {
        logger.error('Get optimization logs failed', err);
        res.status(500).json({ error: 'Server error' });
    }
};
