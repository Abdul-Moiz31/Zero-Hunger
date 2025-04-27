import { Request, Response } from "express";
import User from "../models/User";
import Food from "../models/Food";

// Dashboard stats for NGO
export const getNgoStats = async (req: Request, res: Response) => {
  try {
    const ngoId = req.user._id;

    const totalVolunteers = await User.countDocuments({
      ngoId,
      role: "volunteer",
      isApproved: true,
    });

    const totalCompletedDonations = await Food.countDocuments({
      ngoId,
      status: "completed",
    });

    const totalPendingDonations = await Food.countDocuments({
      ngoId,
      status: "available",
    });

    res.status(200).json({
      totalVolunteers,
      totalCompletedDonations,
      totalPendingDonations,
    });
  } catch (error) {
    console.error("Error fetching NGO stats:", error);
    res.status(500).json({ message: "Failed to fetch NGO stats", error });
  }
};

// View all volunteers linked to logged-in NGO
export const getMyVolunteers = async (req: Request, res: Response) => {
  try {
    const ngoId = req.user._id;

    const volunteers = await User.find({
      ngoId,
      role: "volunteer",
      isApproved: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(volunteers);
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ message: "Failed to fetch volunteers", error });
  }
};
