import { Response, NextFunction } from 'express';

export const roleMiddleware = (allowedRoles: string[]) => (req: any, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userRoles = req.user.roles || [];
    if (!allowedRoles.some(role => userRoles.includes(role))) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
};
