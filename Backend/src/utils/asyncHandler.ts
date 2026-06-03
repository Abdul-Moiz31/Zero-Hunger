import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler so any thrown error or rejected promise is
 * forwarded to Express's error-handling middleware instead of crashing the
 * process with an unhandled rejection.
 *
 * Generic over the request type so controllers can keep typed params/bodies
 * (e.g. `Request<{ id: string }>`) without casting.
 */
export const asyncHandler =
  <Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };

export default asyncHandler;
