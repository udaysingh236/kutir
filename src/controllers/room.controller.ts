import Room, { IRoom } from '../models/rooms.model';
import { logger } from '../utils/logger';
import { IRoomsData, IRoomData } from '../types/controller.types';

export async function getHotelRoomsDetails(hotelId: number): Promise<IRoomsData> {
    try {
        const hotelRoomsData: Array<IRoom> = await Room.find({ hotelId: hotelId });
        if (Object.keys(hotelRoomsData[0] ?? {}).length === 0) {
            logger.info(`Not able to find rooms data with hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            hotelRoomsData: hotelRoomsData
        };
    } catch (error) {
        logger.error(`Error in getHotelRoomsDetails, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getRoomDetailsFromId(hotelId: number, roomId: number): Promise<IRoomData> {
    try {
        const roomData: IRoom | null = await Room.findOne({ hotelId: hotelId, _id: roomId });
        if (Object.keys(roomData ?? {}).length === 0) {
            logger.info(
                `Not able to find rooms data with hotel ID ${hotelId} and room ID ${roomId}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            roomData: roomData
        };
    } catch (error) {
        logger.error(`Error in getRoomDetailsFromId, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getRoomDetailsFromNumber(
    hotelId: number,
    roomNum: number
): Promise<IRoomData> {
    try {
        const roomData: IRoom | null = await Room.findOne({
            hotelId: hotelId,
            roomNumber: roomNum
        });
        if (Object.keys(roomData ?? {}).length === 0) {
            logger.info(
                `Not able to find rooms data with hotel ID ${hotelId} and room Number ${roomNum}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            roomData: roomData
        };
    } catch (error) {
        logger.error(`Error in getRoomDetailsFromNumber, error is ${error}`);
        return {
            status: 404
        };
    }
}
