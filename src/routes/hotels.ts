import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as hotelController from '../controllers/hotel.contoller';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels:
 *  get:
 *     tags:
 *     - Hotels
 *     description: Get information of all the hotels
 *     responses:
 *       200:
 *         description: Information of all the rooms and employees of all the hotels
 */
router.get('/', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const allHotelsDataRes = await hotelController.getAllHotelsDetails();
    if (allHotelsDataRes.status === 200) {
        res.status(allHotelsDataRes.status).send(allHotelsDataRes.allHotelsData);
    } else {
        res.status(allHotelsDataRes.status).send('Not able to find hotel Data');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}:
 *  get:
 *     tags:
 *     - Hotels
 *     description: Get information of a hotel
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose details are required
 *     responses:
 *       200:
 *         description: Information of all the rooms and employees of a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: Data not found for requested hotel ID.
 */
router.get('/:hotelId', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    const hotelDataRes = await hotelController.getHotelDetails(hotelId);
    if (hotelDataRes.status === 200) {
        res.status(hotelDataRes.status).send(hotelDataRes.hotelData);
    } else {
        res.status(hotelDataRes.status).send('Not able to find hotel Data');
    }
});

export default router;
