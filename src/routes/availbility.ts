import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as availabilityController from '../controllers/availability.controller';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/availability:
 *  get:
 *     tags:
 *     - Availability
 *     description: Get availability of all the rooms of a hotel
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *      - in: query
 *        name: fromDate
 *        required: true
 *        type: string
 *        description: Check In date
 *      - in: query
 *        name: toDate
 *        required: true
 *        type: string
 *        description: Check Out date
 *     responses:
 *       200:
 *         description: Availability of all the rooms of a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: Availability Data not found for requested hotel ID.
 */
router.get('/:hotelId/availability', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'fromDate') &&
        Object.prototype.hasOwnProperty.call(req.query, 'toDate')
    ) {
        const fromDate = String(req.query.fromDate).trim();
        const toDate = String(req.query.toDate).trim();
        const availabilityDataRes = await availabilityController.getAllAvailableRooms(
            hotelId,
            fromDate,
            toDate
        );
        if (availabilityDataRes.status === 200) {
            return res
                .status(availabilityDataRes.status)
                .send(availabilityDataRes.availabilityData);
        } else {
            return res.status(availabilityDataRes.status).send('Not able to find available rooms');
        }
    }
    res.status(400).send('Received invalid parameters');
});

export default router;
