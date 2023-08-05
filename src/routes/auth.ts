import express from 'express';
import passport from 'passport';
const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/v1/failure',
        successRedirect: '/v1/hotels' // will replace front end Home URL here
    })
);

export default router;
