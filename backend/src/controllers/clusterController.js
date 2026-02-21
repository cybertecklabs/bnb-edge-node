const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// In-memory VM state (hackathon mock — replace with Docker/Proxmox SDK in prod)
const vmState = {};

// GET /api/clusters
exports.getClusters = async (req, res) => {
    try {
        const clusters = await prisma.cluster.findMany({
            where: { ownerId: req.user.id },
            include: {
                farmProfiles: {
                    select: { id: true, name: true, status: true, earningsUSD: true },
                },
                proxies: {
                    select: { id: true, endpoint: true, status: true, trafficLeft: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Enrich with mock VM metrics
        const enriched = clusters.map((c) => ({
            ...c,
            vms: vmState[c.id] || [],
            cpuUsage: Math.round(10 + Math.random() * 60),
            ramUsageGB: parseFloat((1 + Math.random() * 12).toFixed(1)),
            ramTotalGB: 16,
        }));

        res.json(enriched);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/clusters
exports.createCluster = async (req, res) => {
    try {
        const { name, location } = req.body;

        const cluster = await prisma.cluster.create({
            data: { ownerId: req.user.id, name, location },
        });

        // Seed default VMs
        vmState[cluster.id] = [
            { name: `${name.toLowerCase()}-vm-1`, status: 'stopped', cpu: 0, ramGB: 0, diskGB: 22, profile: null },
            { name: `${name.toLowerCase()}-vm-2`, status: 'stopped', cpu: 0, ramGB: 0, diskGB: 22, profile: null },
        ];

        logger.info(`Cluster created: ${name}`);
        res.status(201).json({ ...cluster, vms: vmState[cluster.id] });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/clusters/start-vm
exports.startVm = async (req, res) => {
    try {
        const { vmName, clusterId } = req.body;

        const cluster = await prisma.cluster.findFirst({
            where: { id: clusterId, ownerId: req.user.id },
        });
        if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

        const vms = vmState[clusterId] || [];
        const vm = vms.find((v) => v.name === vmName);
        if (!vm) return res.status(404).json({ error: 'VM not found' });

        vm.status = 'running';
        vm.cpu = Math.round(5 + Math.random() * 30);
        vm.ramGB = parseFloat((0.5 + Math.random() * 3).toFixed(1));

        logger.info(`VM started: ${vmName}`);
        res.json({ ok: true, vm });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/clusters/stop-vm
exports.stopVm = async (req, res) => {
    try {
        const { vmName, clusterId } = req.body;

        const cluster = await prisma.cluster.findFirst({
            where: { id: clusterId, ownerId: req.user.id },
        });
        if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

        const vms = vmState[clusterId] || [];
        const vm = vms.find((v) => v.name === vmName);
        if (!vm) return res.status(404).json({ error: 'VM not found' });

        vm.status = 'stopped';
        vm.cpu = 0;
        vm.ramGB = 0;

        logger.info(`VM stopped: ${vmName}`);
        res.json({ ok: true, vm });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
