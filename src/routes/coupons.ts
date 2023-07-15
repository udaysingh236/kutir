import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ICoupons } from '../models/coupons.model';
import * as couponController from '../controllers/coupon.controller';
import * as helpers from '../utils/helpers';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/coupons:
 *  get:
 *     tags:
 *     - Coupons
 *     description: Get information of all the coupons a hotel or pass a coupon code in query to get its details
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose coupon details are required
 *      - in: query
 *        name: couponCode
 *        required: false
 *        type: string
 *        description: Coupon code
 *     responses:
 *       200:
 *         description: Information of all the coupons a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: Coupon Data not found for requested hotel ID.
 */
router.get('/:hotelId/coupons', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'couponCode')
    ) {
        const couponCode = String(req.query.couponCode).trim();
        const couponDataRes = await couponController.getCouponInfo(hotelId, couponCode);
        if (couponDataRes.status === 200) {
            return res.status(couponDataRes.status).send(couponDataRes.couponData);
        } else {
            return res.status(couponDataRes.status).send('Not able to find coupon data');
        }
    }
    const couponDataRes = await couponController.getAllCouponsOfHotel(hotelId);
    if (couponDataRes.status === 200) {
        res.status(couponDataRes.status).send(couponDataRes.couponsData);
    } else {
        res.status(couponDataRes.status).send('Not able to find coupon data');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/coupon:
 *  post:
 *     tags:
 *     - Coupons
 *     description: Create a coupon for a hotel
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel
 *     requestBody:
 *      description: The coupon with its info to create.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/Coupon'
 *     responses:
 *       201:
 *         description: Coupon created sucessfully.
 *       400:
 *         description: Received invalid coupon body.
 *       500:
 *         description: Internal server error.
 * definitions:
 *   Coupon:
 *     type: object
 *     required:
 *       - couponCode
 *       - discountPer
 *     properties:
 *       couponCode:
 *           type: string
 *       discountPer:
 *           type: number
 */
router.post('/:hotelId/coupon', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    const couponBody: ICoupons = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (!helpers.validateCouponBody(couponBody)) {
        logger.error(`Received invalid type of Coupon Body, route ${req.url}`);
        return res.status(400).send('Received invalid type of Coupon Body.');
    }
    // Check whether coupon already exists in DB
    const couponInfo = await couponController.getCouponInfo(hotelId, couponBody.couponCode);
    if (couponInfo.status === 200) {
        return res.status(403).send('Coupon already exists.');
    }
    const createCouponInfo = await couponController.createCoupon(
        hotelId,
        couponBody.couponCode,
        couponBody.discountPer
    );
    if (createCouponInfo.status === 201) {
        res.status(createCouponInfo.status).send('Coupon created sucessfully..!!');
    } else {
        res.status(createCouponInfo.status).send('Internal server error..!!');
    }
});

export default router;
