import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../../../package.json';

// Import all documentation parts
import authPaths from './paths/auth.path.json';
import userPaths from './paths/user.path.json';

// Import all schemas
import userSchema from './schemas/user.schema.json';

// Import all responses
import successResponses from './responses/success.response.json';
import errorResponses from './responses/error.response.json';

// Import all parameters
import parameters from './parameters/parameters.json';
import envConfig from '../configs/env.config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: `${envConfig.app.name} API Documentation`,
            version,
            description: 'API documentation for Lamp Driving ',
        },
        servers: [
            {
                url: 'https://api.lampdriving.com/api/v1',
                description: 'Local server',
            },
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Local server',
            },
            {
                url: 'https://lampdriving-backend.vercel.app/api/v1',
                description: 'Production server',
            },
        ],
        paths: {
            ...authPaths,
            ...userPaths
        },
        components: {
            schemas: {
                ...userSchema,
            },
            responses: {
                ...successResponses,
                ...errorResponses
            },
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            },
            parameters: {
                ...parameters
            }
        },
    },
    apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express) {
    // Swagger page
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: `${envConfig.app.name} API Documentation`
    }));

    // Docs in JSON format
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

export default swaggerDocs;