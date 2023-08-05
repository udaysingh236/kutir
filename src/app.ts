import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import passport from './services/passport';
import indexRouter from './routes/index';
import hotelRouter from './routes/hotels';
import roomRouter from './routes/rooms';
import employeeRouter from './routes/employee';
import couponRouter from './routes/coupons';
import voucherRouter from './routes/vouchers';
import rateRouter from './routes/rates';
import availbilityRouter from './routes/availability';
import reservationRouter from './routes/reservation';
import authRouter from './routes/auth';
import swaggerDocs from './utils/swagger';
import { logger } from './utils/logger';
const app = express();
const port = process.env.port || 3000;

app.use(helmet());

app.use(
    cookieSession({
        name: 'kutir-session',
        maxAge: 60 * 60 * 1000, // 1 hour
        keys: [process.env.COOKIE_KEY ?? '']
    })
);
app.use(passport.initialize());
app.use(passport.session());

function checkUserLoggedIn(req: Request, res: Response, next: NextFunction) {
    logger.debug(`Current user is ${req.user}`);
    const isUserLoggedIn = req.isAuthenticated() && req.user;
    if (!isUserLoggedIn) {
        return res.status(401).send({
            error: 'You are not logged in..!!'
        });
    }
    next();
}

app.use(express.json());
app.use(morgan('tiny'));
app.use('/v1/auth', authRouter);
swaggerDocs(app, port, checkUserLoggedIn);
app.use('/v1/', checkUserLoggedIn, indexRouter);
app.use('/v1/hotels', checkUserLoggedIn, hotelRouter);
app.use('/v1/hotels', checkUserLoggedIn, roomRouter);
app.use('/v1/hotels', checkUserLoggedIn, employeeRouter);
app.use('/v1/hotels', checkUserLoggedIn, couponRouter);
app.use('/v1/hotels', checkUserLoggedIn, voucherRouter);
app.use('/v1/hotels', checkUserLoggedIn, rateRouter);
app.use('/v1/hotels', checkUserLoggedIn, availbilityRouter);
app.use('/v1/hotels', checkUserLoggedIn, reservationRouter);

export default app;
