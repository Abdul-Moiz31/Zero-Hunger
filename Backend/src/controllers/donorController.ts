import { Request, Response } from "express";
import Food from "../models/Food";

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
    } = req.body;

    const food = await Food.create({
      userId: req.user._id,
      title,
      description,
      quantity,
      unit,
      expiry_time,
      pickup_window_start,
      pickup_window_end,
      temperature_requirements,
      dietary_info,
    });

    res.status(201).json({ message: "Donation created successfully", food });
  } catch (error) {
    res.status(500).json({ message: "Failed to create donation", error });
  }
};

// Dashboard stats for donor
export const getDonorStats = async (req: Request, res: Response) => {
    try {
      const donorId = req.user._id;
  
      const totalDonations = await Food.countDocuments({ userId: donorId });
      const pendingDonations = await Food.countDocuments({ userId: donorId, status: "available" });
      const completedDonations = await Food.countDocuments({ userId: donorId, status: "completed" });
  
      res.status(200).json({
        totalDonations,
        pendingDonations,
        completedDonations,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donor stats", error });
    }
  };

// View all donations created by logged-in donor
export const getMyDonations = async (req: Request, res: Response) => {
  try {
    const donations = await Food.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donations", error });
  }
};
