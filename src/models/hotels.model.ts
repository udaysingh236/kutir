import { Document, model, Schema, Types } from 'mongoose';

export interface IHotel extends Document {
    name: string;
    address: string;
    totalRooms: string[];
    staffInfo: Array<IStaffInfo>;
}

interface IStaffInfo {
    _id: Types.ObjectId;
}

const hotelSchema: Schema = new Schema({
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
});

const Hotel = model<IHotel>('Hotel', hotelSchema);

export default Hotel;
