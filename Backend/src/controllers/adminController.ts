import { Request, Response } from 'express';
import User from '../models/User';
import Food from '../models/Food';
import { sendApprovalEmail } from '../emails/sendApprovalEmail';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { emitNotification } from '../utils/notify';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [users, ngoCount, donorCount, volunteerCount, donationCount] = await Promise.all([
    User.find({ role: { $ne: 'admin' } }).select('-password').lean(),
    User.countDocuments({ role: 'ngo' }),
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'volunteer' }),
    Food.countDocuments(),
  ]);

  res.status(200).json({ ngoCount, donorCount, volunteerCount, users, donationCount });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId, status } = req.body;
  if (!userId) throw new AppError('User ID is required', 400);
  if (status === undefined) throw new AppError('Status is required', 400);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User does not exist', 404);

  if (user.isApproved && status) throw new AppError('User is already approved', 400);
  if (user.isApproved && !status) throw new AppError('Cannot unapprove an already approved user', 400);

  const wasApproved = user.isApproved;
  user.isApproved = status;
  await user.save();

  if (status && !wasApproved) {
    await sendApprovalEmail({ to: user.email, name: user.name, role: user.role });
    await emitNotification({
      recipientId: user._id,
      message: 'Your account has been approved. Welcome to Zero Hunger!',
      type: 'approved',
    });
  }

  res.status(200).json({ message: status ? 'User approved successfully' : 'Status updated successfully' });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new AppError('User does not exist', 404);

  await User.findByIdAndDelete(userId);
  res.status(200).json({ message: 'User deleted successfully' });
});

export const getFoodDonations = asyncHandler(async (_req: Request, res: Response) => {
  const donations = await Food.find()
    .populate('donorId', 'name')
    .populate('ngoId', 'name')
    .populate('volunteerId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const formatted = donations.map((d) => {
    const donor = d.donorId as unknown as { name?: string } | null;
    const ngo = d.ngoId as unknown as { name?: string } | null;
    const volunteer = d.volunteerId as unknown as { name?: string } | null;
    return {
      _id: String(d._id),
      donorName: donor?.name || 'Unknown',
      ngoName: ngo?.name || 'Not Claimed',
      volunteerName: volunteer?.name || 'Not Assigned',
      title: d.title,
      quantity: d.quantity,
      unit: d.unit,
      status: d.status,
      pickup_location: d.pickup_location,
      createdAt: d.createdAt,
    };
  });

  res.status(200).json(formatted);
});

export const deleteFoodDonation = asyncHandler(async (req: Request, res: Response) => {
  const { donationId } = req.params;
  const donation = await Food.findById(donationId);
  if (!donation) throw new AppError('Donation does not exist', 404);

  await Food.findByIdAndDelete(donationId);
  res.status(200).json({ message: 'Donation deleted successfully' });
});
