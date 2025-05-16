import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendConfirmationEmail } from "../emails/sendConfirmationEmail";
import { sendResetPasswordEmail, sendPasswordResetConfirmation } from "../emails/sendResetPasswordEmail";
import crypto from "crypto";

export const register = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    role,
    organization_name,
    contact_number,
    ngoId,
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Base user payload
    const userPayload: any = {
      name,
      email,
      password, // Password will be hashed by pre-save hook
      role, 
      organization_name,
      contact_number,
    };

    if (role === "volunteer") {
      userPayload.ngoId = ngoId;
      userPayload.isApproved = false;
    }
    const user = new User(userPayload);
    await user.save();

    await sendConfirmationEmail({ to: email, name, role });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    // Set the token in a secure, httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in prod
      sameSite: "none", // Crucial for localhost cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong during login" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user with that email" });

    // Generate and hash reset token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(expiry);
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetPasswordEmail(email, link);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the incoming token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendPasswordResetConfirmation(user.email);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getOwnUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getOrgsNames=async(req,res)=>{

  const orgs=await User.find({role:"ngo"}).select("organization_name");

  res.json(orgs)
}
