import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (roles: string[] = []) => {
  return (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;

      if (roles.length && !roles.includes((decoded as any).role)) {
        return res.status(403).json({ message: 'Forbidden: Role mismatch' });
      }

      next();
    } catch {
      res.status(400).json({ message: 'Invalid token' });
    }
  };
};