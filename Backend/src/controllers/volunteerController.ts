import { Request, Response } from "express";
import Food from "../models/Food";
import User from "../models/User";
import Notification from "../models/Notification";

export const getVolunteerStats = async (req: Request, res: Response) => {
  try {
    const volunteerId = req.user.id;

    const available_Task = await Food.countDocuments({ status: "available" });
    const in_progress_task = await Food.countDocuments({ volunteerId, status: "in_progress" });
    const completed_task = await Food.countDocuments({ volunteerId, status: "completed" });

    res.status(200).json({
      available_Task,
      in_progress_task,
      Completed_task: completed_task,
    });
  } catch (error) {
    console.error("Error fetching volunteer stats:", error);
    res.status(500).json({ message: "Failed to fetch volunteer stats", error });
  }
};

export const getVolunteerTasks = async (req: Request, res: Response) => {
  try {
    const volunteerId = req.user.id;
    const tasks = await Food.find({ volunteerId })
      .populate("ngoId", "organization_name") 
      .populate("donorId", "name email");
    res.status(200).json(tasks);
  } catch (error: any) {
    console.error("Error fetching volunteer tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const volunteerId = req.user.id;
    // console.log("Updating task status:", { taskId, status, volunteerId });

    const validStatuses = ["available", "in_progress", "assigned", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Food.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.volunteerId?.toString() !== volunteerId) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const previousStatus = task.status;
    task.status = status;
    await task.save();

    // Create notification for NGO based on status change
    const ngoId = task.ngoId;
    // const donorId = task.ngoId;
    if (status === "in_progress" && previousStatus !== "in_progress") {
      await Notification.create({
        recipientId: ngoId,
        message: `Task "${task.title}" is now in progress by ${req.user.name}.`,
        taskId,
      });
    } else if (status === "completed" && previousStatus !== "completed") {
      await Notification.create({
        recipientId: ngoId,
        message: `Task "${task.title}" has been completed by volunteer ${req.user.name}.`,
        taskId,
      });
      // if (status === "completed" ) {
      // await Notification.create({
      //   recipientId: donorId,
      //   message: `Task "${task.title}" is now completed by ${req.user.name}.`,
      //   taskId,
      // });
      if (task.donorId) {
        await Notification.create({
          recipientId: task.donorId,
          message: `Your donation "${task.title}" has been completed.`,
          taskId,
        });
      }
      const volunteer = await User.findById(volunteerId);
      if (volunteer) {
        volunteer.rating = (volunteer.rating || 0) + 0.5;
        await volunteer.save();
      }
    }

    res.status(200).json({ message: "Task status updated", task });
  } catch (error: any) {
    console.error("Error updating task status:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update task status", error });
  }
};