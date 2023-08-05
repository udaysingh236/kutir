import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './logger';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kutir, Hotel Management Tool',
            version: '1.0.0'
        }
    },
    apis: ['./src/routes/*.ts', './routes/*.js'] //one for local and one for lambda
};

const swaggerSpecs = swaggerJsdoc(options);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateSwaggerDocs = (app: Express, port: string | number, loginCheckMiddle: any) => {
    // Swagger UI Docs
    app.use('/v1/api-docs', loginCheckMiddle, swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

    // Swagger Json Docs
    app.use('/v1/docs.json', loginCheckMiddle, (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpecs);
    });
    logger.info(`API UI Docs available at http://localhost:${port}/v1/api-docs`);
    logger.info(`Docs available at http://localhost:${port}/v1/docs.json`);
};

export default generateSwaggerDocs;
