import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../models/users.model';
import { logger } from '../utils/logger';

export function checkUserLoggedIn(req: Request, res: Response, next: NextFunction) {
    logger.debug(`Current user is ${req.user}`);
    const isUserLoggedIn = req.isAuthenticated() && req.user;
    if (!isUserLoggedIn) {
        return res.status(401).send({
            error: 'You are not logged in..!!'
        });
    }
    next();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
    logger.debug(`In serialize user ${JSON.stringify(user)}`);
    done(null, user['id']);
});

passport.deserializeUser(async (id: string, done) => {
    logger.debug(`In deserializeUser ${JSON.stringify(id)}`);
    try {
        const user = await User.findById(id);
        logger.debug(`user ${user}`);
        if (user) {
            done(null, user);
        } else {
            throw new Error('Got empty data from DB while deserializeUser');
        }
    } catch (error) {
        logger.error(`Error in deserializeUser, error is ${error}`);
        done('Not able to deserialize user', false);
    }
});

export default passport;
