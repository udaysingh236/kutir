import { Document, Model, model, Schema } from 'mongoose';

export interface IBookings extends Document {
    hotelId: number;
    roomIds: number;
    resId?: number;
    currentBookingStatus: string;
    checkIn: Date;
    checkOut: Date;
    totalNumDays: number;
    guestId: string;
    createdBy: string;
    couponCode?: string;
    voucherCode?: string;
    rates: {
        perDayCharge: number;
        earlyCheckIn: number;
        lateCheckOut: number;
        extraMattress: number;
    };
    numOfPersons: number;
    chargesDetails: {
        totalDaysCharge: number;
        earlyCheckIn?: number;
        waiveEarlyCheckInRates?: boolean;
        waiveLateCheckOutRates?: boolean;
        lateCheckOut?: number;
        extraMattress: number;
        couponDisPercentage: number;
        voucherAmount: number;
    };
    paymentDetails: {
        advancePayment: number;
        advancePaymentMode: string;
        paymentBreakup?: {
            totalCharges: number;
            couponDiscount: number;
            advancePayment: number;
            taxAmount: number;
            voucherAmountUsed: number;
            totalPayable: number;
            paymentMode: string;
            remarks: string;
        };
    };
}

const ratesSchema: Schema = new Schema({
    perDayCharge: { type: Number, required: true },
    earlyCheckIn: { type: Number, required: true },
    lateCheckOut: { type: Number, required: true },
    extraMattress: { type: Number, required: true }
});

const paymentBreakupSchema: Schema = new Schema({
    totalCharges: { type: Number, required: true },
    couponDiscount: { type: Number, required: true },
    advancePayment: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    voucherAmountUsed: { type: Number, required: true },
    totalPayable: { type: Number, required: true },
    paymentMode: { type: String, required: true },
    remarks: { type: String, required: true }
});

const paymentDetailsSchema: Schema = new Schema({
    advancePayment: { type: Number, required: false },
    advancePaymentMode: { type: String, required: false },
    paymentBreakup: {
        type: paymentBreakupSchema,
        required: false
    }
});

const chargesSchema: Schema = new Schema({
    totalDaysCharge: { type: Number, required: true },
    earlyCheckIn: { type: Number, required: false },
    waiveEarlyCheckInRates: { type: Boolean, required: false },
    waiveLateCheckOutRates: { type: Boolean, required: false },
    lateCheckOut: { type: Number, required: false },
    extraMattress: { type: Number, required: true },
    couponDisPercentage: { type: Number, required: true },
    voucherAmount: { type: Number, required: true }
});

const bookingsSchema: Schema = new Schema(
    {
        hotelId: { type: Number, required: true },
        roomIds: { type: [Number], required: true },
        resId: { type: String, required: false },
        currentBookingStatus: { type: String, required: true },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        totalNumDays: { type: Number, required: true },
        guestId: { type: String, required: true },
        createdBy: { type: String, required: true, default: 'Uday' },
        couponCode: { type: String, required: false },
        voucherCode: { type: String, required: false },
        rates: {
            type: ratesSchema,
            required: true
        },
        numOfPersons: { type: Number, required: true },
        chargesDetails: {
            type: chargesSchema,
            required: true
        },
        paymentDetails: {
            type: paymentDetailsSchema,
            required: true
        }
    },
    { timestamps: true }
);

const Bookings: Model<IBookings> = model<IBookings>('Bookings', bookingsSchema);

export default Bookings;
