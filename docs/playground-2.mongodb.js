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
use('kutir_data');

// db.roomavls.updateOne(
//     { hotelId: 1, roomId: 6 },
//     {
//         $push: {
//             reservations: {
//                 resfromDate: new Date('2023-01-01'),
//                 restoDate: new Date('2023-01-04'),
//                 resType: 'grey',
//                 reservationId: 12345
//             }
//         }
//     },
//     { upsert: true }
// );

for (let index = 1; index <= 20; index++) {
    db.roomavls.insertOne({
        hotelId: 1,
        roomId: index,
        reservations: []
    });
}

// db.reservations.insertMany([
//     {
//         roomNum: 1,
//         reserved: [{ from: new Date('2023-01-01'), to: new Date('2023-01-04') }]
//     },
//     {
//         roomNum: 2,
//         reserved: [
//             { from: new Date('2023-01-01'), to: new Date('2023-01-04') },
//             { from: new Date('2023-08-01'), to: new Date('2023-08-08') }
//         ]
//     }
// ]);

// const fromDate = new Date('2023-07-23');
// const toDate = new Date('2023-07-25');

// db.roomavls.aggregate([
//     {
//         $match: {
//             reservations: {
//                 $not: {
//                     $elemMatch: {
//                         restoDate: { $gt: fromDate },
//                         resfromDate: { $lt: toDate }
//                     }
//                 }
//             }
//         }
//     },
//     {
//         $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'roomsInfo' }
//     }
// ]);
