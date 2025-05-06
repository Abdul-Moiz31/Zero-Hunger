import { Request, Response } from "express";
import food from "../models/Food"; // Assuming food model is actually task model

// Volunteer Dashboard Stats
export const getVolunteerStats = async (req: Request, res: Response) => {
  try {
    const volunteerId = req.user._id; // Assuming user is authenticated

    const available_Task = await food.countDocuments({ status: "available" }); // No volunteerId here!
    const in_progress_task = await food.countDocuments({ volunteerId: volunteerId, status: "in_progress" });
    const completed_task = await food.countDocuments({ volunteerId: volunteerId, status: "completed" });

    res.status(200).json({
      available_Task,
      in_progress_task,
      completed_task,
    });
  } catch (error) {
    console.error("Error fetching volunteer stats:", error);
    res.status(500).json({ message: "Failed to fetch volunteer stats", error });
  }
};
