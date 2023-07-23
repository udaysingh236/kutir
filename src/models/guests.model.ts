import { Document, Model, model, Schema } from 'mongoose';

export interface IGuests extends Document {
    hotelId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNum: number;
    identityNum: string;
}

const guestsSchema: Schema = new Schema(
    {
        hotelId: Number,
        firstName: String,
        lastName: String,
        email: String,
        phoneNum: Number,
        identityNum: String
    },
    { timestamps: true }
);

const Guests: Model<IGuests> = model<IGuests>('Guests', guestsSchema);

export default Guests;
