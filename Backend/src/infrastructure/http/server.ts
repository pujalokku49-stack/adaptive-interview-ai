import { createApp } from '@infrastructure/http/app';
import { env } from '@infrastructure/config/env';
import { logger } from '@infrastructure/logger/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`Swagger docs available at http://localhost:${env.PORT}/docs`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close((err?: Error) => {
    if (err) {
      logger.error(err, 'Error during server shutdown');
      process.exit(1);
    }
    logger.info('Server closed. Process exiting.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
