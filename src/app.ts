import express, { Errback, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieSession from 'cookie-session';
import passport from './services/auth.service';
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
import * as auth from './services/auth.service';
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

app.use(express.json());
app.use(morgan('tiny'));
app.use('/v1/auth', authRouter);
swaggerDocs(app, port, auth.checkUserLoggedIn);
app.use('/v1/', auth.checkUserLoggedIn, indexRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, hotelRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, roomRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, employeeRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, couponRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, voucherRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, rateRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, availbilityRouter);
app.use('/v1/hotels', auth.checkUserLoggedIn, reservationRouter);
app.use((error: Errback, req: Request, res: Response, next: NextFunction) => {
    if (error) {
        logger.fatal(`Error middleware triggered, error was ${error}`);
        res.clearCookie('kutir-session');
        res.redirect('/login');
    } else {
        next();
    }
});

export default app;
