import { Express, Request, Response } from 'express-serve-static-core';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi  from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Kutir, Hotel Management Tool",
            version: "1.0.0"
        }
    },
    apis: ["./src/routes/index.ts"]
}

const swaggerSpecs = swaggerJsdoc(options);

const generateSwaggerDocs = (app: Express, port: string | number) => {
    // Swagger UI Docs
    app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

    // Swagger Json Docs
    app.use('/v1/docs.json', (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpecs);
    })
    console.log(`API UI Docs available at http://localhost:${port}/v1/api-docs`);
    console.log(`Docs available at http://localhost:${port}/v1/docs.json`);
}

export default generateSwaggerDocs;