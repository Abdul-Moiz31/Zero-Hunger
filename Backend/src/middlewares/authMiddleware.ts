import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import User from "../models/User";
import jwt from "jsonwebtoken";

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = decoded;
      // req.user = {}; 
       if (roles.length && !roles.includes((decoded as any).role)) {
        console.log(" role " , roles);
        
        return res.status(403).json({ message: "Forbidden: Access denied" });
      }

      next();  // Proceed to next middleware or controller
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );
    res.status(200).json({ token, user: { _id: user._id, role: user.role, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
