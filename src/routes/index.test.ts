import request from 'supertest';
import * as auth from '../services/auth.service';
const mcheckUserLoggedIn = jest
    .spyOn(auth, 'checkUserLoggedIn')
    .mockImplementation((req, res, next) => {
        req.user = 'john.doe'; //for testing bypassing the auth
        if (req.user) {
            next();
        }
        return res.status(401).send({
            error: 'You are not logged in..!!'
        });
    });
import app from '../app'; //This should be in the last or after the mock

describe('GET - Respond when requesting for healthcheck', () => {
    test('Should return success message', async () => {
        const res = await request(app).get('/v1/healthcheck');
        expect(res.status).toEqual(200);
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(res.text).toEqual('Hello from Kutir, I am alive..!!');
    });
});
