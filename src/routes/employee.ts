import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as employeeController from '../controllers/employee.controller';
const router = express.Router();

/**
 * @openapi
 * /v1/hotels/{hotelId}/employees:
 *  get:
 *     tags:
 *     - Employees
 *     description: Get information of all the employees of hotel or pass a employee firstName/lastName in query to get the details
 *     parameters:
 *      - in: path
 *        name: hotelId
 *        required: true
 *        type: integer
 *        description: The id of the hotel, whoose employee details are required
 *      - in: query
 *        name: empName
 *        required: false
 *        type: integer
 *        description: Name pattern of the employee
 *     responses:
 *       200:
 *         description: Information of all the employees of a hotel
 *       400:
 *         description: Received invalid type of Hotel ID
 *       404:
 *         description: Data not found for requested hotel ID.
 */
router.get('/:hotelId/employees', async (req: Request, res: Response) => {
    logger.trace(`GET ${req.url}`);
    const hotelId = Number(req.params.hotelId);
    if (Number.isNaN(hotelId)) {
        logger.error(`Received invalid type of Hotel ID, route ${req.url}`);
        return res.status(400).send('Hotel ID type should be number.');
    }
    if (
        Object.keys(req.query).length !== 0 &&
        Object.prototype.hasOwnProperty.call(req.query, 'empName')
    ) {
        const empName: string = req.query.empName as string;
        if (!/^[a-zA-Z]+$/.test(empName)) {
            return res.status(400).send('Employee name should contain only letters');
        }
        const empDataRes = await employeeController.getHotelEmpDetailsByName(hotelId, empName);
        if (empDataRes.status === 200) {
            return res.status(empDataRes.status).send(empDataRes.employeeData);
        } else {
            return res.status(empDataRes.status).send('Not able to find employee data');
        }
    }
    const empDataRes = await employeeController.getHotelEmpDetails(hotelId);
    if (empDataRes.status === 200) {
        res.status(empDataRes.status).send(empDataRes.employeeData);
    } else {
        res.status(empDataRes.status).send('Not able to find employee data');
    }
});

export default router;
