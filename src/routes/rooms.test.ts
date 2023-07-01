import request from 'supertest';
import app from '../app';
import * as roomController from '../controllers/room.controller';

describe('GET - Get information of all the rooms a hotel', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return information of all the rooms a hotel', async () => {
        const mgetHotelRoomsDetails = jest
            .spyOn(roomController, 'getHotelRoomsDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms');
        expect(mgetHotelRoomsDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
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
        expect(mgetRoomDetailsFromNumber).toHaveBeenCalled();
        expect(res.status).toEqual(200);
    });

    test('Should error out when non numeric room number passed in query string', async () => {
        jest.resetAllMocks();
        const mgetRoomDetailsFromNumber = jest
            .spyOn(roomController, 'getRoomDetailsFromNumber')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms?roomNum=102AA');
        expect(mgetRoomDetailsFromNumber).not.toHaveBeenCalled();
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID and Room Number type should be number.');
    });

    test('Should error out when non numeric hotel ID is passed', async () => {
        jest.resetAllMocks();
        const mgetHotelRoomsDetails = jest
            .spyOn(roomController, 'getHotelRoomsDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10AA/rooms');
        expect(mgetHotelRoomsDetails).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID type should be number.');
    });
});

describe('GET - Get information of a room by Hotel ID or Room ID', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return information about a room of a hotel', async () => {
        const mgetRoomDetailsFromId = jest
            .spyOn(roomController, 'getRoomDetailsFromId')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/1/rooms/12');
        expect(mgetRoomDetailsFromId).toHaveBeenCalled();
        expect(res.status).toEqual(200);
    });

    test('Should error out when non numeric hotel ID is passed', async () => {
        jest.resetAllMocks();
        const mgetRoomDetailsFromId = jest
            .spyOn(roomController, 'getRoomDetailsFromId')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10AA/rooms/12');
        expect(mgetRoomDetailsFromId).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID and Room ID type should be number.');
    });

    test('Should error out when non numeric room ID is passed', async () => {
        jest.resetAllMocks();
        const mgetRoomDetailsFromId = jest
            .spyOn(roomController, 'getRoomDetailsFromId')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/10/rooms/12AA');
        expect(mgetRoomDetailsFromId).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and double chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Hotel ID and Room ID type should be number.');
    });
});
