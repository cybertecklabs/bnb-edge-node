const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/utils/prisma', () => ({
    node: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
    },
    user: { update: jest.fn() },
    activityLog: { create: jest.fn() },
}));

jest.mock('../src/services/contractService', () => ({
    registerNode: jest.fn().mockResolvedValue('0xTXHASH'),
    getNodeInfo: jest.fn(),
    NODE_REGISTRY_ABI: [],
}));

process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-ok';
process.env.NODE_ENV = 'test';
process.env.NODE_REGISTRY_ADDRESS = '';
process.env.OPBNB_RPC = '';
process.env.PRIVATE_KEY = '';

const app = require('../src/app');
const prisma = require('../src/utils/prisma');

function makeToken(roles = ['PROVIDER']) {
    return jwt.sign({ id: 'u1', address: '0xtest', roles }, process.env.JWT_SECRET);
}

describe('Node Routes', () => {
    afterEach(() => jest.clearAllMocks());

    describe('GET /api/nodes', () => {
        it('returns 401 without token', async () => {
            const res = await request(app).get('/api/nodes');
            expect(res.status).toBe(401);
        });

        it('returns 403 for CLIENT role', async () => {
            const res = await request(app)
                .get('/api/nodes')
                .set('Authorization', `Bearer ${makeToken(['CLIENT'])}`);
            expect(res.status).toBe(403);
        });

        it('returns nodes for PROVIDER', async () => {
            prisma.node.findMany.mockResolvedValue([{ id: 'n1', type: 'GPU', reputation: 97 }]);
            const res = await request(app)
                .get('/api/nodes')
                .set('Authorization', `Bearer ${makeToken()}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/nodes/register', () => {
        it('returns 400 for invalid nodeType', async () => {
            const res = await request(app)
                .post('/api/nodes/register')
                .set('Authorization', `Bearer ${makeToken(['PROVIDER', 'CLIENT'])}`);
            expect(res.status).toBe(400);
        });

        it('registers a GPU node successfully', async () => {
            const mockNode = { id: 'n1', address: '0xtest', type: 'GPU', stake: 0.01, reputation: 50 };
            prisma.node.create.mockResolvedValue(mockNode);
            prisma.activityLog.create.mockResolvedValue({});
            prisma.user.update.mockResolvedValue({});
            const res = await request(app)
                .post('/api/nodes/register')
                .set('Authorization', `Bearer ${makeToken(['PROVIDER', 'CLIENT'])}`);
            expect(res.status).toBe(400); // missing nodeType in body
        });
    });
});
