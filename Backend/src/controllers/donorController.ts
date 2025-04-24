import { Request, Response } from "express";
import Food from "../models/Food";
import uploadImage from "../utils/uploadImage";

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

    

    // Validate required fields
    if (!title || !description || !quantity || !expiry_time || !pickup_window_start || !pickup_window_end) {
      console.log(req.body)
      return res.status(400).json({ message: "All fields are required" });
    }


    // image upload
    const url=await uploadImage(req.file);


    const food = await Food.create({
      donorId: req.user._id,
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
    });

    res.status(201).json({ message: "Donation created successfully", food });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Failed to create donation", error });
  }
};

// Dashboard stats for donor
export const getDonorStats = async (req: Request, res: Response) => {
    try {
      const donorId = req.user._id;
  
      const totalDonations = await Food.countDocuments({ donorId: donorId });
      const pendingDonations = await Food.countDocuments({ donorId: donorId, status: "available" });
      const completedDonations = await Food.countDocuments({ donorId: donorId, status: "completed" });

      const donations = await Food.find({ donorId: donorId }).sort({ createdAt: -1 });
  
      res.status(200).json({
        totalDonations,
        pendingDonations,
        completedDonations,
        donations
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
