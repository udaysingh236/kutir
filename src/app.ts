import express from 'express';
import indexRouter from  './routes/index'
import swaggerDocs from './utils/swagger'
const app = express();
const port = process.env.port || 3000;


swaggerDocs(app, port)
app.use('/v1/', indexRouter)

export default app;