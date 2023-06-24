import Hotel, { IHotel } from '../models/hotels.model';
import { logger } from '../utils/logger';
import { IHotelsData } from '../types/controller.types';

export async function getAllHotelsDetails(): Promise<IHotelsData> {
    try {
        const allHotelsData: Array<IHotel> = await Hotel.find({});
        return {
            status: 200,
            allHotelsData: allHotelsData
        };
    } catch (error) {
        logger.error(`Error in getAllHotelsDetails, error is ${error}`);
        return {
            status: 401
        };
    }
}
