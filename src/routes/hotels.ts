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
        res.status(allHotelsDataRes.status);
    }
});

export default router;
