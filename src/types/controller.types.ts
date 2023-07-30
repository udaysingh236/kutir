import { IHotel, IEmployee } from '../models/hotels.model';
import { IRoom } from '../models/rooms.model';
import { ICoupons } from '../models/coupons.model';
import { IVouchers } from '../models/vouchers.model';
import { IRates } from '../models/rates.model';
import { IReservations } from '../models/reservations.model';
import { IAvailabilityWithRooms } from '../models/availability.models';
import { IGuests } from '../models/guests.model';
export interface IHotelsData {
    status: number;
    allHotelsData?: Array<IHotel>;
}

export interface IHotelData {
    status: number;
    hotelData?: IHotel;
}

export interface IRoomsData {
    status: number;
    hotelRoomsData?: Array<IRoom>;
}

export interface IRoomData {
    status: number;
    roomData?: IRoom | null;
}

export interface IEmployeeData {
    status: number;
    employeeData?: Array<IEmployee>;
}

export interface ICouponsData {
    status: number;
    couponsData?: Array<ICoupons>;
}

export interface ICouponData {
    status: number;
    couponData?: ICoupons | null;
}

export interface IVouchersData {
    status: number;
    vouchersData?: Array<IVouchers>;
}

export interface IVoucherData {
    status: number;
    voucherData?: IVouchers | null;
}

export interface IRatesData {
    status: number;
    ratesData?: Array<IRates>;
}

export interface IRateData {
    status: number;
    rateData?: IRates | null;
}

export interface IAvailabilityData {
    status: number;
    availabilityData?: Array<IAvailabilityWithRooms>;
}

export interface IGuestsData {
    status: number;
    guestsData?: Array<IGuests>;
}

export interface IReservationsData {
    status: number;
    reservationsData?: Array<IReservations>;
}

export interface IReservationData {
    status: number;
    reservationData?: IReservations | null;
}

export interface IRateShopPayload {
    roomIds: number[];
    checkIn: string;
    checkOut: string;
    couponCode?: string;
    voucherCode?: string;
    numOfPersons: number;
    numOfextraMattress: number;
}

export interface IReservationsPayload extends IRateShopPayload {
    firstName: string;
    lastName: string;
    email: string;
    phoneNum: number;
    identityNum: string;
    paymentDetails: {
        advancePayment: number;
        advancePaymentMode: string;
    };
}

export interface IRateShopSchema {
    hotelId: number;
    roomIds: number[];
    checkIn: string;
    checkOut: string;
    totalNumDays: number;
    couponCode?: string;
    voucherCode?: string;
    numOfPersons: number;
    numOfextraMattress: number;
    rates: {
        perDayCharge: number;
        earlyCheckIn: number;
        lateCheckOut: number;
        extraMattress: number;
    };
    chargesDetails: {
        totalDaysCharge: number;
        earlyCheckIn?: number;
        waiveEarlyCheckInRates?: boolean;
        waiveLateCheckOutRates?: boolean;
        lateCheckOut?: number;
        extraMattress: number;
        couponDisPercentage: number;
        voucherAmount: number;
    };
}

export interface IReservationSchema extends IRateShopSchema {
    guestId: string;
    currentStatus: string;
    confirmationType: string;
    createdBy?: string;
    paymentDetails: {
        advancePayment: number;
        advancePaymentMode: string;
    };
}

export interface IRateShopResponse {
    status: number;
    rateShopResponse?: IRateShopSchema;
}
