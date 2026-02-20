import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProxyService {
    /**
     * Simulates fetching available proxies from GonzoProxy or other vendors.
     */
    static async fetchProxies(vendor: string = 'GonzoProxy') {
        // In a real scenario, this would use axios to call the vendor API
        return [
            { endpoint: '45.12.3.4:8080', country: 'US', provider: vendor },
            { endpoint: '185.2.33.1:5050', country: 'DE', provider: vendor },
            { endpoint: '92.44.11.2:3128', country: 'SG', provider: vendor },
        ];
    }

    /**
     * Assigns a proxy to a farm profile.
     */
    static async assignProxy(profileId: string, proxyId: string) {
        return prisma.farmProfile.update({
            where: { id: profileId },
            data: { proxyId }
        });
    }

    /**
     * Simulates rotating a proxy for a profile.
     */
    static async rotateProxy(profileId: string) {
        const availableProxies = await prisma.proxy.findMany({
            where: { status: 'active', farmProfile: null }
        });

        if (availableProxies.length === 0) {
            throw new Error('No available proxies in pool');
        }

        const randomProxy = availableProxies[Math.floor(Math.random() * availableProxies.length)];

        return prisma.farmProfile.update({
            where: { id: profileId },
            data: { proxyId: randomProxy.id }
        });
    }
}
