import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const mongoUri: string = process.env.MONGO_URI!;
const port = process.env.port ?? 3000;

async function startServer(conn: string) {
    try {
        await mongoose.connect(conn);
        app.listen(port, () => {
            logger.info(`server is running on ${port}`);
        });
    } catch (error) {
        logger.error(`Error starting the server, Error is ${error}. Exiting the process...!!`);
        process.exit(1);
    }
}

startServer(mongoUri);

// Listen to all the error events that may be raised when the app is live
mongoose.connection.on('error', () => {
    logger.fatal(`Error connecting to MongoDB..!!!`);
    process.exit(1);
});

mongoose.connection.on('disconnected', () => {
    logger.fatal(`Disconnected from MongoDB..!!!`);
    process.exit(1);
});

mongoose.connection.on('connecting', () => {
    logger.info(`Trying to connect to MongoDB`);
});

mongoose.connection.on('connected', () => {
    logger.info(`Connected to MongoDB.!!!`);
});

process.on('SIGINT', function () {
    logger.info('Caught SIGINT signal');
    // Close mongoDB connection then exit
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGQUIT', function () {
    logger.info('Caught SIGQUIT signal');
    // Close mongoDB connection then exit
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', function () {
    logger.info('Caught SIGTERM signal');
    // Close mongoDB connection then exit
    mongoose.connection.close();
    process.exit(1);
});
