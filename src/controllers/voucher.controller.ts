import Vouchers, { IVouchers } from '../models/vouchers.model';
import { logger } from '../utils/logger';
import { IVouchersData, IVoucherData } from '../types/controller.types';

export async function getAllVouchersOfHotel(hotelId: number): Promise<IVouchersData> {
    try {
        const vouchersData: Array<IVouchers> = await Vouchers.find({ hotelId: hotelId });
        if (Object.keys(vouchersData[0] ?? {}).length === 0) {
            logger.info(`Not able to find vouchers for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            vouchersData: vouchersData
        };
    } catch (error) {
        logger.error(`Error in getAllVouchersOfHotel, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getVoucherInfo(hotelId: number, voucherCode: string): Promise<IVoucherData> {
    try {
        const voucherData: IVouchers | null = await Vouchers.findOne({
            hotelId: hotelId,
            voucherCode: voucherCode
        });
        if (Object.keys(voucherData ?? {}).length === 0) {
            logger.info(
                `Not able to find voucher's info for hotel ID ${hotelId} and voucher code ${voucherCode}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            voucherData: voucherData
        };
    } catch (error) {
        logger.error(`Error in getVoucherInfo, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function createVoucher(
    hotelId: number,
    voucherCode: string,
    amount: number
): Promise<IVoucherData> {
    try {
        await Vouchers.create({
            hotelId: hotelId,
            voucherCode: voucherCode,
            amount: amount,
            isValid: true
        });
        return { status: 201 };
    } catch (error) {
        logger.error(`Error in createVoucher, error is ${error}`);
        return {
            status: 500
        };
    }
}
