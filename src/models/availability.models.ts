import { Document, Model, model, Schema } from 'mongoose';
import { IRoom } from './rooms.model';

export interface IAvailability extends Document {
    hotelId: number;
    roomId: number;
    reservations: {
        resfromDate: Date;
        restoDate: Date;
        resType: string;
        reservationId: string;
    }[];
}

export interface IAvailabilityWithRooms extends IAvailability {
    roomsInfo: IRoom[];
}

const availabilitySchema: Schema = new Schema(
    {
        hotelId: Number,
        roomId: Number,
        reservations: Array
    },
    { timestamps: true }
);

const Availability: Model<IAvailability> = model<IAvailability>('RoomAvls', availabilitySchema);

export default Availability;
