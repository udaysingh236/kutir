import Reservations, { IReservations } from '../models/reservations.model';
import Guests from '../models/guests.model';
import Availability from '../models/availability.models';
import * as availabilityController from './availability.controller';
import * as rateController from './rate.controller';
import * as voucherController from './voucher.controller';
import * as couponController from './coupon.controller';
import { logger } from '../utils/logger';
import {
    IReservationsData,
    IRateShopPayload,
    IReservationsPayload,
    IRateShopResponse,
    IRateShopSchema,
    IReservationSchema
} from '../types/controller.types';

export async function getAllActiveResOfHotel(hotelId: number): Promise<IReservationsData> {
    try {
        const currDate = new Date().toISOString().split('T')[0]; //YYYY-MM-DD
        const reservationsData: Array<IReservations> = await Reservations.find({
            hotelId: hotelId,
            checkIn: { $gte: new Date(currDate) }
        });
        if (Object.keys(reservationsData[0] ?? {}).length === 0) {
            logger.info(`Not able to find reservations for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            reservationsData: reservationsData
        };
    } catch (error) {
        logger.error(`Error in getAllActiveResOfHotel, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getAllResByRange(
    hotelId: number,
    fromDate: Date,
    toDate: Date
): Promise<IReservationsData> {
    try {
        const formatFromDate = new Date(fromDate).toISOString().split('T')[0]; //YYYY-MM-DD
        const formatToDate = new Date(toDate).toISOString().split('T')[0]; //YYYY-MM-DD
        const reservationsData: Array<IReservations> = await Reservations.find({
            hotelId: hotelId,
            checkIn: { $gte: new Date(formatFromDate), $lte: new Date(formatToDate) }
        });
        if (Object.keys(reservationsData[0] ?? {}).length === 0) {
            logger.info(
                `Not able to find reservations for hotel ID ${hotelId} from range ${formatFromDate} - ${formatToDate}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            reservationsData: reservationsData
        };
    } catch (error) {
        logger.error(`Error in getAllResByRange, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getAllResByDate(hotelId: number, resDate: Date): Promise<IReservationsData> {
    try {
        const formatResDate = new Date(resDate).toISOString().split('T')[0]; //YYYY-MM-DD
        const reservationsData: Array<IReservations> = await Reservations.find({
            hotelId: hotelId,
            checkIn: new Date(formatResDate)
        });
        if (Object.keys(reservationsData[0] ?? {}).length === 0) {
            logger.info(
                `Not able to find reservations for hotel ID ${hotelId} on date ${formatResDate}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            reservationsData: reservationsData
        };
    } catch (error) {
        logger.error(`Error in getAllResByDate, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function doRateShoping(
    hotelId: number,
    rateShopInfo: IRateShopPayload
): Promise<IRateShopResponse> {
    try {
        // First the check the availability of the Room for given date range again:
        const fromDate = new Date(rateShopInfo.checkIn).toISOString().split('T')[0]; //YYYY-MM-DD
        const toDate = new Date(rateShopInfo.checkOut).toISOString().split('T')[0]; //YYYY-MM-DD
        for (let index = 0; index < rateShopInfo.roomIds.length; index++) {
            const roomAvailbility = await availabilityController.getAvailbilityByRoom(
                hotelId,
                rateShopInfo.roomIds[index],
                fromDate,
                toDate
            );
            if (roomAvailbility.status !== 200) {
                logger.error(
                    `Error while creating rate shop, room id ${rateShopInfo.roomIds[index]} is not available from range ${fromDate} - ${toDate}`
                );
                return {
                    status: 500
                };
            }
        }
        // parallelly build reservation schema.
        const rateShopResponse: IRateShopSchema = {
            hotelId: hotelId,
            roomIds: [...rateShopInfo.roomIds],
            checkIn: new Date(rateShopInfo.checkIn),
            checkOut: new Date(rateShopInfo.checkOut),
            couponCode: rateShopInfo.couponCode ?? undefined,
            voucherCode: rateShopInfo.voucherCode ?? undefined,
            numOfPersons: rateShopInfo.numOfPersons,
            numOfextraMattress: rateShopInfo.numOfextraMattress,
            rates: {
                perDayCharge: 0,
                earlyCheckIn: 0,
                lateCheckOut: 0,
                extraMattress: 0
            },
            chargesDetails: {
                totalNumDays: 0,
                earlyCheckIn: undefined,
                waiveEarlyCheckInRates: undefined,
                waiveLateCheckOutRates: undefined,
                lateCheckOut: undefined,
                extraMattress: 0,
                couponDisPercentage: 0,
                voucherAmount: 0
            }
        };
        // Fetch the rates again for room ids and we will use these rates during checkout.
        for (let index = 0; index < rateShopInfo.roomIds.length; index++) {
            const roomRates = await rateController.getRoomRates(
                hotelId,
                rateShopInfo.roomIds[index]
            );
            if (roomRates.status !== 200) {
                throw new Error(`Rate not found for room ID ${rateShopInfo.roomIds[index]}`);
            }
            rateShopResponse.rates.perDayCharge += roomRates.rateData?.perDayCharge ?? 0;
            // Below values are same for all the rooms.
            rateShopResponse.rates.earlyCheckIn = roomRates.rateData?.earlyCheckIn ?? 0;
            rateShopResponse.rates.lateCheckOut = roomRates.rateData?.lateCheckOut ?? 0;
            rateShopResponse.rates.extraMattress = roomRates.rateData?.extraMattress ?? 0;
        }

        // Lets calulate number of days
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(
            Math.abs((+rateShopResponse.checkOut - +rateShopResponse.checkIn) / oneDay)
        );
        if (diffDays <= 0) {
            logger.error(
                `Error while creating rate shop, date diff is ${diffDays} from range ${fromDate} - ${toDate}`
            );
            return {
                status: 500
            };
        }
        rateShopResponse.chargesDetails.totalNumDays = diffDays;
        rateShopResponse.chargesDetails.extraMattress =
            rateShopResponse.rates.extraMattress * rateShopInfo.numOfextraMattress;
        // check voucher
        if (rateShopInfo.voucherCode) {
            const voucherData = await voucherController.getVoucherInfo(
                hotelId,
                rateShopInfo.voucherCode
            );
            if (voucherData.status === 200) {
                rateShopResponse.chargesDetails.voucherAmount = voucherData.voucherData?.isValid
                    ? voucherData.voucherData?.amount
                    : 0;
            }
        }
        // check coupon
        if (rateShopInfo.couponCode) {
            const couponData = await couponController.getCouponInfo(
                hotelId,
                rateShopInfo.couponCode
            );
            if (couponData.status === 200) {
                rateShopResponse.chargesDetails.voucherAmount = couponData.couponData?.isValid
                    ? couponData.couponData?.discountPer
                    : 0;
            }
        }
        return {
            status: 200,
            rateShopResponse
        };
    } catch (error) {
        logger.error(`Error in doRateShoping, error is ${error}`);
        return {
            status: 500
        };
    }
}

export async function createRes(hotelId: number, resInfo: IReservationsPayload) {
    // start a session and do rest of the DB operations through it.
    const session = await Reservations.startSession();
    try {
        const rateShopResponse: IRateShopResponse = await doRateShoping(hotelId, resInfo);
        if (rateShopResponse.status !== 200) {
            throw new Error('Error doing rate shopping');
        }
        const reservationSchema: IReservationSchema = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...rateShopResponse.rateShopResponse!,
            guestId: '',
            currentStatus: '',
            confirmationType: '',
            paymentDetails: {
                advancePayment: 0,
                advancePaymentMode: ''
            }
        };

        session.startTransaction();
        // create the guest profile and do the reservation
        const createGuestData = await Guests.create(
            {
                hotelId: hotelId,
                firstName: resInfo.firstName,
                lastName: resInfo.lastName,
                email: resInfo.email,
                phoneNum: resInfo.phoneNum,
                identityNum: resInfo.identityNum
            },
            { session }
        );
        logger.info(`createGuestData ${JSON.stringify(createGuestData)}`);
        reservationSchema.guestId = '123'; //For NOW
        if (resInfo.paymentDetails.advancePayment >= 0) {
            reservationSchema.paymentDetails.advancePayment = resInfo.paymentDetails.advancePayment;
            reservationSchema.paymentDetails.advancePaymentMode =
                resInfo.paymentDetails.advancePaymentMode;
            reservationSchema.confirmationType = 'GREEN';
        }
        reservationSchema.currentStatus = 'ACTIVE';

        // Finally insert into reservation table
        const createReservationRes = await Reservations.create([reservationSchema], { session });
        logger.info(`createReservationRes ${JSON.stringify(createReservationRes)}`);
        // "updateRes: {\"acknowledged\":true,\"modifiedCount\":0,\"upsertedId\":\"64bd6a97809283f12deed657\",\"upsertedCount\":1,\"matchedCount\":0}"}
        // Update the availbility table
        const fromDate = new Date(resInfo.checkIn);
        const toDate = new Date(resInfo.checkOut);
        for (let index = 0; index < resInfo.roomIds.length; index++) {
            await Availability.updateOne(
                { roomId: resInfo.roomIds[index], hotelId: hotelId },
                {
                    $push: {
                        reservations: {
                            restoDate: toDate,
                            resfromDate: fromDate,
                            resType: reservationSchema.confirmationType,
                            reservationId: '12345'
                        }
                    }
                },
                { session: session, upsert: true }
            );
        }
        await session.commitTransaction();
        session.endSession();
        return {
            status: 201,
            createReservationRes
        };
    } catch (error) {
        logger.error(`Error in reservation session, error is ${error}`);
        await session.abortTransaction();
        return {
            status: 500
        };
    }
}
