// import * as express from 'express';

export {};
declare global {
    namespace Express {
        interface User {
            _id?: string;
            username: string;
            connectedSocialAccounts: number;
            google: {
                email: string;
                profileId: string;
                photoUrl: string;
            };
            github: {
                email: string;
                profileId: string;
                photoUrl: string;
            };
        }
        interface Request {
            user?: User | undefined;
        }
    }
}
