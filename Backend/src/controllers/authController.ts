import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendConfirmationEmail } from '../emails/sendConfirmationEmail';
import {
  sendResetPasswordEmail,
  sendPasswordResetConfirmation,
} from '../emails/sendResetPasswordEmail';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user: InstanceType<typeof User>) => {
  const obj = user.toObject() as Record<string, unknown>;
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, organization_name, contact_number, ngoId } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      existingUser.isApproved
        ? 'You are already registered. Please sign in.'
        : 'Your request is already pending approval.',
      409
    );
  }

  const userPayload: Record<string, unknown> = {
    name,
    email,
    password, // hashed by the model pre-save hook
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

  res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  if (!user.isApproved) {
    throw new AppError('Your account is pending admin approval.', 403);
  }

  const token = signToken(String(user._id), user.role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ token, user: sanitizeUser(user) });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const link = `${env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetPasswordEmail(email, link);
  }

  res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = password; // hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await sendPasswordResetConfirmation(user.email);

  res.json({ message: 'Your password has been reset successfully.' });
});

export const getOwnUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError('User not authenticated', 401);

  const user = await User.findById(req.user.id).select('-password');
  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({ user });
});

export const getOrgsNames = asyncHandler(async (_req: Request, res: Response) => {
  const orgs = await User.find({ role: 'ngo', isApproved: true }).select('organization_name');
  res.json(orgs);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError('User not authenticated', 401);

  const { name, organization_name, contact_number } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404);

  if (name) user.name = name;
  if (organization_name !== undefined) user.organization_name = organization_name;
  if (contact_number !== undefined) user.contact_number = contact_number;

  if (
    (user.role === 'ngo' || user.role === 'volunteer') &&
    (!user.organization_name || !user.contact_number)
  ) {
    throw new AppError(
      'Organization name and contact number are required for NGO or volunteer accounts.',
      400
    );
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
});
