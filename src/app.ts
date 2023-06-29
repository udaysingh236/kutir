import express from 'express';
import morgan from 'morgan';
import indexRouter from './routes/index';
import hotelRouter from './routes/hotels';
import roomRouter from './routes/rooms';
import employeeRouter from './routes/employee';
import swaggerDocs from './utils/swagger';
const app = express();
const port = process.env.port || 3000;

app.use(express.json());
app.use(morgan('tiny'));
swaggerDocs(app, port);
app.use('/v1/', indexRouter);
app.use('/v1/hotels', hotelRouter);
app.use('/v1/hotels', roomRouter);
app.use('/v1/hotels', employeeRouter);

export default app;
