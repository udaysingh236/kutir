import { IHotel } from '../models/hotels.model';
export interface IHotelsData {
    status: number;
    allHotelsData?: Array<IHotel>;
}
