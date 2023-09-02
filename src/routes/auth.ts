import express from 'express';
import passportGoogle from '../services/passport.google.service';
import passportGithub from '../services/passport.github.service';
const router = express.Router();

router.get(
    '/google',
    passportGoogle.authenticate('google', {
        scope: ['email', 'profile']
    })
);

router.get(
    '/google/callback',
    passportGoogle.authenticate('google', {
        failureRedirect: '/v1/auth/failure',
        failureFlash: true,
        successRedirect: '/v1/hotels' // will replace front end Home URL here
    })
);

router.get(
    '/github',
    passportGithub.authenticate('github', {
        scope: ['user:email']
    })
);

router.get(
    '/github/callback',
    passportGithub.authenticate('github', {
        failureRedirect: '/v1/auth/failure',
        failureFlash: true,
        successRedirect: '/v1/hotels/1/coupons' // will replace front end Home URL here
    })
);

router.get('/failure', (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.session?.destroy(function (err: any) {
        if (err) return res.redirect('/');
        res.clearCookie('sid');
        res.redirect('/login');
    });
});

export default router;
