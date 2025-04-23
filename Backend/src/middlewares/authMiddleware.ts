import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: any; // Can be typed more strictly as needed
    }
  }
}

export const authMiddleware = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Unauthorized: Token missing' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Role check
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Role mismatch' });
      }

      req.user = user; // attach full user object
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(400).json({ message: 'Invalid token' });
    }
  };
};
