import Guests, { IGuests } from '../models/guests.model';
import { logger } from '../utils/logger';
import { IGuestsData } from '../types/controller.types';

export async function getAllGuestsOfHotel(hotelId: number): Promise<IGuestsData> {
    try {
        const guestsData: Array<IGuests> = await Guests.find({ hotelId: hotelId });
        if (Object.keys(guestsData[0] ?? {}).length === 0) {
            logger.info(`Not able to find guests for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            guestsData: guestsData
        };
    } catch (error) {
        logger.error(`Error in getAllGuestsOfHotel, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getGuestInfo(hotelId: number, guestName: string): Promise<IGuestsData> {
    try {
        const guestNameMatch = new RegExp(guestName);
        const guestsData: Array<IGuests> = await Guests.find({
            hotelId: hotelId,
            $or: [
                { firstName: { $regex: guestNameMatch } },
                { lastName: { $regex: guestNameMatch } }
            ]
        });
        if (Object.keys(guestsData ?? {}).length === 0) {
            logger.info(`Not able to find guest's info for hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            guestsData: guestsData
        };
    } catch (error) {
        logger.error(`Error in getGuestInfo, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function createGuest(guestInfo: object) {
    try {
        const createGuestData = await Guests.create(guestInfo);
        logger.info(`createGuestData ${JSON.stringify(createGuestData)}`);
        return { status: 201, guestsData: createGuestData.toJSON() };
    } catch (error) {
        logger.error(`Error in createGuest, error is ${error}`);
        return {
            status: 500
        };
    }
}
