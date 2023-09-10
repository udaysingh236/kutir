import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as reservationController from '../controllers/reservation.controller';
import * as helpers from '../utils/helpers';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/reservation:
 *  get:
 *     tags:
 *     - Reservation
 *     description: Get reservations a hotel, either by a date range or today's reservations.
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *      - in: query
 *        name: rangeFrom
 *        required: false
 *        type: string
 *        description: Start date range
 *      - in: query
 *        name: rangeTo
 *        required: false
 *        type: string
 *        description: End date range
 *      - in: query
 *        name: todayRes
 *        required: false
 *        type: string
 *        description: Today's date as reservation date
 *      - in: query
 *        name: specificDate
 *        required: false
 *        type: string
 *        description: specific date as reservation date
 *     responses:
 *       200:
 *         description: Reservations of a hotel
 *       400:
 *         description: Received invalid parameters
 *       404:
 *         description: Reservation Data not found for requested hotel ID.
 */
router.get('/:hotelId/reservation', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'rangeFrom') &&
        Object.prototype.hasOwnProperty.call(req.query, 'rangeTo')
    ) {
        const fromDate = String(req.query.rangeFrom).trim();
        const toDate = String(req.query.rangeTo).trim();
        const reservationDataRes = await reservationController.getAllResByRange(
            hotelId,
            fromDate,
            toDate
        );
        if (reservationDataRes.status === 200) {
            return res.status(reservationDataRes.status).send(reservationDataRes.reservationsData);
        } else {
            return res.status(reservationDataRes.status).send('Not able to find reservation');
        }
    } else if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'specificDate')
    ) {
        const resDate = String(req.query.specificDate).trim();
        const reservationDataRes = await reservationController.getAllResByDate(hotelId, resDate);
        if (reservationDataRes.status === 200) {
            return res.status(reservationDataRes.status).send(reservationDataRes.reservationsData);
        } else {
            return res.status(reservationDataRes.status).send('Not able to find reservation');
        }
    } else if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'todayRes')
    ) {
        if (req.query.todayRes !== 'true') {
            logger.error(`Received invalid input of todayRes, route ${req.url}`);
            return res.status(400).send('todayRes should be true.');
        }
        const currDate = new Date().toISOString().split('T')[0]; //YYYY-MM-DD
        const reservationDataRes = await reservationController.getAllResByDate(hotelId, currDate);
        if (reservationDataRes.status === 200) {
            return res.status(reservationDataRes.status).send(reservationDataRes.reservationsData);
        } else {
            return res.status(reservationDataRes.status).send('Not able to find reservation');
        }
    } else {
        const reservationDataRes = await reservationController.getAllActiveResOfHotel(hotelId);
        if (reservationDataRes.status === 200) {
            return res.status(reservationDataRes.status).send(reservationDataRes.reservationsData);
        } else {
            return res.status(reservationDataRes.status).send('Not able to find reservation');
        }
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/reservation/rateShop:
 *  post:
 *     tags:
 *     - Reservation
 *     description: Get estimate of the charges before reservation or direct check out.
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *     requestBody:
 *      description: The reservation information for rate shop.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/RateShop'
 *     responses:
 *       200:
 *         description: Reservation charges information.
 *       400:
 *         description: Received invalid request body.
 *       500:
 *         description: Internal server error.
 * definitions:
 *   RateShop:
 *     type: object
 *     required:
 *       - roomIds
 *       - checkIn
 *       - checkOut
 *       - numOfPersons
 *       - numOfextraMattress
 *     properties:
 *       roomIds:
 *           type: array
 *           items:
 *               type: number
 *       checkIn:
 *           type: string
 *       checkOut:
 *           type: string
 *       couponCode:
 *           type: string
 *       voucherCode:
 *           type: string
 *       numOfPersons:
 *           type: number
 *       numOfextraMattress:
 *           type: number
 */
router.post('/:hotelId/reservation/rateShop', async (req: Request, res: Response) => {
    const hotelId = Number(req.params.hotelId);
    const rateShopBody = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (!helpers.validateRateShopBody(rateShopBody)) {
        logger.error(`Received invalid type of rate shop Body, route ${req.url}`);
        return res.status(400).send('Received invalid type of rate shop Body.');
    }
    const rateShopDataRes = await reservationController.doRateShoping(hotelId, rateShopBody);
    if (rateShopDataRes.status === 200) {
        return res.status(rateShopDataRes.status).send(rateShopDataRes.rateShopResponse);
    } else {
        return res.status(rateShopDataRes.status).send('Not able to do rate shop');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/reservation:
 *  post:
 *     tags:
 *     - Reservation
 *     description: Create Reservation.
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *     requestBody:
 *      description: The reservation information.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/Reservation'
 *     responses:
 *       201:
 *         description: Reservation created sucessfully
 *       400:
 *         description: Received invalid request body.
 *       500:
 *         description: Internal server error.
 * definitions:
 *   Reservation:
 *     type: object
 *     required:
 *       - roomIds
 *       - checkIn
 *       - checkOut
 *       - numOfPersons
 *       - firstName
 *       - lastName
 *       - email
 *       - phoneNum
 *       - identityNum
 *       - paymentDetails
 *     properties:
 *       roomIds:
 *           type: array
 *           items:
 *               type: number
 *       checkIn:
 *           type: string
 *       checkOut:
 *           type: string
 *       couponCode:
 *           type: string
 *       voucherCode:
 *           type: string
 *       numOfPersons:
 *           type: number
 *       numOfextraMattress:
 *           type: number
 *       firstName:
 *           type: string
 *       lastName:
 *           type: string
 *       email:
 *           type: string
 *       phoneNum:
 *           type: string
 *       identityNum:
 *           type: string
 *       paymentDetails:
 *           type: object
 *           properties:
 *             advancePayment:
 *               type: number
 *             advancePaymentMode:
 *               type: string
 */
router.post('/:hotelId/reservation', async (req: Request, res: Response) => {
    const hotelId = Number(req.params.hotelId);
    const reservationBody = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (!helpers.validateReservationBody(reservationBody)) {
        logger.error(`Received invalid type of reservation Body, route ${req.url}`);
        return res.status(400).send('Received invalid type of reservation Body.');
    }
    const reservationDataRes = await reservationController.createRes(hotelId, reservationBody);
    if (reservationDataRes.status === 201) {
        return res.status(reservationDataRes.status).send(reservationDataRes.createReservationRes);
    } else {
        return res.status(reservationDataRes.status).send('Not able to create reservations');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/reservation/{reservationId}/checkIn:
 *  post:
 *     tags:
 *     - Reservation
 *     description: Check In a Reservation.
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *      - in: path
 *        name: reservationId
 *        required: true
 *        type: string
 *        description: The id of Reservation
 *     responses:
 *       201:
 *         description: Reservation created sucessfully
 *       400:
 *         description: Received invalid request body.
 *       500:
 *         description: Internal server error.
 */
router.post('/:hotelId/reservation/:reservationId/checkIn', async (req: Request, res: Response) => {
    const hotelId = Number(req.params.hotelId);
    const reservationId = req.params.reservationId;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (typeof reservationId !== 'string') {
        logger.error(`Received invalid type of reservationId ID, route ${req.url}`);
        return res.status(400).send('Reservation ID type should be number.');
    }
    const checkInDataRes = await reservationController.doResCheckIn(hotelId, reservationId);
    if (checkInDataRes.status === 201) {
        return res.status(checkInDataRes.status).send(checkInDataRes.checkInMsg);
    } else {
        return res.status(checkInDataRes.status).send(checkInDataRes.checkInMsg);
    }
});

export default router;
