import Coupons, { ICoupons } from '../models/coupons.model';
import { logger } from '../utils/logger';
import { ICouponsData, ICouponData } from '../types/controller.types';

export async function getAllCouponsOfHotel(hotelId: number): Promise<ICouponsData> {
    try {
        const couponsData: Array<ICoupons> = await Coupons.find({ hotelId: hotelId });
        if (Object.keys(couponsData[0] ?? {}).length === 0) {
            logger.info(`Not able to find coupons for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            couponsData: couponsData
        };
    } catch (error) {
        logger.error(`Error in getAllCouponsOfHotel, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getCouponInfo(hotelId: number, couponCode: string): Promise<ICouponData> {
    try {
        const couponData: ICoupons | null = await Coupons.findOne({
            hotelId: hotelId,
            couponCode: couponCode
        });
        if (Object.keys(couponData ?? {}).length === 0) {
            logger.info(
                `Not able to find coupon's info for hotel ID ${hotelId} and coupon code ${couponCode}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            couponData: couponData
        };
    } catch (error) {
        logger.error(`Error in getCouponInfo, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function createCoupon(
    hotelId: number,
    couponCode: string,
    discount: number
): Promise<ICouponData> {
    try {
        await Coupons.create({
            hotelId: hotelId,
            couponCode: couponCode,
            discountPer: discount,
            isValid: true
        });
        return { status: 201 };
    } catch (error) {
        logger.error(`Error in createCoupon, error is ${error}`);
        return {
            status: 500
        };
    }
}
