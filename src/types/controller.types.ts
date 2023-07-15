import { IHotel, IEmployee } from '../models/hotels.model';
import { IRoom } from '../models/rooms.model';
import { ICoupons } from '../models/coupons.model';
import { IVouchers } from '../models/vouchers.model';
import { IRates } from '../models/rates.model';
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
