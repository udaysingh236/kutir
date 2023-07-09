import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IHotel extends Document {
    name: string;
    address: string;
    totalRooms: string[];
    staffInfo: Array<IStaffInfo>;
}

export interface IEmployee extends Document {
    name: string;
    address: string;
    employeeInfo: Array<object>;
}

interface IStaffInfo {
    _id: Types.ObjectId;
}

const hotelSchema: Schema = new Schema(
    {
        _id: {
            type: Number
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        totalRooms: {
            type: Array,
            required: true
        },
        staffInfo: {
            type: Array,
            required: true
        }
    },
    { timestamps: true }
);

const Hotel: Model<IHotel> = model<IHotel>('Hotel', hotelSchema);

export default Hotel;
