import 'dotenv/config';
import app from './app';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import serverless, { Handler } from 'serverless-http';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const mongoUri: string = process.env.MONGO_URI!;
const handler = serverless(app);
module.exports.handler = async (event: Handler, context: Handler) => {
    // Make sure to add this so you can re-use mongo connection between function calls.
    // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:
    context.callbackWaitsForEmptyEventLoop = false;
    logger.info(`Mongo ready state ${mongoose.connection.readyState}`);
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
        logger.info(
            `Mongo was disconnected, trying again, Connected to MongoDB from Lambda handler`
        );
    }
    const result = await handler(event, context);
    return result;
};

// Listen to all the error events that may be raised when the app is live
mongoose.connection.on('error', () => {
    logger.fatal(`From Lambda - Error connecting to MongoDB..!!!`);
    process.exit(1);
});

mongoose.connection.on('disconnected', () => {
    logger.fatal(`From Lambda - Disconnected from MongoDB..!!!`);
    process.exit(1);
});

mongoose.connection.on('connecting', () => {
    logger.info(`From Lambda - Trying to connect to MongoDB`);
});

mongoose.connection.on('connected', () => {
    logger.info(`From Lambda - Connected to MongoDB.!!!`);
});

process.on('SIGINT', function () {
    logger.info('From Lambda - Caught SIGINT signal');
    // Close mongoDB connection then exit
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGQUIT', function () {
    logger.info('From Lambda - Caught SIGQUIT signal');
    // Close mongoDB connection then exit
    mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', function () {
    logger.info('From Lambda - Caught SIGTERM signal');
    // Close mongoDB connection then exit
    mongoose.connection.close();
    process.exit(1);
});
