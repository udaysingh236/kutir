import express from 'express';
import indexRouter from './routes/index';
import hotelRouter from './routes/hotels';
import swaggerDocs from './utils/swagger';
const app = express();
const port = process.env.port || 3000;

swaggerDocs(app, port);
app.use('/v1/', indexRouter);
app.use('/v1/hotels', hotelRouter);

export default app;
