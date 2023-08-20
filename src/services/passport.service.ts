import passport from 'passport';
import passportGoogle, { Profile, VerifyCallback } from 'passport-google-oauth20';
import User from '../models/users.model';
import { logger } from '../utils/logger';
const GoogleStrategy = passportGoogle.Strategy;

const googleAuthConfig = {
    clientID: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL ?? ''
};

passport.use(
    new GoogleStrategy(googleAuthConfig, async function (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) {
        try {
            logger.debug(`profile ${JSON.stringify(profile)}`);
            const userAlreadyExists = await User.findOne({ googleId: profile.id });
            if (!userAlreadyExists) {
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                    photoUrl: profile.photos?.[0].value
                    // we are using optional chaining because profile.emails may be undefined.
                });
                if (newUser) {
                    done(null, newUser);
                }
            } else {
                done(null, userAlreadyExists);
            }
        } catch (err) {
            logger.error(`Error in GoogleStrategy, error is ${err}`);
        }
    })
);

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
