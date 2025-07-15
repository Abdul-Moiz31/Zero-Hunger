import { Request, Response } from 'express';
import Food from '../models/Food';
import uploadImage from '../utils/uploadImage';
import User from '../models/User';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

// Define interfaces for request bodies
interface CreateDonationBody {
  title: string;
  description: string;
  quantity: number;
  unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  temperature_requirements?: string;
  contact_number: string;
  dietary_info?: string;
  pickup_location?: string;
}

interface UpdateDonationStatusBody {
  status: 'available' | 'assigned' | 'completed';
  ngoId?: string;
}

// Create a new food donation
export const createDonation = async (req: Request<object, object, CreateDonationBody>, res: Response) => {
  try {
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

    // Validate required fields
    if (!title || !description || !quantity || !expiry_time || !pickup_window_start || !pickup_window_end) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Image upload
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

    // Notify all NGOs about the new donation
    const ngos = await User.find({ role: 'ngo' });
    const notificationPromises = ngos.map((ngo) =>
      Notification.create({
        recipientId: ngo._id,
        message: `New food donation "${title}" is available for pickup.`,
        taskId: food._id,
        read: false,
      })
    );
    await Promise.all(notificationPromises);

    res.status(201).json({ message: 'Donation created successfully', food });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating donation:', error);
      res.status(500).json({ message: 'Failed to create donation', error: error.message });
    } else {
      console.error('Error creating donation:', error);
      res.status(500).json({ message: 'Failed to create donation', error: 'An unknown error occurred' });
    }
  }
};

// Dashboard stats for donor
export const getDonorStats = async (req: Request, res: Response) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.user!.id);
    const totalDonations = await Food.countDocuments({ donorId });
    const pendingDonations = await Food.countDocuments({ donorId, status: 'available' });
    const completedDonations = await Food.countDocuments({ donorId, status: 'completed' });

    res.status(200).json({
      totalDonations,
      pendingDonations,
      completedDonations,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch donor stats:', error);
      res.status(500).json({ message: 'Failed to fetch donor stats', error: error.message });
    } else {
      console.error('Failed to fetch donor stats:', error);
      res.status(500).json({ message: 'Failed to fetch donor stats', error: 'An unknown error occurred' });
    }
  }
};

// View all donations created by logged-in donor
export const getMyDonations = async (req: Request, res: Response) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.user!.id);
    const donations = await Food.find({ donorId }).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch donations:', error);
      res.status(500).json({ message: 'Failed to fetch donations', error: error.message });
    } else {
      console.error('Failed to fetch donations:', error);
      res.status(500).json({ message: 'Failed to fetch donations', error: 'An unknown error occurred' });
    }
  }
};

// Delete a donation
export const deleteDonation = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const donorId = new mongoose.Types.ObjectId(req.user!.id);
    const donation = await Food.findOne({ _id: id, donorId });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found or unauthorized' });
    }

    await Food.findByIdAndDelete(id);
    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting donation:', error);
      res.status(500).json({ message: 'Error deleting donation', error: error.message });
    } else {
      console.error('Error deleting donation:', error);
      res.status(500).json({ message: 'Error deleting donation', error: 'An unknown error occurred' });
    }
  }
};

// Update donation status (e.g., cancel)
export const updateDonationStatus = async (
  req: Request<{ id: string }, object, UpdateDonationStatusBody>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, ngoId } = req.body;

    if (!['available', 'assigned', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const donorId = new mongoose.Types.ObjectId(req.user!.id);
    const donation = await Food.findOne({ _id: id, donorId });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found or unauthorized' });
    }

    donation.status = status;
    if (status === 'assigned' && ngoId)  {
      if (!mongoose.Types.ObjectId.isValid(ngoId)) {
        return res.status(400).json({ message: 'Invalid NGO ID' });
      }
      
      const ngo = await User.findById(ngoId);
      if (!ngo || ngo.role !== 'ngo') {
        return res.status(404).json({ message: 'NGO not found' });
      }
      donation.ngoId = ngo._id;
      await Notification.create({
        recipientId: donation.donorId,
        message: `Your donation "${donation.title}" has been claimed by ${ngo.organization_name || 'an NGO'}`,
        taskId: donation._id,
        read: false,
      });
    }

    if (status === 'completed') {
      const volunteer = donation.volunteerId ? await User.findById(donation.volunteerId) : null;
      await Notification.create({
        recipientId: donation.donorId,
        message: `Your donation "${donation.title}" has been completed by ${volunteer?.name || 'a volunteer'}.`,
        taskId: donation._id,
        read: false,
      });
    }

    await donation.save();

    res.status(200).json({ message: 'Donation status updated successfully', donation });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to update donation status:', error);
      res.status(500).json({ message: 'Failed to update donation status', error: error.message });
    } else {
      console.error('Failed to update donation status:', error);
      res.status(500).json({ message: 'Failed to update donation status', error: 'An unknown error occurred' });
    }
  }
};

// Get notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const recipientId = new mongoose.Types.ObjectId(req.user!.id);
    const notifications = await Notification.find({ recipientId })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to fetch notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    } else {
      console.error('Failed to fetch notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications', error: 'An unknown error occurred' });
    }
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request<{ notificationId: string }>, res: Response) => {
  try {
    const { notificationId } = req.params;
    const recipientId = new mongoose.Types.ObjectId(req.user!.id);
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to mark notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
    } else {
      console.error('Failed to mark notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read', error: 'An unknown error occurred' });
    }
  }
};