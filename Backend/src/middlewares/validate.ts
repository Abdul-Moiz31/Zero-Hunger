import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

/**
 * Validates `req.body` against a Zod schema. On success, replaces the body with
 * the parsed (and coerced) value. On failure, responds 400 with field messages.
 *
 * Note: used for JSON bodies. Multipart routes (file uploads) validate inline in
 * their controllers because the body arrives as strings alongside the file.
 */
export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.') || 'field'}: ${i.message}`)
        .join('; ');
      return res.status(400).json({ message });
    }
    req.body = result.data;
    next();
  };

export default validateBody;
