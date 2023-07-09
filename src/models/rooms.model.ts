import { Document, Model, model, Schema } from 'mongoose';

export interface IRoom extends Document {
    roomNumber: number;
    roomType: number;
    hotelId: number;
    maxMattress: number;
    numPerson: number;
}

const roomSchema: Schema = new Schema(
    {
        _id: {
            type: Number
        },
        roomNumber: {
            type: Number,
            required: true
        },
        roomType: {
            type: Number,
            required: true
        },
        hotelId: {
            type: Number,
            required: true
        },
        maxMattress: {
            type: Number,
            required: true
        },
        numPerson: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

const Room: Model<IRoom> = model<IRoom>('Room', roomSchema);

export default Room;
