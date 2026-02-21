const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Pricing catalogue (mock provider rates)
const PROVIDER_RATES = {
    GonzoProxy: 1.50,
    ProxyCheap: 1.30,
    BrightData: 2.00,
};

// GET /api/proxies
exports.getProxies = async (req, res) => {
    try {
        const proxies = await prisma.proxy.findMany({
            where: { ownerId: req.user.id },
            include: { assignedProfile: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(proxies);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/proxies/add  — manually add a proxy
exports.addProxy = async (req, res) => {
    try {
        const { endpoint, protocol, country, city, provider, trafficLeft, pricePerGB } = req.body;

        const proxy = await prisma.proxy.create({
            data: {
                ownerId: req.user.id,
                endpoint,
                protocol,
                country,
                city,
                provider,
                trafficLeft,
                pricePerGB,
                status: 'active',
            },
        });

        res.status(201).json(proxy);
    } catch (err) {
        if (err.code === 'P2002') return res.status(409).json({ error: 'Endpoint already exists' });
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/proxies/assign
exports.assignProxy = async (req, res) => {
    try {
        const { proxyId, profileId } = req.body;

        const [proxy, profile] = await Promise.all([
            prisma.proxy.findFirst({ where: { id: proxyId, ownerId: req.user.id } }),
            prisma.farmProfile.findFirst({
                where: { id: profileId, cluster: { ownerId: req.user.id } },
            }),
        ]);

        if (!proxy) return res.status(404).json({ error: 'Proxy not found' });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        if (proxy.status === 'exhausted') return res.status(400).json({ error: 'Proxy traffic exhausted' });

        // Unassign from any previous profile
        if (proxy.assignedProfile) {
            await prisma.farmProfile.update({
                where: { id: proxy.assignedProfile.id },
                data: { proxyId: null },
            });
        }

        await prisma.farmProfile.update({
            where: { id: profile.id },
            data: { proxyId: proxy.id },
        });

        res.json({ ok: true, proxyId: proxy.id, profileId: profile.id });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/proxies/buy  — mock purchase from provider
exports.buyTraffic = async (req, res) => {
    try {
        const { provider, gigabytes } = req.body;
        const ratePerGB = PROVIDER_RATES[provider] || 1.50;
        const totalCost = ratePerGB * gigabytes;

        // Mock: create a new proxy entry from the chosen provider
        const locations = {
            GonzoProxy: [
                { country: 'US', city: 'New York', protocol: 'http' },
                { country: 'GB', city: 'London', protocol: 'http' },
            ],
            ProxyCheap: [
                { country: 'DE', city: 'Frankfurt', protocol: 'socks5' },
                { country: 'NL', city: 'Amsterdam', protocol: 'socks5' },
            ],
            BrightData: [
                { country: 'SG', city: 'Singapore', protocol: 'http' },
                { country: 'JP', city: 'Tokyo', protocol: 'http' },
            ],
        };

        const loc = (locations[provider] || locations.GonzoProxy)[
            Math.floor(Math.random() * 2)
        ];
        const endpoint = `${loc.city.toLowerCase().replace(' ', '-')}.${provider.toLowerCase()}.com:${8080 + Math.floor(Math.random() * 100)}`;

        const proxy = await prisma.proxy.create({
            data: {
                ownerId: req.user.id,
                endpoint,
                protocol: loc.protocol,
                country: loc.country,
                city: loc.city,
                provider,
                trafficLeft: gigabytes,
                pricePerGB: ratePerGB,
                status: 'active',
            },
        });

        logger.info(`Proxy purchased: ${gigabytes}GB from ${provider} — $${totalCost}`);
        res.status(201).json({ proxy, totalCost, gigabytes, provider });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
