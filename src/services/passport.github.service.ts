import passport, { Profile } from 'passport';
import passportGithub, { StrategyOptionsWithRequest } from 'passport-github2';
import User from '../models/users.model';
import { logger } from '../utils/logger';
import { IUser } from '../models/users.model';
import { VerifyCallback } from 'passport-google-oauth20';
const GitHubStrategy = passportGithub.Strategy;

const githubAuthConfig: StrategyOptionsWithRequest = {
    clientID: process.env.GITHUB_CLIENT_ID ?? '123XYZ',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? 'XYZ',
    callbackURL: process.env.GITHUB_CALLBACK_URL ?? '/abc/',
    scope: ['profile', 'email'],
    passReqToCallback: true
};

passport.use(
    new GitHubStrategy(githubAuthConfig, async function (
        req: Express.Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) {
        try {
            logger.debug(`profile ${JSON.stringify(profile)}`);
            const email = profile.emails && profile.emails.length ? profile.emails[0].value : null;
            const photoUrl = profile.photos?.[0].value;
            if (!email)
                return done(new Error('Failed to receive email from Github. Please try again :('));
            const user: IUser | null = await User.findOne({
                $or: [{ 'google.email': email }, { 'github.email': email }]
            });
            if (req.user) {
                if (!req.user.github || (!req.user.github.email && !req.user.github.profileId)) {
                    /**
                     * 1. req.user exists and no github account is currently linked
                     * 2. there's no existing account with github login's email
                     * 3. github login's email is present in req.user's object for any provider (indicates true ownership)
                     */
                    //                              github _id === login _id
                    if (!user || (user && user._id.toString() === req.user._id?.toString())) {
                        await User.updateOne(
                            { _id: req.user._id },
                            {
                                $set: {
                                    github: { email: email, profileId: profile.id, photoUrl },
                                    connectedSocialAccounts: req.user.connectedSocialAccounts + 1
                                }
                            },
                            { upsert: true }
                        );
                        return done(null, req.user);
                    }
                    // cannot sync github account, other account with github login's email already exists
                }
                return done(null, req.user);
            } else {
                if (user) {
                    return done(null, user);
                } else {
                    const newUser = await User.create({
                        username: profile.displayName,
                        connectedSocialAccount: 1,
                        github: {
                            profileId: profile.id,
                            email: email,
                            photoUrl
                        }
                    });
                    return done(null, newUser);
                }
            }
        } catch (err) {
            logger.error(`Error in GithubStrategy, error is ${err}`);
            done(new Error(`Error in GithubStrategy, error is ${err}`));
        }
    })
);

export default passport;
