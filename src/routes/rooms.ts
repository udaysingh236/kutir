import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as roomController from '../controllers/room.controller';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/rooms:
 *  get:
 *     tags:
 *     - Rooms
 *     description: Get information of all the rooms a hotel or pass a room number in query to get its details
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose room details are required
 *      - in: query
 *        name: roomNum
 *        required: false
 *        type: integer
 *        description: Number of the room
 *     responses:
 *       200:
 *         description: Information of all the rooms of a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: Data not found for requested hotel ID.
 */
router.get('/:hotelId/rooms', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'roomNum')
    ) {
        const roomNum = Number(req.query.roomNum);
        if (Number.isNaN(hotelId) || Number.isNaN(roomNum)) {
            logger.error(`Received invalid type of Hotel ID or Room Number, route ${req.url}`);
            return res.status(400).send('Hotel ID and Room Number type should be number.');
        }
        const roomDataRes = await roomController.getRoomDetailsFromNumber(hotelId, roomNum);
        if (roomDataRes.status === 200) {
            return res.status(roomDataRes.status).send(roomDataRes.roomData);
        } else {
            return res.status(roomDataRes.status).send('Not able to find room data');
        }
    }
    const roomsDataRes = await roomController.getHotelRoomsDetails(hotelId);
    if (roomsDataRes.status === 200) {
        res.status(roomsDataRes.status).send(roomsDataRes.hotelRoomsData);
    } else {
        res.status(roomsDataRes.status).send('Not able to find rooms data');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/rooms/{roomId}:
 *  get:
 *     tags:
 *     - Rooms
 *     description: Get information of a room by Hotel ID or Room ID
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose room details are required
 *      - in: path
 *        name: roomId
 *        required: true
 *        type: integer
 *        description: The id of the room
 *     responses:
 *       200:
 *         description: Information of Room
 *       400:
 *         description: Received invalid type of Hotel ID or Room ID
 *       404:
 *         description: Data not found for requested Hotel ID or Room ID
 */
router.get('/:hotelId/rooms/:roomId', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    const roomId = Number(req.params.roomId);
    if (Number.isNaN(hotelId) || Number.isNaN(roomId)) {
        logger.error(`Received invalid type of Hotel ID or Room ID, route ${req.url}`);
        return res.status(400).send('Hotel ID and Room ID type should be number.');
    }
    const roomDataRes = await roomController.getRoomDetailsFromId(hotelId, roomId);
    if (roomDataRes.status === 200) {
        res.status(roomDataRes.status).send(roomDataRes.roomData);
    } else {
        res.status(roomDataRes.status).send('Not able to find room data');
    }
});

export default router;
