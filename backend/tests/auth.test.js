const request = require('supertest');

// Mock prisma
jest.mock('../src/utils/prisma', () => ({
    user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

// Mock SIWE utils
jest.mock('../src/utils/siwe', () => ({
    verifySiweSignature: jest.fn(),
    buildSiweMessage: jest.fn(() => 'mock-siwe-message'),
}));

process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-ok';
process.env.NODE_ENV = 'test';
process.env.NODE_REGISTRY_ADDRESS = '';
process.env.OPBNB_RPC = '';
process.env.PRIVATE_KEY = '';

const app = require('../src/app');
const prisma = require('../src/utils/prisma');
const { verifySiweSignature, buildSiweMessage } = require('../src/utils/siwe');

describe('Auth Routes', () => {
    afterEach(() => jest.clearAllMocks());

    describe('GET /api/auth/nonce', () => {
        it('returns 400 if address missing', async () => {
            const res = await request(app).get('/api/auth/nonce');
            expect(res.status).toBe(400);
        });

        it('returns nonce and message for valid address', async () => {
            prisma.user.upsert.mockResolvedValue({ id: 'u1', address: '0xabc', roles: ['CLIENT'] });
            const res = await request(app).get('/api/auth/nonce?address=0xabc');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('nonce');
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('POST /api/auth/verify', () => {
        it('returns 400 when body invalid', async () => {
            const res = await request(app).post('/api/auth/verify').send({});
            expect(res.status).toBe(400);
        });

        it('returns 401 on bad signature', async () => {
            verifySiweSignature.mockRejectedValue(new Error('bad sig'));
            const res = await request(app)
                .post('/api/auth/verify')
                .send({ message: 'msg', signature: '0xsig' });
            expect(res.status).toBe(401);
        });

        it('returns 401 on nonce mismatch', async () => {
            verifySiweSignature.mockResolvedValue({ address: '0xABC', nonce: 'wrong' });
            prisma.user.findUnique.mockResolvedValue({ id: 'u1', address: '0xabc', nonce: 'correct', roles: ['CLIENT'] });
            const res = await request(app)
                .post('/api/auth/verify')
                .send({ message: 'msg', signature: '0xsig' });
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/nonce/i);
        });

        it('returns token on success', async () => {
            verifySiweSignature.mockResolvedValue({ address: '0xABC', nonce: 'abc123' });
            prisma.user.findUnique.mockResolvedValue({
                id: 'u1', address: '0xabc', nonce: 'abc123', roles: ['CLIENT'],
            });
            prisma.user.update.mockResolvedValue({});
            const res = await request(app)
                .post('/api/auth/verify')
                .send({ message: 'msg', signature: '0xsig' });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.address).toBe('0xabc');
        });
    });

    describe('GET /api/auth/me', () => {
        it('returns 401 without token', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });
    });
});
