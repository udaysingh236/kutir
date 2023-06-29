import { IHotel, IEmployee } from '../models/hotels.model';
import { IRoom } from '../models/rooms.model';
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
