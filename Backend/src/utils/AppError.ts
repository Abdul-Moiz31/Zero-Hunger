/**
 * Operational error with an HTTP status code. Throw this from controllers/services
 * for expected failure cases (validation, not-found, forbidden, etc). The global
 * error handler turns it into a clean JSON response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default AppError;
