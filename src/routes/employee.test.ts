import request from 'supertest';
import app from '../app';
import * as employeeController from '../controllers/employee.controller';

describe('GET - Fetch employees details of a Hotel', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return all employees details', async () => {
        const mgetHotelEmpDetails = jest
            .spyOn(employeeController, 'getHotelEmpDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/10/employees');
        expect(mgetHotelEmpDetails).toHaveBeenCalled();
        expect(res.status).toEqual(200);
    });

    test('Should return not able to find employee data', async () => {
        const mgetHotelEmpDetails = jest
            .spyOn(employeeController, 'getHotelEmpDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );

        const res = await request(app).get('/v1/hotels/100/employees');
        expect(mgetHotelEmpDetails).toHaveBeenCalled();
        expect(res.status).toEqual(404);
        expect(res.text).toEqual('Not able to find employee data');
    });

    test('Should return error message when hotel ID is string', async () => {
        jest.resetAllMocks();
        const mgetHotelEmpDetails = jest
            .spyOn(employeeController, 'getHotelEmpDetails')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );
        const res = await request(app).get('/v1/hotels/100AA/employees');
        expect(mgetHotelEmpDetails).not.toHaveBeenCalled();
        expect(res.status).toEqual(400); //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and doube chance of failure.
        expect(res.text).toEqual('Hotel ID type should be number.');
    });
});

describe('GET - Fetch employees details of a Hotel with employee name in query parameter', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });
    test('Should return all employees details matching the query string', async () => {
        const getHotelEmpDetailsByName = jest
            .spyOn(employeeController, 'getHotelEmpDetailsByName')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 200
                })
            );

        const res = await request(app).get('/v1/hotels/10/employees?empName=tt');
        expect(getHotelEmpDetailsByName).toHaveBeenCalled();
        expect(res.status).toEqual(200);
    });

    test('Should return not able to find employees details matching the query string', async () => {
        const mgetHotelEmpDetailsByName = jest
            .spyOn(employeeController, 'getHotelEmpDetailsByName')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );
        const res = await request(app).get('/v1/hotels/100/employees?empName=tt');
        expect(mgetHotelEmpDetailsByName).toHaveBeenCalled();
        expect(res.status).toEqual(404);
        expect(res.text).toEqual('Not able to find employee data');
    });

    test('Should return error message when employee name doesnot contains only letters', async () => {
        jest.resetAllMocks();
        const mgetHotelEmpDetailsByName = jest
            .spyOn(employeeController, 'getHotelEmpDetailsByName')
            .mockReturnValueOnce(
                Promise.resolve({
                    status: 404
                })
            );
        const res = await request(app).get('/v1/hotels/10/employees?empName=tt33');
        expect(mgetHotelEmpDetailsByName).not.toHaveBeenCalled();
        //intentionally keeping it different since the function is not getting called
        // If somehow it got called there is a double check and doube chance of failure.
        expect(res.status).toEqual(400);
        expect(res.text).toEqual('Employee name should contain only letters');
    });
});
