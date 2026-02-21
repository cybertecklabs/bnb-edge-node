const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/utils/prisma', () => ({
    job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    activityLog: { create: jest.fn() },
    node: { findFirst: jest.fn() },
}));

process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-ok';
process.env.NODE_ENV = 'test';
process.env.NODE_REGISTRY_ADDRESS = '';
process.env.OPBNB_RPC = '';
process.env.PRIVATE_KEY = '';

const app = require('../src/app');
const prisma = require('../src/utils/prisma');

function makeToken(roles = ['PROVIDER', 'CLIENT']) {
    return jwt.sign({ id: 'u1', address: '0xtest', roles }, process.env.JWT_SECRET);
}

describe('Job Routes', () => {
    afterEach(() => jest.clearAllMocks());

    describe('GET /api/jobs', () => {
        it('returns 401 without token', async () => {
            const res = await request(app).get('/api/jobs');
            expect(res.status).toBe(401);
        });

        it('returns jobs list', async () => {
            prisma.job.findMany.mockResolvedValue([{ id: 'j1', status: 'open', payment: 50 }]);
            prisma.job.count.mockResolvedValue(1);
            const res = await request(app)
                .get('/api/jobs')
                .set('Authorization', `Bearer ${makeToken()}`);
            expect(res.status).toBe(200);
            expect(res.body.jobs).toHaveLength(1);
        });
    });

    describe('POST /api/jobs', () => {
        it('returns 400 on missing taskCID', async () => {
            const res = await request(app)
                .post('/api/jobs')
                .set('Authorization', `Bearer ${makeToken()}`)
                .send({ payment: 50 });
            expect(res.status).toBe(400);
        });

        it('creates a job successfully', async () => {
            const mockJob = { id: 'j1', jobId: 1, taskCID: 'Qm123', payment: 50, status: 'open' };
            prisma.job.create.mockResolvedValue(mockJob);
            prisma.activityLog.create.mockResolvedValue({});
            const res = await request(app)
                .post('/api/jobs')
                .set('Authorization', `Bearer ${makeToken()}`)
                .send({ taskCID: 'Qm123', payment: 50 });
            expect(res.status).toBe(201);
            expect(res.body.taskCID).toBe('Qm123');
        });
    });
});
