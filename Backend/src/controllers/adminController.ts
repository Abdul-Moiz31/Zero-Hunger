import { Request, Response } from 'express';
import User from '../models/User';
import Food from '../models/Food';
import { sendApprovalEmail } from '../emails/sendApprovalEmail';

// Define types for clarity
interface UserDocument {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'donor' | 'ngo' | 'volunteer';
  isApproved?: boolean;
  createdAt: string;
}

interface FoodDonationDocument {
  _id: string;
  donorId: { name: string };
  ngoId?: { name: string };
  volunteerId?: { name: string };
  title: string;
  quantity: number;
  unit: string;
  pickup_location: string;
  createdAt: string;
}

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).lean<UserDocument[]>();
    const ngoCount = await User.countDocuments({ role: 'ngo' });
    const donorCount = await User.countDocuments({ role: 'donor' });
    const volunteerCount = await User.countDocuments({ role: 'volunteer' });
    const donationCount = await Food.countDocuments();

    return res.status(200).json({ ngoCount, donorCount, volunteerCount, users, donationCount });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('getDashboardStats error:', errMsg);
    res.status(500).json({ message: 'Server error while fetching dashboard stats', error: errMsg });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (status === undefined) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(404).json({ message: 'User does not exist' });
    }
    if (userExist.isApproved && status) {
      return res.status(400).json({ message: 'User is already approved' });
    }
    if (userExist.isApproved && !status) {
      return res.status(400).json({ message: 'Cannot unapprove an already approved user' });
    }
    await User.findByIdAndUpdate(userId, { isApproved: status });
    // Send approval email if status is true
    if (status && !userExist.isApproved) {
      await sendApprovalEmail({
        to: userExist.email,
        name: userExist.name,
        role: userExist.role
      });
    }
    res.status(200).json({ message: status ? 'User approved successfully' : 'Status updated successfully' });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('updateUserStatus error:', errMsg);
    res.status(500).json({ message: 'Server error while updating user status', error: errMsg });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('deleteUser error:', errMsg);
    res.status(500).json({ message: 'Server error while deleting user', error: errMsg });
  }
};

export const getFoodDonations = async (req: Request, res: Response) => {
  try {
    const donations = await Food.find()
      .populate('donorId', 'name')
      .populate('ngoId', 'name')
      .populate('volunteerId', 'name')
      .lean<FoodDonationDocument[]>();

    const formattedDonations = donations.map((donation) => ({
      _id: donation._id.toString(),
      donorName: donation.donorId?.name || 'Unknown',
      ngoName: donation.ngoId?.name || 'Not Claimed',
      volunteerName: donation.volunteerId?.name || 'Not Assigned',
      title: donation.title,
      quantity: donation.quantity,
      unit: donation.unit,
      pickup_location: donation.pickup_location,
      createdAt: donation.createdAt,
    }));

    res.status(200).json(formattedDonations);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('getFoodDonations error:', errMsg);
    res.status(500).json({ message: 'Server error while fetching food donations', error: errMsg });
  }
};

export const deleteFoodDonation = async (req: Request, res: Response) => {
  try {
    const { donationId } = req.params;

    if (!donationId) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const donationExist = await Food.findById(donationId);
    if (!donationExist) {
      return res.status(404).json({ message: 'Donation does not exist' });
    }

    await Food.findByIdAndDelete(donationId);
    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('deleteFoodDonation error:', errMsg);
    res.status(500).json({ message: 'Server error while deleting food donation', error: errMsg });
  }
};