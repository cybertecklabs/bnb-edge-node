import request from 'supertest';
import app from '../src/app.js';

describe('Auth API', () => {
    it('should get nonce', async () => {
        const res = await request(app)
            .post('/api/auth/nonce')
            .send({ address: '0x1234567890123456789012345678901234567890' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('nonce');
    });
});
