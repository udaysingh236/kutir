import { Document, Model, model, Schema } from 'mongoose';

export interface IReservations extends Document {
    hotelId: number;
    roomIds: number[];
    currentResStatus: string;
    isResCheckedIn: string;
    isResCheckedOut: string;
    confirmationType: string;
    checkIn: Date;
    checkOut: Date;
    totalNumDays: number;
    guestId: string;
    createdBy?: string;
    couponCode?: string;
    voucherCode?: string;
    numOfextraMattress: number;
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
    };
}

const ratesSchema: Schema = new Schema({
    perDayCharge: { type: Number, required: true },
    earlyCheckIn: { type: Number, required: true },
    lateCheckOut: { type: Number, required: true },
    extraMattress: { type: Number, required: true }
});

const paymentDetailsSchema: Schema = new Schema({
    advancePayment: { type: Number, required: false },
    advancePaymentMode: { type: String, required: false }
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

const reservationsSchema: Schema = new Schema(
    {
        hotelId: { type: Number, required: true },
        roomIds: { type: [Number], required: true },
        currentResStatus: { type: String, required: true, default: 'ACTIVE' },
        confirmationType: {
            type: String,
            required: true,
            default: 'GREY'
        },
        checkIn: { type: Date, required: true },
        isResCheckedIn: { type: String, required: true },
        isResCheckedOut: { type: String, required: true },
        checkOut: { type: Date, required: true },
        totalNumDays: { type: Number, required: true },
        guestId: { type: String, required: true },
        createdBy: { type: String, required: true, default: 'Uday' },
        numOfextraMattress: { type: Number, required: true },
        couponCode: { type: String, required: false, default: 'NA' },
        voucherCode: { type: String, required: false, default: 'NA' },
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

const Reservations: Model<IReservations> = model<IReservations>('Reservations', reservationsSchema);

export default Reservations;
