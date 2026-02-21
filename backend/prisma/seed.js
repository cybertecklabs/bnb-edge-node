require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding BNB Edge database (SQLite)...');

    // Admin user
    const admin = await prisma.user.upsert({
        where: { address: '0xadmin00000000000000000000000000000000001' },
        update: {},
        create: {
            address: '0xadmin00000000000000000000000000000000001',
            roles: 'ADMIN,PROVIDER,CLIENT',
        },
    });

    // Provider user
    const provider = await prisma.user.upsert({
        where: { address: '0x9f2a3b8c0000000000000000000000000000001a' },
        update: {},
        create: {
            address: '0x9f2a3b8c0000000000000000000000000000001a',
            roles: 'PROVIDER,CLIENT',
        },
    });

    // Nodes
    await prisma.node.upsert({
        where: { address: '0x9f2a3b8c0000000000000000000000000000001a' },
        update: {},
        create: {
            address: '0x9f2a3b8c0000000000000000000000000000001a',
            ownerId: provider.id,
            type: 'GPU',
            status: 'active',
            stake: 2.4,
            reputation: 97,
            metadata: JSON.stringify({ gpu: 'H100', vram: '80GB', region: 'us-east' }),
        },
    });

    await prisma.node.upsert({
        where: { address: '0xa1b2c3d40000000000000000000000000000002b' },
        update: {},
        create: {
            address: '0xa1b2c3d40000000000000000000000000000002b',
            ownerId: admin.id,
            type: 'Storage',
            status: 'active',
            stake: 0.8,
            reputation: 84,
        },
    });

    // Cluster
    const cluster = await prisma.cluster.upsert({
        where: { id: 'seed-cluster-001' },
        update: {},
        create: {
            id: 'seed-cluster-001',
            ownerId: provider.id,
            name: 'Main Cluster',
            location: 'US-East',
            totalStake: 3.2,
            uptime: 99.2,
        },
    });

    // Proxies
    const proxy1 = await prisma.proxy.upsert({
        where: { endpoint: 'us-ny.gonzo.com:8080' },
        update: {},
        create: {
            ownerId: provider.id,
            clusterId: cluster.id,
            endpoint: 'us-ny.gonzo.com:8080',
            protocol: 'http',
            country: 'US',
            city: 'New York',
            provider: 'GonzoProxy',
            trafficLeft: 50,
            pricePerGB: 1.50,
            status: 'active',
        },
    });

    // Farm profiles
    await prisma.farmProfile.upsert({
        where: { id: 'seed-profile-001' },
        update: {},
        create: {
            id: 'seed-profile-001',
            ownerId: provider.id,
            clusterId: cluster.id,
            name: 'Grass-1',
            proxyId: proxy1.id,
            projects: 'Grass,Dawn',
            status: 'active',
            earningsUSD: 145.30,
            uptime: 99.2,
            fingerprint: JSON.stringify({ userAgent: 'Chrome/120', os: 'Windows' }),
            wallets: '[]',
        },
    });

    // Activity logs
    await prisma.activityLog.create({
        data: { userId: provider.id, type: 'node_registered', description: 'GPU H100 node registered' },
    });

    console.log('Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
