import { Request, Response } from "express";
import Food from "../models/Food";
import uploadImage from "../utils/uploadImage";
import User from "../models/User";
import Notification from "../models/Notification";
import mongoose from "mongoose";

// Create a new food donation
export const createDonation = async (req: Request, res: Response) => {
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
      dietary_info,
      pickup_location,
    } = req.body;

    // Validate required fields
    if (!title || !description || !quantity || !expiry_time || !pickup_window_start || !pickup_window_end) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Image upload
    const url = req.file ? await uploadImage(req.file) : undefined;
    const food = await Food.create({
      donorId: new mongoose.Types.ObjectId(req.user._id || req.user.id),
      title,
      description,
      quantity,
      unit,
      expiry_time,
      pickup_window_start,
      pickup_window_end,
      temperature_requirements,
      dietary_info,
      img: url,
      status: "available",
      pickup_location,
    });

    // Notify all NGOs about the new donation
    const ngos = await User.find({ role: "ngo" });
    const notificationPromises = ngos.map((ngo) =>
      Notification.create({
        recipientId: ngo._id,
        message: `New food donation "${title}" is available for pickup.`,
        taskId: food._id,
        read: false,
      })
    );
    await Promise.all(notificationPromises);

    res.status(201).json({ message: "Donation created successfully", food });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Failed to create donation", error });
  }
};

// Dashboard stats for donor
export const getDonorStats = async (req: Request, res: Response) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    const totalDonations = await Food.countDocuments({ donorId });
    const pendingDonations = await Food.countDocuments({ donorId, status: "available" });
    const completedDonations = await Food.countDocuments({ donorId, status: "completed" });

    res.status(200).json({
      totalDonations,
      pendingDonations,
      completedDonations,
    });
  } catch (error) {
    console.error("Failed to fetch donor stats:", error);
    res.status(500).json({ message: "Failed to fetch donor stats", error });
  }
};

// View all donations created by logged-in donor
export const getMyDonations = async (req: Request, res: Response) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    const donations = await Food.find({ donorId }).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    console.error("Failed to fetch donations:", error);
    res.status(500).json({ message: "Failed to fetch donations", error });
  }
};

// Delete a donation
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const donorId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    const donation = await Food.findOne({ _id: id, donorId });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or unauthorized" });
    }

    await Food.findByIdAndDelete(id);
    res.status(200).json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ message: "Error deleting donation", error });
  }
};

// Update donation status (e.g., cancel)
export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, ngoId } = req.body;

    if (!["available", "assigned", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const donorId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    const donation = await Food.findOne({ _id: id, donorId });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or unauthorized" });
    }

    donation.status = status;
    if (status === "assigned" && ngoId) {
      donation.ngoId = new mongoose.Types.ObjectId(ngoId);
      const ngo = await User.findById(ngoId);
      await Notification.create({
        recipientId: donation.donorId,
        message: `Your donation "${donation.title}" has been claimed by ${ngo ? ngo.name : "an NGO"}.`,
        taskId: donation._id,
        read: false,
      });
    }

    await donation.save();

    if (status === "completed") {
      const volunteer = donation.volunteerId ? await User.findById(donation.volunteerId):
      await Notification.create({
        recipientId: donation.donorId,
        message: `Your donation "${donation.title}" has been completed by a volunteer.`,
        taskId: donation._id,
        read: false,
      });
    }

    res.status(200).json({ message: "Donation status updated successfully", donation });
  } catch (error) {
    console.error("Failed to update donation status:", error);
    res.status(500).json({ message: "Failed to update donation status", error });
  }
};

// Get notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    
    const recipientId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    const notifications = await Notification.find({ recipientId })
      .populate("taskId", "title")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
      const { notificationId } = req.params;
      const recipientId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId },
        { read: true },
        { new: true }
      );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read", error });
  }
};