import passport from 'passport';
import passportGoogle, {
    Profile,
    StrategyOptionsWithRequest,
    VerifyCallback
} from 'passport-google-oauth20';
import User from '../models/users.model';
import { logger } from '../utils/logger';
import { IUser } from '../models/users.model';
const GoogleStrategy = passportGoogle.Strategy;

const googleAuthConfig: StrategyOptionsWithRequest = {
    clientID: process.env.GOOGLE_CLIENT_ID ?? '123XYZ',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'XYZ',
    callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '/abc/',
    scope: ['profile', 'email'],
    passReqToCallback: true
};

passport.use(
    new GoogleStrategy(googleAuthConfig, async function (
        req: Express.Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) {
        try {
            logger.debug(`profile ${JSON.stringify(profile)}`);
            const email = profile.emails?.[0].value;
            const photoUrl = profile.photos?.[0].value;
            if (!email)
                return done(new Error('Failed to receive email from Google. Please try again :('));
            const user: IUser | null = await User.findOne({
                $or: [{ 'google.email': email }, { 'github.email': email }]
            });
            if (req.user) {
                if (!req.user.google || (!req.user.google.email && !req.user.google.profileId)) {
                    /**
                     * 1. req.user exists and no google account is currently linked
                     * 2. there's no existing account with google login's email
                     * 3. google login's email is present in req.user's object for any provider (indicates true ownership)
                     */
                    //                              github _id === login _id
                    if (!user || (user && user._id.toString() === req.user._id?.toString())) {
                        await User.updateOne(
                            { _id: req.user._id },
                            {
                                $set: {
                                    google: { email: email, profileId: profile.id, photoUrl },
                                    connectedSocialAccounts: req.user.connectedSocialAccounts + 1
                                }
                            },
                            { upsert: true }
                        );
                        return done(null, req.user);
                    }
                    // cannot sync google account, other account with google login's email already exists
                }
                return done(null, req.user);
            } else {
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = await User.create({
                        name: profile.displayName,
                        connectedSocialAccount: 1,
                        google: {
                            profileId: profile.id,
                            email: email,
                            photoUrl
                        }
                    });
                    return done(null, newUser);
                }
            }
        } catch (err) {
            logger.error(`Error in GoogleStrategy, error is ${err}`);
            done(new Error(`Error in GoogleStrategy, error is ${err}`));
        }
    })
);

export default passport;
