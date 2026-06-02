import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/** 404 handler for unmatched routes. */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Centralized error handler. Maps known error types to clean status codes and
 * messages, never leaks stack traces or internal error objects to clients in
 * production, and always logs the full error server-side.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Something went wrong. Please try again later.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for "${err.path}".`;
  } else if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: number }).code === 11000
  ) {
    statusCode = 409;
    message = 'A record with that value already exists.';
  } else if (err instanceof Error && err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err instanceof Error && err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please sign in again.';
  }

  // Always log the real error server-side.
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  const body: Record<string, unknown> = { message };
  // Only expose stack/details outside production to aid debugging.
  if (!env.isProduction && err instanceof Error) {
    body.error = err.message;
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
