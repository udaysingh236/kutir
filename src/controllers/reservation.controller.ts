import Reservations, { IReservations } from '../models/reservations.model';
import Guests from '../models/guests.model';
import Availability from '../models/availability.model';
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
    IReservationSchema,
    IAvailabilityData,
    IBookingSchema,
    ICheckInResponse
} from '../types/controller.types';
import Bookings from '../models/bookings.model';

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
    fromDate: string,
    toDate: string
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

export async function getAllResByDate(
    hotelId: number,
    resDate: string
): Promise<IReservationsData> {
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
        // First check the availability of the Room for given date range again:
        const fromDate = new Date(rateShopInfo.checkIn).toISOString().split('T')[0]; //YYYY-MM-DD
        const toDate = new Date(rateShopInfo.checkOut).toISOString().split('T')[0]; //YYYY-MM-DD
        let maxNumOfPersonInRoom = 0;
        let maxNumOfMattressInRoom = 0;
        for (let index = 0; index < rateShopInfo.roomIds.length; index++) {
            const roomAvailbility: IAvailabilityData =
                await availabilityController.getAvailbilityByRoom(
                    hotelId,
                    rateShopInfo.roomIds[index],
                    fromDate,
                    toDate
                );
            if (roomAvailbility.status !== 200) {
                logger.error(
                    `Error while rate shop, room id ${rateShopInfo.roomIds[index]} is not available from range ${fromDate} - ${toDate}`
                );
                return {
                    status: 500
                };
            }
            maxNumOfPersonInRoom +=
                roomAvailbility.availabilityData?.[0].roomsInfo[0].numPerson ?? 0;
            maxNumOfMattressInRoom +=
                roomAvailbility.availabilityData?.[0].roomsInfo[0].maxMattress ?? 0;
            if (
                maxNumOfPersonInRoom < rateShopInfo.numOfPersons ||
                maxNumOfMattressInRoom < rateShopInfo.numOfextraMattress
            ) {
                logger.error(
                    `Error while rate shop, number of person ${rateShopInfo.numOfPersons} or number of mattress ${rateShopInfo.numOfextraMattress} is increasing room(s) capacity persons ${maxNumOfPersonInRoom}, extra mattress ${maxNumOfMattressInRoom}`
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
            checkIn: new Date(rateShopInfo.checkIn).toISOString().split('T')[0],
            checkOut: new Date(rateShopInfo.checkOut).toISOString().split('T')[0],
            totalNumDays: 0,
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
                totalDaysCharge: 0,
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
            Math.abs(
                (+new Date(rateShopResponse.checkOut) - +new Date(rateShopResponse.checkIn)) /
                    oneDay
            )
        );
        if (diffDays <= 0) {
            logger.error(
                `Error while rate shop, date diff is ${diffDays} from range ${fromDate} - ${toDate}`
            );
            return {
                status: 500
            };
        }
        logger.info(`Total days difference: ${diffDays}`);
        rateShopResponse.totalNumDays = diffDays;
        rateShopResponse.chargesDetails.totalDaysCharge =
            diffDays * rateShopResponse.rates.perDayCharge;
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
                rateShopResponse.chargesDetails.couponDisPercentage = couponData.couponData?.isValid
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
            logger.error('Error doing rate shopping');
            return {
                status: 500
            };
        }
        const reservationSchema: IReservationSchema = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...rateShopResponse.rateShopResponse!,
            guestId: '',
            currentResStatus: '',
            confirmationType: 'grey',
            paymentDetails: {
                advancePayment: 0,
                advancePaymentMode: ''
            },
            isResCheckedIn: 'NO',
            isResCheckedOut: 'NO'
        };

        session.startTransaction();
        // create the guest profile and do the reservation
        const createGuestData = await Guests.create(
            [
                {
                    hotelId: hotelId,
                    firstName: resInfo.firstName,
                    lastName: resInfo.lastName,
                    email: resInfo.email,
                    phoneNum: resInfo.phoneNum,
                    identityNum: resInfo.identityNum
                }
            ],
            { session }
        );
        logger.info(`createGuestData ${JSON.stringify(createGuestData)}`);
        reservationSchema.guestId = createGuestData[0]._id; //For NOW
        if (resInfo.paymentDetails.advancePayment > 0) {
            reservationSchema.paymentDetails.advancePayment = resInfo.paymentDetails.advancePayment;
            reservationSchema.paymentDetails.advancePaymentMode =
                resInfo.paymentDetails.advancePaymentMode;
            reservationSchema.confirmationType = 'green';
        }
        reservationSchema.currentResStatus = 'ACTIVE';

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
                            reservationId: createReservationRes[0]._id
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

export async function doResCheckIn(hotelId: number, resId: string): Promise<ICheckInResponse> {
    // start a session and do rest of the DB operations through it.
    const session = await Reservations.startSession();
    try {
        const resData: IReservationSchema | null = await Reservations.findOne({
            _id: resId,
            hotelId: hotelId
        }).lean(true);
        if (resData) {
            const currDate = new Date().toISOString().split('T')[0]; //YYYY-MM-DD
            const chekInDate = new Date(resData.checkIn).toISOString().split('T')[0]; //YYYY-MM-DD
            if (currDate !== chekInDate) {
                logger.error(
                    `Future date check in is not allowed current date ${currDate} and chek in date ${chekInDate}`
                );
                return {
                    status: 404,
                    checkInMsg: `Future date check in is not allowed current date ${currDate} and chek in date ${chekInDate}`
                };
            }
            if (resData.isResCheckedIn === 'YES') {
                logger.error(`Res is already checked in, resData is ${JSON.stringify(resData)}`);
                return {
                    status: 404,
                    checkInMsg: `Res is already checked in, resData is ${JSON.stringify(resData)}`
                };
            }
            const bookingSchema: IBookingSchema = {
                ...resData,
                currentBookingStatus: 'ACTIVE',
                resId: resId
            };
            session.startTransaction();
            const createBookingRes = await Bookings.create([bookingSchema], { session });
            await Reservations.updateOne(
                { _id: resId },
                { $set: { isResCheckedIn: 'YES' } },
                { session }
            );
            await session.commitTransaction();
            session.endSession();
            return {
                checkInMsg: `Booking/ Check In done sucessfully ${JSON.stringify(
                    createBookingRes
                )}`,
                status: 201
            };
        } else {
            logger.info(`Not able to find resDate for hotel ID ${hotelId} and Res ID ${resId}`);
            return {
                status: 404,
                checkInMsg: `Not able to find resDate for hotel ID ${hotelId} and Res ID ${resId}`
            };
        }
    } catch (error) {
        logger.error(`Error in doResCheckIn, error is ${error}`);
        await session.abortTransaction();
        return {
            status: 500,
            checkInMsg: `Error in doResCheckIn, error is ${error}`
        };
    }
}
