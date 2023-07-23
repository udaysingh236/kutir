import Availability, { IAvailability } from '../models/availability.models';
import { logger } from '../utils/logger';
import { IAvailabilityData } from '../types/controller.types';

export async function getAllAvailableRooms(
    hotelId: number,
    fromDate: string,
    toDate: string
): Promise<IAvailabilityData> {
    const availabilityData: Array<IAvailability> = await Availability.aggregate()
        .match({
            hotelId: hotelId,
            reservations: {
                $not: {
                    $elemMatch: {
                        restoDate: { $gt: new Date(fromDate) },
                        resfromDate: { $lt: new Date(toDate) }
                    }
                }
            }
        })
        .lookup({ from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'roomsInfo' });
    if (Object.keys(availabilityData[0] ?? {}).length === 0) {
        logger.info(
            `No available rooms for hotel ID ${hotelId} from range ${fromDate} - ${toDate}`
        );
        return {
            status: 404
        };
    }
    return {
        status: 200,
        availabilityData: availabilityData
    };
}

export async function getAvailbilityByRoom(
    hotelId: number,
    roomId: number,
    fromDate: string,
    toDate: string
): Promise<IAvailabilityData> {
    const availabilityData: Array<IAvailability> = await Availability.aggregate()
        .match({
            hotelId: hotelId,
            roomId: roomId,
            reservations: {
                $not: {
                    $elemMatch: {
                        restoDate: { $gt: new Date(fromDate) },
                        resfromDate: { $lt: new Date(toDate) }
                    }
                }
            }
        })
        .lookup({ from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'roomsInfo' });
    if (Object.keys(availabilityData[0] ?? {}).length === 0) {
        logger.info(
            `No available rooms for hotel ID ${hotelId} and room ID ${roomId} from range ${fromDate} - ${toDate}`
        );
        return {
            status: 404
        };
    }
    return {
        status: 200,
        availabilityData: availabilityData
    };
}
