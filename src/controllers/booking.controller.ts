/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Reservations, { IBookings } from '../models/bookings.model';
import Guests from '../models/guests.model';
import Availability from '../models/availability.model';
import * as reservationController from './reservation.controller';
import * as voucherController from './voucher.controller';
import * as couponController from './coupon.controller';
import { logger } from '../utils/logger';
import {
    IBookingsData,
    ICheckOutResponse,
    ICheckOutPayload,
    IReservationsPayload,
    IRateShopResponse,
    IBookingSchema,
    IReservationSchema
} from '../types/controller.types';
import Bookings from '../models/bookings.model';

export async function getAllActiveBookingsOfHotel(hotelId: number): Promise<IBookingsData> {
    try {
        const currDate = new Date().toISOString().split('T')[0]; //YYYY-MM-DD
        const bookingsData: Array<IBookings> = await Bookings.find({
            hotelId: hotelId,
            checkIn: new Date(currDate)
        });
        if (Object.keys(bookingsData[0] ?? {}).length === 0) {
            logger.info(`Not able to find bookings for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            bookingsData: bookingsData
        };
    } catch (error) {
        logger.error(`Error in getAllActiveBookingsOfHotel, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getAllBookingByRange(
    hotelId: number,
    fromDate: string,
    toDate: string
): Promise<IBookingsData> {
    try {
        if (new Date(fromDate) >= new Date(toDate) || new Date(fromDate) > new Date()) {
            logger.info(
                `From date should be less than to date range ${fromDate} - ${toDate} and from date should be less than or equal to current date.`
            );
            return {
                status: 404
            };
        }
        const formatFromDate = new Date(fromDate).toISOString().split('T')[0]; //YYYY-MM-DD
        const formatToDate = new Date(toDate).toISOString().split('T')[0]; //YYYY-MM-DD
        const bookingsData: Array<IBookings> = await Bookings.find({
            hotelId: hotelId,
            checkIn: { $gte: new Date(formatFromDate), $lte: new Date(formatToDate) }
        });
        if (Object.keys(bookingsData[0] ?? {}).length === 0) {
            logger.info(
                `Not able to find bookings for hotel ID ${hotelId} from range ${formatFromDate} - ${formatToDate}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            bookingsData: bookingsData
        };
    } catch (error) {
        logger.error(`Error in getAllBookingByRange, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getAllbookingByDate(
    hotelId: number,
    bookingDate: string
): Promise<IBookingsData> {
    try {
        if (new Date(bookingDate) > new Date()) {
            logger.info(`Booking date should be less than or equal to current date.`);
            return {
                status: 404
            };
        }
        const formatResDate = new Date(bookingDate).toISOString().split('T')[0]; //YYYY-MM-DD
        const bookingsData: Array<IBookings> = await Bookings.find({
            hotelId: hotelId,
            checkIn: new Date(formatResDate)
        });
        if (Object.keys(bookingsData[0] ?? {}).length === 0) {
            logger.info(
                `Not able to find bookings for hotel ID ${hotelId} on date ${formatResDate}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            bookingsData: bookingsData
        };
    } catch (error) {
        logger.error(`Error in getAllbookingByDate, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function createBooking(hotelId: number, bookingInfo: IReservationsPayload) {
    // start a session and do rest of the DB operations through it.
    const session = await Bookings.startSession();
    try {
        if (
            new Date(bookingInfo.checkIn) >= new Date(bookingInfo.checkOut) ||
            new Date(bookingInfo.checkIn) > new Date()
        ) {
            logger.info(
                `From date should be less than to date range ${bookingInfo.checkIn} - ${bookingInfo.checkOut} and from date should be less than or equal to current date.`
            );
            return {
                status: 404
            };
        }
        const rateShopResponse: IRateShopResponse = await reservationController.doRateShoping(
            hotelId,
            bookingInfo
        );
        if (rateShopResponse.status !== 200) {
            logger.error('Error doing rate shopping');
            return {
                status: 500
            };
        }
        const bookingSchema: IBookingSchema = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...rateShopResponse.rateShopResponse!,
            guestId: '',
            paymentDetails: {
                advancePayment: 0,
                advancePaymentMode: ''
            },
            currentBookingStatus: 'ACTIVE'
        };

        session.startTransaction();
        // create the guest profile and do the reservation
        const createGuestData = await Guests.create(
            [
                {
                    hotelId: hotelId,
                    firstName: bookingInfo.firstName,
                    lastName: bookingInfo.lastName,
                    email: bookingInfo.email,
                    phoneNum: bookingInfo.phoneNum,
                    identityNum: bookingInfo.identityNum
                }
            ],
            { session }
        );
        logger.info(`createGuestData ${JSON.stringify(createGuestData)}`);
        bookingSchema.guestId = createGuestData[0]._id; //For NOW
        if (bookingInfo.paymentDetails.advancePayment > 0) {
            bookingSchema.paymentDetails.advancePayment =
                bookingInfo.paymentDetails.advancePayment ?? 0;
            bookingSchema.paymentDetails.advancePaymentMode =
                bookingInfo.paymentDetails.advancePaymentMode;
        }

        // Finally insert into booking table
        const createBookingRes = await Bookings.create([bookingSchema], { session });
        logger.info(`createBookingRes ${JSON.stringify(createBookingRes)}`);
        // Update the availbility table
        const fromDate = new Date(bookingInfo.checkIn);
        const toDate = new Date(bookingInfo.checkOut);
        for (let index = 0; index < bookingInfo.roomIds.length; index++) {
            await Availability.updateOne(
                { roomId: bookingInfo.roomIds[index], hotelId: hotelId },
                {
                    $push: {
                        reservations: {
                            restoDate: toDate,
                            resfromDate: fromDate,
                            resType: 'GREEN',
                            bookingId: createBookingRes[0]._id
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
            createBookingRes
        };
    } catch (error) {
        logger.error(`Error in booking session, error is ${error}`);
        await session.abortTransaction();
        return {
            status: 500
        };
    }
}

export async function doCheckOut(
    hotelId: number,
    bookingId: string,
    checkOutPayload: ICheckOutPayload
): Promise<ICheckOutResponse> {
    // start a session and do rest of the DB operations through it.
    const session = await Bookings.startSession();
    try {
        const bookingData: IBookingSchema | null = await Bookings.findOne({
            _id: bookingId,
            hotelId: hotelId
        }).lean(true);
        if (bookingData) {
            if (new Date(checkOutPayload.checkOut) > new Date()) {
                logger.error(
                    `Check out date should not be greater than current date ${JSON.stringify(
                        checkOutPayload.checkOut
                    )}`
                );
                return {
                    status: 404,
                    checkOutMsg: `Check out date should not be greater than current date ${JSON.stringify(
                        checkOutPayload.checkOut
                    )}`
                };
            }
            if (bookingData.resId) {
                const resData: IReservationSchema | null = await Reservations.findOne({
                    _id: bookingData.resId,
                    hotelId: hotelId
                }).lean(true);
                if (resData?.isResCheckedOut === 'YES') {
                    logger.error(
                        `Res is already checked out, resData is ${JSON.stringify(resData)}`
                    );
                    return {
                        status: 404,
                        checkOutMsg: `Res is already checked Out, resData is ${JSON.stringify(
                            resData
                        )}`
                    };
                }
            }

            if (bookingData.currentBookingStatus !== 'ACTIVE') {
                return {
                    status: 404,
                    checkOutMsg: `Booking is already checked Out or cancelled, bookingData is ${JSON.stringify(
                        bookingData
                    )}`
                };
            }

            // Lets do the math again if the check out date is changed.
            session.startTransaction();
            if (new Date(bookingData.checkOut) !== new Date(checkOutPayload.checkOut)) {
                // Lets calulate number of days
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                let diffDays = Math.round(
                    Math.abs(
                        (+new Date(checkOutPayload.checkOut) - +new Date(bookingData.checkIn)) /
                            oneDay
                    )
                );
                diffDays = diffDays === 0 ? 1 : diffDays; // Same day Checkout, charge for whole 1 day.
                if (diffDays < 0) {
                    logger.error(
                        `Error while check out, date diff is ${diffDays} from range ${bookingData.checkIn} - ${bookingData.checkOut}`
                    );
                    return {
                        status: 500,
                        checkOutMsg: `Error while check out, date diff is ${diffDays} from range ${bookingData.checkIn} - ${bookingData.checkOut}`
                    };
                }
                logger.debug(`Total days difference: ${diffDays}`);
                bookingData.totalNumDays = diffDays;
                bookingData.chargesDetails.totalDaysCharge =
                    diffDays * bookingData.rates.perDayCharge;
                bookingData.chargesDetails.extraMattress =
                    bookingData.rates.extraMattress * bookingData.numOfextraMattress * diffDays;

                bookingData.checkOut = new Date(checkOutPayload.checkOut)
                    .toISOString()
                    .split('T')[0]; //YYYY-MM-DD
                for (let index = 0; index < bookingData.roomIds.length; index++) {
                    const avlUpdate = await Availability.updateOne(
                        {
                            roomId: bookingData.roomIds[index],
                            hotelId: hotelId,
                            'reservations.bookingId': bookingId
                        },
                        {
                            $set: {
                                'reservations.$.restoDate': bookingData.checkOut
                            }
                        },
                        { session: session, upsert: true }
                    );
                    logger.debug(`avlUpdate: ${JSON.stringify(avlUpdate)}`);
                }
            }

            if (checkOutPayload.voucherCode) {
                const voucherData = await voucherController.getVoucherInfo(
                    hotelId,
                    checkOutPayload.voucherCode
                );
                if (voucherData.status === 200) {
                    bookingData.chargesDetails.voucherAmount = voucherData.voucherData?.isValid
                        ? voucherData.voucherData?.amount
                        : 0;
                }
            }
            // check coupon
            if (checkOutPayload.couponCode) {
                const couponData = await couponController.getCouponInfo(
                    hotelId,
                    checkOutPayload.couponCode
                );
                if (couponData.status === 200) {
                    bookingData.chargesDetails.couponDisPercentage = couponData.couponData?.isValid
                        ? couponData.couponData?.discountPer
                        : 0;
                }
            }

            // Lets calculate the final charges
            // Coupon discount
            bookingData.paymentDetails = {
                advancePayment: bookingData.paymentDetails.advancePayment,
                advancePaymentMode: bookingData.paymentDetails.advancePaymentMode,
                paymentBreakup: {
                    totalCharges: 0,
                    extraMattressCharge: 0,
                    couponDiscount: 0,
                    advancePayment: 0,
                    taxAmount: 0,
                    voucherAmountUsed: 0,
                    totalPayable: 0,
                    paymentMode: 'CASH',
                    remarks: 'FOR TEST'
                }
            };
            bookingData.paymentDetails.paymentBreakup!.couponDiscount = bookingData.chargesDetails
                .couponDisPercentage
                ? ((bookingData.chargesDetails.totalDaysCharge +
                      bookingData.chargesDetails.extraMattress) *
                      bookingData.chargesDetails.couponDisPercentage) /
                  100
                : 0;
            // Final Voucher amount
            bookingData.paymentDetails.paymentBreakup!.voucherAmountUsed = bookingData
                .chargesDetails.voucherAmount
                ? bookingData.chargesDetails.voucherAmount
                : 0;
            // Final mattress amount
            bookingData.paymentDetails.paymentBreakup!.extraMattressCharge = bookingData
                .chargesDetails.extraMattress
                ? bookingData.chargesDetails.extraMattress
                : 0;
            // Total days charges amount
            bookingData.paymentDetails.paymentBreakup!.totalCharges =
                bookingData.chargesDetails.totalDaysCharge;
            // Advance amount
            bookingData.paymentDetails.paymentBreakup!.advancePayment =
                bookingData.paymentDetails.advancePayment;

            // Dont include advance payment, since it is also taxable

            bookingData.paymentDetails.paymentBreakup!.taxAmount = Math.abs(
                ((bookingData.paymentDetails.paymentBreakup!.totalCharges +
                    bookingData.paymentDetails.paymentBreakup!.extraMattressCharge -
                    bookingData.paymentDetails.paymentBreakup!.couponDiscount -
                    bookingData.paymentDetails.paymentBreakup!.voucherAmountUsed) *
                    10) /
                    100
            );

            bookingData.paymentDetails.paymentBreakup!.totalPayable =
                bookingData.paymentDetails.paymentBreakup!.totalCharges +
                bookingData.paymentDetails.paymentBreakup!.extraMattressCharge +
                bookingData.paymentDetails.paymentBreakup!.taxAmount -
                bookingData.paymentDetails.paymentBreakup!.couponDiscount -
                bookingData.paymentDetails.paymentBreakup!.voucherAmountUsed -
                bookingData.paymentDetails.paymentBreakup!.advancePayment;

            bookingData.currentBookingStatus = 'CLOSED';

            const checkOutRes = await Bookings.replaceOne({ _id: bookingId }, bookingData, {
                session
            });
            // Lets update the Res status also if present
            if (bookingData.resId) {
                await Reservations.updateOne(
                    { _id: bookingData.resId },
                    { $set: { isResCheckedOut: 'YES', currentResStatus: 'CLOSED' } },
                    { session }
                );
            }
            await session.commitTransaction();
            session.endSession();
            return {
                status: 404,
                checkOutMsg: `Check out done sucessfully ${JSON.stringify(checkOutRes)}`
            };
        } else {
            logger.info(
                `Not able to find booking data for hotel ID ${hotelId} and Res ID ${bookingId}`
            );
            return {
                status: 404,
                checkOutMsg: `Not able to find booking data for hotel ID ${hotelId} and Res ID ${bookingId}`
            };
        }
    } catch (error) {
        logger.error(`Error in doCheckOut, error is ${error}`);
        await session.abortTransaction();
        return {
            status: 500,
            checkOutMsg: `Error in doCheckOut, error is ${error}`
        };
    }
}
