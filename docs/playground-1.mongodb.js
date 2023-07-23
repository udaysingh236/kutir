/* eslint-disable no-undef */
/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('test');

// db.hotels.insertOne({ checkIn: new Date() });
// db.hotels.insertOne({ checkIn: new ISODate('2023-07-16') });

// db.hotels.find({ checkIn: { $gte: new Date('2023-07-16') } });
db.hotels.find({ _id: ObjectId('64b41726f1277f96bf7ec6c0') });

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.

// db.rooms.findOne({ hotelId: 1, _id: 1 });

// for (let index = 0; index < roomsData.length; index++) {
//     const element = roomsData[index];
//     if (index < 10) {
//         element.roomNumber = 100 + index;
//     } else {
//         element.roomNumber = 200 + index;
//     }
//     db.rooms.replaceOne({ _id: element['_id'] }, element);
// }

// let valueMatch = new RegExp('tt');
// db.hotels.aggregate([
//     { $match: { _id: 10 } },
//     {
//         $addFields: {
//             employeeObjectId: {
//                 $map: {
//                     input: '$staffInfo',
//                     as: 'r',
//                     in: { $toObjectId: '$$r._id' }
//                 }
//             }
//         }
//     },
//     {
//         $lookup: {
//             from: 'employees',
//             localField: 'employeeObjectId',
//             foreignField: '_id',
//             as: 'employeesInfo'
//         }
//     },
//     { $unwind: '$employeesInfo' },
//     {
//         $match: {
//             $or: [
//                 { 'employeesInfo.firstName': { $regex: valueMatch } },
//                 { 'employeesInfo.lastName': { $regex: valueMatch } }
//             ]
//         }
//     },
//     {
//         $project: {
//             employeeObjectId: 0,
//             staffInfo: 0,
//             totalRooms: 0
//         }
//     }
// ]);

// db.hotels.aggregate([
//     { $match: { _id: 100 } },
//     {
//         $addFields: {
//             employeeObjectId: {
//                 $map: {
//                     input: '$staffInfo',
//                     as: 'r',
//                     in: { $toObjectId: '$$r._id' }
//                 }
//             }
//         }
//     },
//     {
//         $lookup: {
//             from: 'employees',
//             localField: 'employeeObjectId',
//             foreignField: '_id',
//             as: 'employeeInfo'
//         }
//     },
//     {
//         $lookup: {
//             from: 'rooms',
//             localField: 'totalRooms',
//             foreignField: '_id',
//             as: 'roomsInfo'
//         }
//     },
//     {
//         $project: {
//             employeeObjectId: 0,
//             totalRooms: 0,
//             staffInfo: 0
//         }
//     }
// ]);
