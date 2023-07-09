import { Document, Model, model, Schema } from 'mongoose';

export interface ICoupons extends Document {
    hotelId: number;
    couponCode: string;
    discountPer: number;
    isValid: boolean;
}

const couponsSchema: Schema = new Schema(
    {
        hotelId: Number,
        couponCode: String,
        discountPer: Number,
        isValid: Boolean
    },
    { timestamps: true }
);

const Coupons: Model<ICoupons> = model<ICoupons>('Coupons', couponsSchema);

export default Coupons;
