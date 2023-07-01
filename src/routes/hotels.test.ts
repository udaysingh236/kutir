import request from 'supertest';
import app from '../app';
import * as hotelController from '../controllers/hotel.contoller';

describe('GET - Fetch information of all the hotels', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return information of all the hotels', async () => {
        const mgetAllHotelsDetails = jest
            .spyOn(hotelController, 'getAllHotelsDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/');
        expect(mgetAllHotelsDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
    });
});

describe('GET - Fetch information of a hotel by hotelID', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return information of a hotel', async () => {
        const mgetHotelDetails = jest.spyOn(hotelController, 'getHotelDetails').mockReturnValueOnce(
            Promise.resolve({
                status: 200
            })
        );

        const res = await request(app).get('/v1/hotels/10');
        expect(mgetHotelDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
    });

    test('Should return not able to find hotel data', async () => {
        const mgetHotelDetails = jest.spyOn(hotelController, 'getHotelDetails').mockReturnValueOnce(
            Promise.resolve({
                status: 404
            })
        );

        const res = await request(app).get('/v1/hotels/100');
        expect(mgetHotelDetails).toHaveBeenCalled();
        expect(res.status).toEqual(404);
        expect(res.text).toEqual('Not able to find hotel Data');
    });

    test('Should error out when non numeric hotel ID is passed', async () => {
        jest.resetAllMocks();
        const mgetHotelDetails = jest.spyOn(hotelController, 'getHotelDetails').mockReturnValueOnce(
            Promise.resolve({
                status: 404
            })
        );

        const res = await request(app).get('/v1/hotels/10AA');
        expect(mgetHotelDetails).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID type should be number.');
    });
});
