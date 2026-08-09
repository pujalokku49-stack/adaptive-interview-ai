import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from '@infrastructure/config/env';
import { errorHandler } from '@infrastructure/http/middlewares/errorHandler';
import { notFoundHandler } from '@infrastructure/http/middlewares/notFoundHandler';
import { swaggerSpec } from '@infrastructure/http/swagger/swagger';
import { logger } from '@infrastructure/logger/logger';
import { candidateRouter } from '@interfaces/http/routes/candidate.routes';
import { curriculumRouter } from '@interfaces/http/routes/curriculum.routes';
import { healthRouter } from '@interfaces/http/routes/health.routes';
import { interviewPlanRouter } from '@interfaces/http/routes/interviewPlan.routes';
import { sessionRouter } from '@interfaces/http/routes/session.routes';
import { finalFeedbackRouter } from '@interfaces/http/routes/finalFeedback.routes';
import { interviewSpecRouter } from '@interfaces/http/routes/interviewSpec.routes';
import { analyticsRouter } from '@interfaces/http/routes/analytics.routes';
import { reportExportRouter } from '@interfaces/http/routes/reportExport.routes';
import { compatibilityRouter } from '@interfaces/http/routes/compatibility.routes';
import { assistantRouter } from '@interfaces/http/routes/assistant.routes';

/**
 * Composition root for the HTTP framework. Wires cross-cutting middleware
 * and mounts interface-adapter routers. Contains no business logic.
 */
export function createApp(): Application {
  const app = express();

  app.use(helmet());
  const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim());

  app.use(
    cors({
      origin:
        env.NODE_ENV === 'production'
          ? allowedOrigins
          : (origin, callback) => {
              // Allow any localhost or 127.0.0.1 origin in development
              if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                callback(null, true);
              } else {
                callback(new Error('CORS: Origin not allowed'));
              }
            },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/health', healthRouter);
  app.use('/api/assistant', assistantRouter);
  app.use(`/api/${env.API_VERSION}/assistant`, assistantRouter);
  app.use('/', compatibilityRouter);
  app.use('/api/interview', interviewSpecRouter);
  app.use(`/api/${env.API_VERSION}/interview`, interviewSpecRouter);
  app.use(`/api/${env.API_VERSION}/candidates`, candidateRouter);
  app.use(`/api/${env.API_VERSION}/curriculum`, curriculumRouter);
  app.use(`/api/${env.API_VERSION}/interview-plan`, interviewPlanRouter);
  app.use(`/api/${env.API_VERSION}/sessions`, sessionRouter);
  app.use(`/api/${env.API_VERSION}/sessions`, finalFeedbackRouter);
  app.use(`/api/${env.API_VERSION}/sessions`, reportExportRouter);
  app.use(`/api/${env.API_VERSION}/analytics`, analyticsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
