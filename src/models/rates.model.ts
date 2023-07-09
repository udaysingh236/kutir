import { Document, Model, model, Schema } from 'mongoose';

export interface IRates extends Document {
    hotelId: number;
    roomId: number;
    perDayCharge: number;
    earlyCheckIn: number;
    lateCheckOut: number;
    extraMattress: number;
}

const ratesSchema: Schema = new Schema(
    {
        hotelId: Number,
        roomId: Number,
        perDayCharge: Number,
        earlyCheckIn: Number,
        lateCheckOut: Number,
        extraMattress: Number
    },
    { timestamps: true }
);

const Rates: Model<IRates> = model<IRates>('Rates', ratesSchema);

export default Rates;
