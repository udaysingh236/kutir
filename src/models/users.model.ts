import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    googleId: string;
    photoUrl: string;
}

const userSchema: Schema = new Schema(
    {
        username: String,
        email: String,
        photoUrl: String,
        googleId: String
    },
    { timestamps: true }
);

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
