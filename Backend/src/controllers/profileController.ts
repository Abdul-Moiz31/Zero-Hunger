import { Request, Response } from 'express';
import User from '../models/User';
import Food from '../models/Food';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';

/** GET /api/profiles/:id — public profile */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
    .select('name role organization_name contact_number bio website address joinedDate rating completedOrders isApproved status preferences');

  if (!user || !user.isApproved) throw new AppError('Profile not found', 404);

  let stats: Record<string, number> = {};
  if (user.role === 'donor') {
    const [total, completed] = await Promise.all([
      Food.countDocuments({ donorId: user._id }),
      Food.countDocuments({ donorId: user._id, status: 'completed' }),
    ]);
    stats = { totalDonations: total, completedDonations: completed };
  } else if (user.role === 'ngo') {
    const accepted = await Food.countDocuments({ ngoId: user._id });
    stats = { acceptedDonations: accepted };
  } else if (user.role === 'volunteer') {
    stats = { completedDeliveries: user.completedOrders, rating: user.rating };
  }

  res.json({ user, stats });
});

/** PATCH /api/profiles/me — update own profile */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const allowed = ['bio', 'website', 'address', 'contact_number', 'preferences'];
  const updates: Record<string, unknown> = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true, runValidators: true })
    .select('-password -resetPasswordToken -resetPasswordExpires');
  if (!user) throw new AppError('User not found', 404);

  res.json(user);
});
