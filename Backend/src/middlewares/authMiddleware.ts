import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Extend Express Request type to include the authenticated user.
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; role?: string };
  }
}

/**
 * Authentication + role-authorization middleware.
 * Validates the Bearer token, attaches `req.user`, and (optionally) enforces
 * that the user's role is in the allowed `roles` list.
 */
export const authMiddleware = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
      req.user = { id: decoded.id, role: decoded.role };

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: access denied' });
      }

      next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
    }
  };
};

export default authMiddleware;
