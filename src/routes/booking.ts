import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as bookingController from '../controllers/booking.controller';
import * as helpers from '../utils/helpers';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/booking:
 *  get:
 *     tags:
 *     - Booking
 *     description: Get bookings a hotel, either by a date range or today's bookings.
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
 *        name: todayBooking
 *        required: false
 *        type: string
 *        description: Today's date as booking date
 *      - in: query
 *        name: specificDate
 *        required: false
 *        type: string
 *        description: specific date as booking date
 *     responses:
 *       200:
 *         description: Bookings of a hotel
 *       400:
 *         description: Received invalid parameters
 *       404:
 *         description: Bookings Data not found for requested hotel ID.
 */
router.get('/:hotelId/booking', async (req: Request, res: Response) => {
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
        const bookingDataRes = await bookingController.getAllBookingByRange(
            hotelId,
            fromDate,
            toDate
        );
        if (bookingDataRes.status === 200) {
            return res.status(bookingDataRes.status).send(bookingDataRes.bookingsData);
        } else {
            return res.status(bookingDataRes.status).send('Not able to find booking');
        }
    } else if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'specificDate')
    ) {
        const bookingDate = String(req.query.specificDate).trim();
        const bookingDataRes = await bookingController.getAllbookingByDate(hotelId, bookingDate);
        if (bookingDataRes.status === 200) {
            return res.status(bookingDataRes.status).send(bookingDataRes.bookingsData);
        } else {
            return res.status(bookingDataRes.status).send('Not able to find booking');
        }
    } else if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'todayBooking')
    ) {
        if (req.query.todayBooking !== 'true') {
            logger.error(`Received invalid input of todayBooking, route ${req.url}`);
            return res.status(400).send('todayBooking should be true.');
        }
        const currDate = new Date().toISOString().split('T')[0]; //YYYY-MM-DD
        const bookingDataRes = await bookingController.getAllbookingByDate(hotelId, currDate);
        if (bookingDataRes.status === 200) {
            return res.status(bookingDataRes.status).send(bookingDataRes.bookingsData);
        } else {
            return res.status(bookingDataRes.status).send('Not able to find booking');
        }
    } else {
        const bookingDataRes = await bookingController.getAllActiveBookingsOfHotel(hotelId);
        if (bookingDataRes.status === 200) {
            return res.status(bookingDataRes.status).send(bookingDataRes.bookingsData);
        } else {
            return res.status(bookingDataRes.status).send('Not able to find reservation');
        }
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/booking:
 *  post:
 *     tags:
 *     - Booking
 *     description: Create Booking.
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *     requestBody:
 *      description: The Booking information.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/Reservation'
 *     responses:
 *       201:
 *         description: Booking created sucessfully
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
router.post('/:hotelId/booking', async (req: Request, res: Response) => {
    const hotelId = Number(req.params.hotelId);
    const bookingInfo = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (!helpers.validateReservationBody(bookingInfo)) {
        logger.error(`Received invalid type of booking Body, route ${req.url}`);
        return res.status(400).send('Received invalid type of booking Body.');
    }
    const bookingDataRes = await bookingController.createBooking(hotelId, bookingInfo);
    if (bookingDataRes.status === 201) {
        return res.status(bookingDataRes.status).send(bookingDataRes.createBookingRes);
    } else {
        return res.status(bookingDataRes.status).send('Not able to create booking');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/booking/{bookingId}/checkOut:
 *  post:
 *     tags:
 *     - Booking
 *     description: Check Out a Booking.
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *      - in: path
 *        name: bookingId
 *        required: true
 *        type: string
 *        description: The id of booking
 *     requestBody:
 *      description: The Booking information.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/CheckOutInfo'
 *     responses:
 *       201:
 *         description: Booking created sucessfully
 *       400:
 *         description: Received invalid request body.
 *       500:
 *         description: Internal server error.
 * definitions:
 *   CheckOutInfo:
 *     type: object
 *     required:
 *       - checkOut
 *     properties:
 *       checkOut:
 *           type: string
 *       couponCode:
 *           type: string
 *       voucherCode:
 *           type: string
 */
router.post('/:hotelId/booking/:bookingId/checkOut', async (req: Request, res: Response) => {
    const hotelId = Number(req.params.hotelId);
    const bookingId = req.params.bookingId;
    const checkOutPayload = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (typeof bookingId !== 'string') {
        logger.error(`Received invalid type of bookingId ID, route ${req.url}`);
        return res.status(400).send('Booking ID type should be number.');
    }
    const checkOutDataRes = await bookingController.doCheckOut(hotelId, bookingId, checkOutPayload);
    if (checkOutDataRes.status === 201) {
        return res.status(checkOutDataRes.status).send(checkOutDataRes.checkOutMsg);
    } else {
        return res.status(checkOutDataRes.status).send(checkOutDataRes.checkOutMsg);
    }
});

export default router;
