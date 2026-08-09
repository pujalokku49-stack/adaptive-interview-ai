import { NextFunction, Request, Response } from 'express';

import { logger } from '@infrastructure/logger/logger';
import { AppError } from '@shared/errors/AppError';

interface ErrorResponseBody {
  status: 'error';
  message: string;
}

/**
 * Centralized error-handling middleware. Must be registered last.
 * Controllers and use cases never format error responses themselves —
 * they throw (or forward via `next(err)`) and this is the single place
 * that decides what the client sees.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ err, path: req.originalUrl, method: req.method }, err.message);

    const body: ErrorResponseBody = {
      status: 'error',
      message: err.message,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');

  const body: ErrorResponseBody = {
    status: 'error',
    message: 'Internal Server Error',
  };
  res.status(500).json(body);
}
