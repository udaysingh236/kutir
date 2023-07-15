import { ICoupons } from '../models/coupons.model';
import { IVouchers } from '../models/vouchers.model';
import { IRates } from '../models/rates.model';
import { logger } from './logger';

export function validateCouponBody(couponBody: ICoupons): boolean {
    logger.debug(`Validating coupon body,  ${JSON.stringify(couponBody)}`);
    if (Number.isNaN(couponBody.discountPer)) {
        return false;
    }
    return true;
}

export function validateVoucherBody(voucherBody: IVouchers): boolean {
    logger.debug(`Validating voucher body,  ${JSON.stringify(voucherBody)}`);
    if (Number.isNaN(voucherBody.amount)) {
        return false;
    }
    return true;
}

export function validaterateBody(rateBody: IRates): boolean {
    logger.debug(`Validating rate body,  ${JSON.stringify(rateBody)}`);
    if (
        Number.isNaN(rateBody.roomId) ||
        Number.isNaN(rateBody.perDayCharge) ||
        Number.isNaN(rateBody.earlyCheckIn) ||
        Number.isNaN(rateBody.lateCheckOut) ||
        Number.isNaN(rateBody.extraMattress)
    ) {
        return false;
    }
    return true;
}
