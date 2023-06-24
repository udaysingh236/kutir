import request from 'supertest';
import app from '../app';

describe('#1 Respond when requesting for healthcheck', () => {
    test('Should return success message', async () => {
        const res = await request(app).get('/v1/healthcheck');
        expect(res.status).toEqual(200);
        expect(res.text).toEqual('Hello from Kutir, I am alive..!!');
    });
});
