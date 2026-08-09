import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

import { AppError } from '@shared/errors/AppError';

type RequestPart = 'body' | 'params' | 'query';

/**
 * Validates and normalizes req.body / req.params / req.query against a
 * Zod schema. On success, the parsed (and type-coerced/defaulted) value
 * replaces the original so downstream controllers can trust it fully.
 * On failure, forwards a 400 AppError to the centralized error handler.
 */
export function validateRequest(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed: unknown = schema.parse(req[part]);
      (req as unknown as Record<RequestPart, unknown>)[part] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((issue) => `${issue.path.join('.') || part}: ${issue.message}`)
          .join('; ');
        next(new AppError(`Validation failed: ${message}`, 400));
        return;
      }
      next(error);
    }
  };
}
