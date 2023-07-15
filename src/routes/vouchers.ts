import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as voucherController from '../controllers/voucher.controller';
import { IVouchers } from '../models/vouchers.model';
import * as helpers from '../utils/helpers';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/vouchers:
 *  get:
 *     tags:
 *     - Voucher
 *     description: Get information of all the voucher a hotel or pass a voucher code in query to get its details
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose voucher details are required
 *      - in: query
 *        name: voucherCode
 *        required: false
 *        type: string
 *        description: voucher code
 *     responses:
 *       200:
 *         description: Information of all the vouchers a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: voucher Data not found for requested hotel ID.
 */
router.get('/:hotelId/vouchers', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'voucherCode')
    ) {
        const voucherCode = String(req.query.voucherCode).trim();
        const voucherDataRes = await voucherController.getVoucherInfo(hotelId, voucherCode);
        if (voucherDataRes.status === 200) {
            return res.status(voucherDataRes.status).send(voucherDataRes.voucherData);
        } else {
            return res.status(voucherDataRes.status).send('Not able to find voucher data');
        }
    }
    const voucherDataRes = await voucherController.getAllVouchersOfHotel(hotelId);
    if (voucherDataRes.status === 200) {
        res.status(voucherDataRes.status).send(voucherDataRes.vouchersData);
    } else {
        res.status(voucherDataRes.status).send('Not able to find voucher data');
    }
});

/**
 * @openapi
 * /v1/hotels/{hotelId}/voucher:
 *  post:
 *     tags:
 *     - Voucher
 *     description: Create a voucher for a hotel
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel.
 *     requestBody:
 *      description: The voucher with its info to create.
 *      required: true
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/definitions/Voucher'
 *     responses:
 *       201:
 *         description: Voucher created sucessfully.
 *       400:
 *         description: Received invalid voucher body.
 *       500:
 *         description: Internal server error.
 * definitions:
 *   Voucher:
 *     type: object
 *     required:
 *       - voucherCode
 *       - amount
 *     properties:
 *       voucherCode:
 *           type: string
 *       amount:
 *           type: number
 */
router.post('/:hotelId/voucher', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    const voucherBody: IVouchers = req.body;
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (!helpers.validateVoucherBody(voucherBody)) {
        logger.error(`Received invalid type of voucher Body, route ${req.url}`);
        return res.status(400).send('Received invalid type of voucher Body.');
    }
    // Check whether voucher already exists in DB
    const couponInfo = await voucherController.getVoucherInfo(hotelId, voucherBody.voucherCode);
    if (couponInfo.status === 200) {
        return res.status(403).send('Voucher already exists.');
    }
    const createVoucherInfo = await voucherController.createVoucher(
        hotelId,
        voucherBody.voucherCode,
        voucherBody.amount
    );
    if (createVoucherInfo.status === 201) {
        res.status(createVoucherInfo.status).send('Voucher created sucessfully..!!');
    } else {
        res.status(createVoucherInfo.status).send('Internal server error..!!');
    }
});

export default router;
