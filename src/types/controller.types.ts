import { IHotel } from '../models/hotels.model';
export interface IHotelsData {
    status: number;
    allHotelsData?: Array<IHotel>;
}

export interface IHotelData {
    status: number;
    hotelData?: IHotel;
}
