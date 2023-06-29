import Hotel, { IEmployee } from '../models/hotels.model';
import { logger } from '../utils/logger';
import { IEmployeeData } from '../types/controller.types';

export async function getHotelEmpDetailsByName(
    hotelId: number,
    empName: string
): Promise<IEmployeeData> {
    try {
        const empNameMatch = new RegExp(empName);
        const employeeData: Array<IEmployee> = await Hotel.aggregate()
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
            .unwind('employeesInfo')
            .match({
                $or: [
                    { 'employeesInfo.firstName': { $regex: empNameMatch } },
                    { 'employeesInfo.lastName': { $regex: empNameMatch } }
                ]
            })
            .project({
                employeeObjectId: 0,
                totalRooms: 0,
                staffInfo: 0
            });
        if (Object.keys(employeeData[0] ?? {}).length === 0) {
            logger.info(`Not able to find Employee data in hotel with hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            employeeData: employeeData
        };
    } catch (error) {
        logger.error(`Error in getHotelEmpDetailsByName, error is ${error}`);
        return {
            status: 404
        };
    }
}

export async function getHotelEmpDetails(hotelId: number): Promise<IEmployeeData> {
    try {
        const employeeData: Array<IEmployee> = await Hotel.aggregate()
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
            .project({
                employeeObjectId: 0,
                totalRooms: 0,
                staffInfo: 0
            });
        if (Object.keys(employeeData[0] ?? {}).length === 0) {
            logger.info(`Not able to find Employee data in hotel with hotel ID ${hotelId}`);
            return {
                status: 404
            };
        }
        return {
            status: 200,
            employeeData: employeeData
        };
    } catch (error) {
        logger.error(`Error in getHotelEmpDetails, error is ${error}`);
        return {
            status: 404
        };
    }
}
