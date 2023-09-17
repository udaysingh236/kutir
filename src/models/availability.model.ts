import { Document, Model, model, Schema, Types } from 'mongoose';
import { IRoom } from './rooms.model';

export interface IAvailability extends Document {
    hotelId: number;
    roomId: number;
    reservations: {
        resfromDate: Date;
        restoDate: Date;
        resType: string;
        reservationId?: string;
        bookingId?: string;
    }[];
}

export interface IAvailabilityWithRooms extends IAvailability {
    roomsInfo: IRoom[];
}

const reservationsSchema: Schema = new Schema({
    resfromDate: { type: Date, required: true },
    restoDate: { type: Date, required: true },
    resType: { type: String, required: true },
    reservationId: { type: Types.ObjectId, required: false },
    bookingId: { type: Types.ObjectId, required: false }
});

const availabilitySchema: Schema = new Schema(
    {
        hotelId: Number,
        roomId: Number,
        reservations: {
            type: reservationsSchema,
            required: true
        }
    },
    { timestamps: true }
);

const Availability: Model<IAvailability> = model<IAvailability>('RoomAvls', availabilitySchema);

export default Availability;
