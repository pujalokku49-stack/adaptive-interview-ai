/**
 * Base class for all predictable, operational errors in the system
 * (e.g. validation failures, not-found resources, auth failures).
 *
 * Errors that are NOT instances of AppError are treated as programmer
 * errors / bugs and are never leaked to the client with their raw message.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
