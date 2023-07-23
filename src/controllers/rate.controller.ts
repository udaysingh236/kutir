import Rates, { IRates } from '../models/rates.model';
import { logger } from '../utils/logger';
import { IRatesData, IRateData } from '../types/controller.types';

export async function getAllRatesOfHotel(hotelId: number): Promise<IRatesData> {
    try {
        const ratesData: Array<IRates> = await Rates.find({ hotelId: hotelId });
        if (Object.keys(ratesData[0] ?? {}).length === 0) {
            logger.info(`Not able to find Rates for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            ratesData: ratesData
        };
    } catch (error) {
        logger.error(`Error in getAllRatesOfHotel, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getRoomRates(hotelId: number, roomId: number): Promise<IRateData> {
    try {
        const rateData: IRates | null = await Rates.findOne({
            hotelId: hotelId,
            roomId: roomId
        });
        if (Object.keys(rateData ?? {}).length === 0) {
            logger.info(
                `Not able to find Rate's info for hotel ID ${hotelId} and room Id ${roomId}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            rateData: rateData
        };
    } catch (error) {
        logger.error(`Error in getRoomRates, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getMultipleRoomRates(
    hotelId: number,
    roomIds: number[]
): Promise<IRatesData> {
    try {
        const ratesData: Array<IRates> = await Rates.find({
            hotelId: hotelId,
            roomId: {
                $in: [...roomIds]
            }
        });
        if (Object.keys(ratesData ?? {}).length === 0) {
            logger.info(
                `Not able to find Rate's info for hotel ID ${hotelId} and room Ids ${roomIds}`
            );
            return {
                status: 404
            };
        }
        return {
            status: 200,
            ratesData: ratesData
        };
    } catch (error) {
        logger.error(`Error in getMultipleRoomRates, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function createRate(ratesInfo: object): Promise<IRateData> {
    try {
        await Rates.create(ratesInfo);
        return { status: 201 };
    } catch (error) {
        logger.error(`Error in createRate, error is ${error}`);
        return {
            status: 500
        };
    }
}
