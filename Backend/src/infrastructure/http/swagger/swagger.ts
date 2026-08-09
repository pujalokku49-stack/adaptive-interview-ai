import swaggerJsdoc from 'swagger-jsdoc';

import { env } from '@infrastructure/config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ABTalks AI Interview Agent API',
      version: env.API_VERSION,
      description: 'Backend API for the ABTalks AI Interview Agent (Clean Architecture)',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local server',
      },
    ],
  },
  // Picks up JSDoc annotations from route files in both dev (ts-node) and
  // production (compiled dist) so docs never drift from the running code.
  apis: [
    './src/interfaces/http/routes/**/*.ts',
    './dist/interfaces/http/routes/**/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
