import { Request, Response } from 'express';
import  { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { sendConfirmationEmail } from '../emails/sendConfirmationEmail';
import { sendResetPasswordEmail, sendPasswordResetConfirmation } from '../emails/sendResetPasswordEmail';
import crypto from 'crypto';

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
      if (!existingUser.isApproved) {
        return res.status(400).json({ message: 'Your request is already pending approval.' });
      } else {
        return res.status(400).json({ message: 'You are already approved. Please check your email.' });
      }
    }

    // Base user payload
    const userPayload: Record<string, unknown> = {
      name,
      email,
      password, // Password will be hashed by pre-save hook
      role, 
      organization_name,
      contact_number,
    };

    if (role === 'volunteer') {
      userPayload.ngoId = ngoId;
      userPayload.isApproved = false;
    }
    const user = new User(userPayload);
    await user.save();

    await sendConfirmationEmail({ to: email, name, role });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Registration error:', error);
      res
        .status(500)
        .json({ message: 'Something went wrong during registration' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
const user = await User.findOne({ email });
if (!user) return res.status(404).json({ message: 'User not found' });

const isMatch = await user.comparePassword(password);
if (!isMatch)
  return res.status(401).json({ message: 'Invalid credentials' });

if (!user.isApproved) {
  return res.status(403).json({ message: 'Your account is pending admin approval.' });
}

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    // Set the token in a secure, httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in prod
      sameSite: 'none', // Crucial for localhost cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ token, user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Something went wrong during login' });
    }
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No user with that email' });

    // Generate and hash reset token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(expiry);
    await user.save();

    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetPasswordEmail(email, link);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: 'Something went wrong' });
    }
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
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendPasswordResetConfirmation(user.email);

    res.json({ message: 'Password has been reset successfully' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Reset password error:', err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
};

export const getOwnUser = async (req: Request, res: Response) => {
  try {
    console.log('getOwnUser - req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found in database for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
};

export const getOrgsNames=async(req: Request,res : Response)=>{

  const orgs=await User.find({role:'ngo'}).select('organization_name');

  res.json(orgs);
};
export const updateProfile = async (req: Request, res: Response) => {
  // console.log('Received update profile request:', req.body, 'User:', req.user);
  try {
    const { name, organization_name, contact_number } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await User.findById(req.user.id); // Changed from req.user._id to req.user.id to match token payload

    if (!user) {
      console.log('User not found in updateProfile for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (organization_name !== undefined) user.organization_name = organization_name;
    if (contact_number !== undefined) user.contact_number = contact_number;

    if ((user.role === 'ngo' || user.role === 'volunteer') && (!user.organization_name || !user.contact_number)) {
      return res.status(400).json({ message: 'Organization name and contact number are required for NGO or volunteer' });
    }

    await user.save();
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization_name: user.organization_name,
        contact_number: user.contact_number,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Something went wrong during profile update' });
    }
  }
};