import { ICoupons } from '../models/coupons.model';
import { IVouchers } from '../models/vouchers.model';
import { IRates } from '../models/rates.model';
import { logger } from './logger';
import { IRateShopPayload, IReservationsPayload } from '../types/controller.types';

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

export function validateDates(checkIn: string, checkOut: string) {
    return (
        // Compare only dates not current time. Allow Reservation for today also
        new Date(checkIn) >= new Date(new Date().toDateString()) &&
        new Date(checkIn) < new Date(checkOut)
    );
}

export function validateRateShopBody(rateShopBody: IRateShopPayload): boolean {
    logger.debug(`Validating rate shop body,  ${JSON.stringify(rateShopBody)}`);
    if (
        Number.isNaN(rateShopBody.numOfPersons) ||
        Number.isNaN(rateShopBody.numOfextraMattress) ||
        !(
            Array.isArray(rateShopBody.roomIds) ||
            typeof rateShopBody.checkIn === 'string' ||
            typeof rateShopBody.checkOut === 'string'
        )
    ) {
        logger.debug(`Validation error in numOfPersons numOfextraMattress`);
        return false;
    }
    if (
        Object.prototype.hasOwnProperty.call(rateShopBody, 'voucherCode') &&
        typeof rateShopBody.voucherCode !== 'string'
    ) {
        logger.debug(`Validation error in voucherCode`);
        return false;
    }
    if (
        Object.prototype.hasOwnProperty.call(rateShopBody, 'couponCode') &&
        typeof rateShopBody.couponCode !== 'string'
    ) {
        logger.debug(`Validation error in couponCode`);
        return false;
    }
    return validateDates(rateShopBody.checkIn, rateShopBody.checkOut);
}

export function validateEmail(email: string): boolean {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
    );
}

export function validateReservationBody(reservationBody: IReservationsPayload): boolean {
    logger.debug(`Validating rate shop body,  ${JSON.stringify(reservationBody)}`);
    if (!validateRateShopBody(reservationBody)) {
        return false;
    }
    if (
        typeof reservationBody.firstName !== 'string' ||
        typeof reservationBody.lastName !== 'string' ||
        typeof reservationBody.email !== 'string' ||
        Number.isNaN(reservationBody.phoneNum) ||
        Number.isNaN(reservationBody.identityNum)
    ) {
        return false;
    }

    if (
        !(
            Object.prototype.hasOwnProperty.call(reservationBody, 'paymentDetails') &&
            Object.prototype.hasOwnProperty.call(
                reservationBody.paymentDetails,
                'advancePayment'
            ) &&
            Object.prototype.hasOwnProperty.call(
                reservationBody.paymentDetails,
                'advancePaymentMode'
            )
        )
    ) {
        return false;
    }

    return validateEmail(reservationBody.email);
}
