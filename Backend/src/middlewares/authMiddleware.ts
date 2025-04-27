import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // You can make this stricter later if you want
    }
  }
}

export const authMiddleware = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 🛡️ Get token from cookies (use cookies for security reasons)
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    try {
      // 🛡️ Verify token and decode user information
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };

      // 🛡️ Find user from DB using the decoded user id
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 🛡️ Optional role-based access control (check if user has the correct role)
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden: Role mismatch' });
      }

      // 🛡️ Attach the user to the request object for downstream access
      req.user = user;

      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  };
};
