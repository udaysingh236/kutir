import { Document, Model, model, Schema } from 'mongoose';

export interface IVouchers extends Document {
    hotelId: number;
    voucherCode: string;
    amount: number;
    isValid: boolean;
}

const vouchersSchema: Schema = new Schema(
    {
        hotelId: Number,
        voucherCode: String,
        amount: Number,
        isValid: Boolean
    },
    { timestamps: true }
);

const Vouchers: Model<IVouchers> = model<IVouchers>('Voucher', vouchersSchema);

export default Vouchers;
