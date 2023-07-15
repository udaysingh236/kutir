import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as rateController from '../controllers/rate.controller';
import * as roomController from '../controllers/room.controller';
import { IRates } from '../models/rates.model';
import * as helpers from '../utils/helpers';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/rates:
 *  get:
 *     tags:
 *     - Rates
 *     description: Get information of all the rate a hotel or pass a room number in query to get its details
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose rate details are required
 *      - in: query
 *        name: roomId
 *        required: false
 *        type: number
 *        description: room number
 *     responses:
 *       200:
 *         description: Information of all the rates a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: Rate's data not found for requested hotel ID.
 */
router.get('/:hotelId/rates', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'roomId')
    ) {
        const roomId = Number(req.query.roomId);
        if (Number.isNaN(hotelId) || Number.isNaN(roomId)) {
            logger.error(`Received invalid type of Hotel ID or Room ID, route ${req.url}`);
            return res.status(400).send('Hotel ID and Room ID type should be number.');
        }
        const rateDataRes = await rateController.getRoomRates(hotelId, roomId);
        if (rateDataRes.status === 200) {
            return res.status(rateDataRes.status).send(rateDataRes.rateData);
        } else {
            return res.status(rateDataRes.status).send('Not able to find rate data');
        }
    }
    const rateDataRes = await rateController.getAllRatesOfHotel(hotelId);
    if (rateDataRes.status === 200) {
        res.status(rateDataRes.status).send(rateDataRes.ratesData);
    } else {
        res.status(rateDataRes.status).send('Not able to find rate data');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/rate:
 *  post:
 *     tags:
 *     - Rates
 *     description: Create a rate for a hotel
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel.
 *     requestBody:
 *      description: The rate with its info to create.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/rate'
 *     responses:
 *       201:
 *         description: Rate created sucessfully.
 *       400:
 *         description: Received invalid rate body.
 *       500:
 *         description: Internal server error.
 * definitions:
 *   rate:
 *     type: object
 *     required:
 *       - roomId
 *       - perDayCharge
 *       - earlyCheckIn
 *       - lateCheckOut
 *       - extraMattress
 *     properties:
 *       roomId:
 *           type: number
 *       perDayCharge:
 *           type: number
 *       earlyCheckIn:
 *           type: number
 *       lateCheckOut:
 *           type: number
 *       extraMattress:
 *           type: number
 */
router.post('/:hotelId/rate', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    const rateBody: IRates = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (!helpers.validaterateBody(rateBody)) {
        logger.error(`Received invalid type of rate Body, route ${req.url}`);
        return res.status(400).send('Received invalid type of rate Body.');
    }
    // Check whether rate already exists in DB
    const couponInfo = await rateController.getRoomRates(hotelId, rateBody.roomId);
    if (couponInfo.status === 200) {
        return res.status(403).send('Rate already exists.');
    }
    // Check whether room id belongs to that hotel ID or not ?
    const roomDataRes = await roomController.getRoomDetailsFromId(hotelId, rateBody.roomId);
    if (roomDataRes.status !== 200) {
        return res.status(400).send('Room ID doesnot belongs to hotel ID.');
    }
    const createrateInfo = await rateController.createRate({
        hotelId: hotelId,
        roomId: rateBody.roomId,
        perDayCharge: rateBody.perDayCharge,
        earlyCheckIn: rateBody.earlyCheckIn,
        lateCheckOut: rateBody.lateCheckOut,
        extraMattress: rateBody.extraMattress
    });
    if (createrateInfo.status === 201) {
        res.status(createrateInfo.status).send('Rate created sucessfully..!!');
    } else {
        res.status(createrateInfo.status).send('Internal server error..!!');
    }
});

export default router;
