const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prisma');
const { verifySiweSignature, buildSiweMessage } = require('../utils/siwe');
const logger = require('../utils/logger');

const normalizeRoles = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    const str = String(raw);
    return str.split(',').map((r) => r.trim()).filter(Boolean);
};

// GET /api/auth/nonce?address=0x...
exports.getNonce = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return res.status(400).json({ error: 'address query param required' });

        const nonce = uuidv4().replace(/-/g, '').slice(0, 16);
        const addr = address.toLowerCase();

        await prisma.user.upsert({
            where: { address: addr },
            update: { nonce },
            create: { address: addr, nonce, roles: 'CLIENT,PROVIDER' },
        });

        const message = buildSiweMessage({ address, nonce });
        res.json({ nonce, message });
    } catch (err) {
        console.error("AUTH ERROR:", err);
        logger.error(err.stack || err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/auth/verify
exports.verifySiwe = async (req, res) => {
    try {
        const { message, signature } = req.body;
        const fields = await verifySiweSignature(message, signature);
        const address = fields.address.toLowerCase();

        const user = await prisma.user.findUnique({ where: { address } });
        if (!user) return res.status(404).json({ error: 'User not found — request nonce first' });
        if (user.nonce !== fields.nonce) {
            return res.status(401).json({ error: 'Nonce mismatch — request a fresh nonce' });
        }

        // Invalidate nonce after one use
        await prisma.user.update({ where: { address }, data: { nonce: null } });

        const rolesArr = normalizeRoles(user.roles);

        const token = jwt.sign(
            { id: user.id, address: user.address, roles: rolesArr },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        logger.info(`Auth: ${address}`);
        res.json({ token, user: { id: user.id, address: user.address, roles: rolesArr } });
    } catch (err) {
        logger.error(`SIWE verify failed: ${err.message}`);
        res.status(401).json({ error: err.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, address: true, roles: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ...user, roles: normalizeRoles(user.roles) });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
