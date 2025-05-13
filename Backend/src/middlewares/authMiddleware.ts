import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;  // More specific type for user
    }
  }
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables.");
  process.exit(1);  // Exit application if no JWT_SECRET
}

export const authMiddleware = (roles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];  // Get token from the Authorization header

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    try {
      // No decoding or user lookup, just proceed to the next middleware
      req.user = {};  // You can replace this with actual user logic if needed

      next();  // Proceed to next middleware or controller
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};
