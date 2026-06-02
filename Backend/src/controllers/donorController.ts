import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Food from '../models/Food';
import User from '../models/User';
import Notification from '../models/Notification';
import uploadImage from '../utils/uploadImage';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { emitNotification } from '../utils/notify';

interface CreateDonationBody {
  title: string;
  description: string;
  quantity: number;
  unit?: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  temperature_requirements?: string;
  contact_number?: string;
  dietary_info?: string;
  pickup_location?: string;
}

// Create a new food donation
export const createDonation = asyncHandler(
  async (req: Request<object, object, CreateDonationBody>, res: Response) => {
    const {
      title,
      description,
      quantity,
      unit,
      expiry_time,
      pickup_window_start,
      pickup_window_end,
      temperature_requirements,
      contact_number,
      dietary_info,
      pickup_location,
    } = req.body;

    if (!title || !description || !quantity || !expiry_time || !pickup_window_start || !pickup_window_end) {
      throw new AppError('Title, description, quantity, expiry and pickup window are required.', 400);
    }

    const url = req.file ? await uploadImage(req.file) : undefined;

    const food = await Food.create({
      donorId: new mongoose.Types.ObjectId(req.user!.id),
      title,
      description,
      quantity,
      unit,
      expiry_time,
      pickup_window_start,
      pickup_window_end,
      temperature_requirements,
      contact_number,
      dietary_info,
      img: url,
      status: 'available',
      pickup_location,
    });

    // Notify all NGOs about the new donation.
    const ngos = await User.find({ role: 'ngo', isApproved: true }).select('_id');
    await Promise.all(
      ngos.map((ngo) =>
        emitNotification({
          recipientId: ngo._id,
          message: `New food donation "${title}" is available for pickup.`,
          taskId: food._id,
          type: 'new_donation',
        })
      )
    );

    res.status(201).json({ message: 'Donation created successfully', food });
  }
);

// Dashboard stats for donor
export const getDonorStats = asyncHandler(async (req: Request, res: Response) => {
  const donorId = new mongoose.Types.ObjectId(req.user!.id);
  const [totalDonations, pendingDonations, completedDonations] = await Promise.all([
    Food.countDocuments({ donorId }),
    Food.countDocuments({ donorId, status: 'available' }),
    Food.countDocuments({ donorId, status: 'completed' }),
  ]);

  res.status(200).json({ totalDonations, pendingDonations, completedDonations });
});

// View all donations created by logged-in donor
export const getMyDonations = asyncHandler(async (req: Request, res: Response) => {
  const donorId = new mongoose.Types.ObjectId(req.user!.id);
  const donations = await Food.find({ donorId }).sort({ createdAt: -1 });
  res.status(200).json(donations);
});

// Delete a donation
export const deleteDonation = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const donorId = new mongoose.Types.ObjectId(req.user!.id);
  const donation = await Food.findOne({ _id: id, donorId });

  if (!donation) throw new AppError('Donation not found or unauthorized', 404);

  await Food.findByIdAndDelete(id);
  res.status(200).json({ message: 'Donation deleted successfully' });
});

// Update donation status (e.g., cancel/assign)
export const updateDonationStatus = asyncHandler(
  async (req: Request<{ id: string }, object, { status: string; ngoId?: string }>, res: Response) => {
    const { id } = req.params;
    const { status, ngoId } = req.body;

    const donorId = new mongoose.Types.ObjectId(req.user!.id);
    const donation = await Food.findOne({ _id: id, donorId });
    if (!donation) throw new AppError('Donation not found or unauthorized', 404);

    donation.status = status as typeof donation.status;

    if (status === 'assigned' && ngoId) {
      const ngo = await User.findById(ngoId);
      if (!ngo || ngo.role !== 'ngo') throw new AppError('NGO not found', 404);

      donation.ngoId = ngo._id;
      await emitNotification({
        recipientId: donation.donorId,
        message: `Your donation "${donation.title}" has been claimed by ${ngo.organization_name || 'an NGO'}.`,
        taskId: donation._id,
        type: 'claimed',
      });
    }

    if (status === 'completed') {
      const volunteer = donation.volunteerId ? await User.findById(donation.volunteerId) : null;
      await emitNotification({
        recipientId: donation.donorId,
        message: `Your donation "${donation.title}" has been completed by ${volunteer?.name || 'a volunteer'}.`,
        taskId: donation._id,
        type: 'completed',
      });
    }

    await donation.save();
    res.status(200).json({ message: 'Donation status updated successfully', donation });
  }
);

// Get notifications for the current user
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = new mongoose.Types.ObjectId(req.user!.id);
  const notifications = await Notification.find({ recipientId })
    .populate('taskId', 'title')
    .sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(
  async (req: Request<{ notificationId: string }>, res: Response) => {
    const { notificationId } = req.params;
    const recipientId = new mongoose.Types.ObjectId(req.user!.id);
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId },
      { read: true },
      { new: true }
    );

    if (!notification) throw new AppError('Notification not found', 404);
    res.status(200).json({ message: 'Notification marked as read', notification });
  }
);
