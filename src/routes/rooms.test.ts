import request from 'supertest';
import * as auth from '../services/auth.service';
import * as roomController from '../controllers/room.controller';
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

describe('GET - Get information of all the rooms a hotel', () => {
    test('Should return information of all the rooms a hotel', async () => {
        const mgetHotelRoomsDetails = jest
            .spyOn(roomController, 'getHotelRoomsDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetHotelRoomsDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
        mgetHotelRoomsDetails.mockReset();
    });

    test('Should return information of a room number passed in query string', async () => {
        const mgetRoomDetailsFromNumber = jest
            .spyOn(roomController, 'getRoomDetailsFromNumber')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms?roomNum=102');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetRoomDetailsFromNumber).toHaveBeenCalled();
        expect(res.status).toEqual(200);
        mgetRoomDetailsFromNumber.mockReset();
    });

    test('Should error out when non numeric room number passed in query string', async () => {
        const mgetRoomDetailsFromNumber = jest
            .spyOn(roomController, 'getRoomDetailsFromNumber')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms?roomNum=102AA');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetRoomDetailsFromNumber).not.toHaveBeenCalled();
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID and Room Number type should be number.');
    });

    test('Should error out when non numeric hotel ID is passed', async () => {
        const mgetHotelRoomsDetails = jest
            .spyOn(roomController, 'getHotelRoomsDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10AA/rooms');
        expect(mgetHotelRoomsDetails).not.toHaveBeenCalled();
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID type should be number.');
    });
});

describe('GET - Get information of a room by Hotel ID or Room ID', () => {
    test('Should return information about a room of a hotel', async () => {
        const mgetRoomDetailsFromId = jest
            .spyOn(roomController, 'getRoomDetailsFromId')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/1/rooms/12');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetRoomDetailsFromId).toHaveBeenCalled();
        mgetRoomDetailsFromId.mockReset();
        expect(res.status).toEqual(200);
    });

    test('Should error out when non numeric hotel ID is passed', async () => {
        const mgetRoomDetailsFromId = jest
            .spyOn(roomController, 'getRoomDetailsFromId')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10AA/rooms/12');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetRoomDetailsFromId).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID and Room ID type should be number.');
    });

    test('Should error out when non numeric room ID is passed', async () => {
        const mgetRoomDetailsFromId = jest
            .spyOn(roomController, 'getRoomDetailsFromId')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms/12AA');
        expect(mcheckUserLoggedIn).toHaveBeenCalled();
        expect(mgetRoomDetailsFromId).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID and Room ID type should be number.');
    });
});
