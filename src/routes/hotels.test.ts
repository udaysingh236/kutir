import request from 'supertest';
import * as auth from '../services/auth.service';
import * as hotelController from '../controllers/hotel.contoller';
const mcheckUserLoggedIn = jest
    .spyOn(auth, 'checkUserLoggedIn')
    .mockImplementation((req, res, next) => {
        req.user = 'john.doe'; //for testing bypassing the auth
        if (!req.user) {
            return res.status(401).send({
                error: 'You are not logged in..!!'
            });
        }
        next();
    });
import app from '../app'; //This should be in the last or after the mock

describe('GET - Fetch information of all the hotels', () => {
    test('Should return information of all the hotels', async () => {
        const mgetAllHotelsDetails = jest
            .spyOn(hotelController, 'getAllHotelsDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetAllHotelsDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
        mgetAllHotelsDetails.mockReset();
    });
});

describe('GET - Fetch information of a hotel by hotelID', () => {
    test('Should return information of a hotel', async () => {
        const mgetHotelDetails = jest.spyOn(hotelController, 'getHotelDetails').mockReturnValueOnce(
            Promise.resolve({
                status: 200
            })
        );

        const res = await request(app).get('/v1/hotels/10');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetHotelDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
        mgetHotelDetails.mockReset();
    });

    test('Should return not able to find hotel data', async () => {
        const mgetHotelDetails = jest.spyOn(hotelController, 'getHotelDetails').mockReturnValueOnce(
            Promise.resolve({
                status: 404
            })
        );

        const res = await request(app).get('/v1/hotels/100');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetHotelDetails).toHaveBeenCalled();
        expect(res.status).toEqual(404);
        expect(res.text).toEqual('Not able to find hotel Data');
        mgetHotelDetails.mockReset();
    });

    test('Should error out when non numeric hotel ID is passed', async () => {
        const mgetHotelDetails = jest.spyOn(hotelController, 'getHotelDetails').mockReturnValueOnce(
            Promise.resolve({
                status: 404
            })
        );

        const res = await request(app).get('/v1/hotels/10AA');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetHotelDetails).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID type should be number.');
    });
});
