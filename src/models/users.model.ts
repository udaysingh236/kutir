import { Document, Model, model, Schema, Types } from 'mongoose';

export interface IUser extends Document {
    username: string;
    connectedSocialAccounts: number;
    google: {
        email: string;
        photoUrl: string;
        profileId: string;
    };
    github: {
        email: string;
        profileId: string;
        photoUrl: string;
    };
}

const userSchema: Schema = new Schema(
    {
        username: String,
        connectedSocialAccounts: {
            type: Number,
            default: 1
        },
        google: {
            email: String,
            photoUrl: String,
            profileId: String
        },
        github: {
            email: String,
            profileId: String
        }
    },
    { timestamps: true }
);

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
