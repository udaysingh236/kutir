import Hotel, { IHotel } from '../models/hotels.model';
import { logger } from '../utils/logger';
import { IHotelsData, IHotelData } from '../types/controller.types';

export async function getAllHotelsDetails(): Promise<IHotelsData> {
    try {
        const allHotelsData: Array<IHotel> = await Hotel.aggregate()
            .addFields({
                employeeObjectId: {
                    $map: {
                        input: '$staffInfo',
                        as: 'r',
                        in: { $toObjectId: '$$r._id' }
                    }
                }
            })
            .lookup({
                from: 'employees',
                localField: 'employeeObjectId',
                foreignField: '_id',
                as: 'employeesInfo'
            })
            .lookup({
                from: 'rooms',
                localField: 'totalRooms',
                foreignField: '_id',
                as: 'roomsInfo'
            })
            .project({
                employeeObjectId: 0,
                totalRooms: 0,
                staffInfo: 0
            });
        return {
            status: 200,
            allHotelsData: allHotelsData
        };
    } catch (error) {
        logger.error(`Error in getAllHotelsDetails, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getHotelDetails(hotelId: number): Promise<IHotelData> {
    try {
        const hotelData: Array<IHotel> = await Hotel.aggregate()
            .match({ _id: hotelId })
            .addFields({
                employeeObjectId: {
                    $map: {
                        input: '$staffInfo',
                        as: 'r',
                        in: { $toObjectId: '$$r._id' }
                    }
                }
            })
            .lookup({
                from: 'employees',
                localField: 'employeeObjectId',
                foreignField: '_id',
                as: 'employeesInfo'
            })
            .lookup({
                from: 'rooms',
                localField: 'totalRooms',
                foreignField: '_id',
                as: 'roomsInfo'
            })
            .project({
                employeeObjectId: 0,
                totalRooms: 0,
                staffInfo: 0
            });
        if (Object.keys(hotelData[0] ?? {}).length === 0) {
            logger.info(`Not able to find hotel with hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            hotelData: hotelData[0]
        };
    } catch (error) {
        logger.error(`Error in getHotelDetails, error is ${error}`);
        return {
            status: 404
        };
    }
}
