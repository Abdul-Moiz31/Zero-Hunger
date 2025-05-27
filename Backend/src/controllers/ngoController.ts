import { Request, Response } from "express";
import User from "../models/User";
import Food from "../models/Food";
import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import { sendVolunteerConfirmationEmail } from "../emails/sendVolunteerConfirmationEmail";
import Notification from "../models/Notification";

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
    const ngoId = req.user.id;

    const ngo=await User.findById(ngoId);


    // Aggregate to get volunteers and their completed donation counts
    const volunteers = await User.find({role:"volunteer",organization_name:ngo?.organization_name})

    res.status(200).json(volunteers);
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ message: "Failed to fetch volunteers", error });
  }
};

// foodController.js
export const claimFood = async (req: Request, res: Response) => {
  const { foodId } = req.body;
  const userId = req.user.id || req.user._id; // Assuming user is available from authentication middleware
  
  if (!foodId) {
    return res.status(400).json({ success: false, message: 'Food ID is required' });
  }
  
  try {
    // Find the food listing and update it
    const updatedFood = await Food.findByIdAndUpdate(
      foodId,
      { 
        ngoId: userId,
        status: 'assigned', // Changed from 'pending' to 'assigned' to match your schema enum
        acceptance_time: new Date() // Record when the food was claimed
      },
      { new: true, runValidators: true } // Return the updated document and validate against schema
    );
    
    if (!updatedFood) {
      return res.status(404).json({ success: false, message: 'Food listing not found' });
    }
    
    // Notify the donor about the claim
    const donor = await User.findById(updatedFood.donorId);
    if (donor) {
      await Notification.create({
        recipientId: updatedFood.donorId,
        message: `Your donation "${updatedFood.title}" has been claimed by NGO: "${organization_name};
}".`,
        taskId: updatedFood._id,
        read: false,
      });
    }

    // Return the updated food listing
    return res.status(200).json({ 
      success: true, 
      message: 'Food claimed successfully', 
      data: updatedFood 
    });
    
  } catch (error) {
    console.error('Error claiming food:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while claiming food', 
      error: error.message 
    });
  }
};

export const getClaimedFoods = async (req: Request, res: Response) => {
  try {
    const ngoId = req.user.id;

    const claimedFoods = await Food.find({
      ngoId,
      status: "assigned",
    }).populate({
        path: "donorId volunteerId",
        model: User,
        select: "name email", 
      })
      .sort({ acceptance_time: -1 });

    res.status(200).json({
      success: true,
      data: claimedFoods,
    });
  } catch (error) {
    console.error("Error fetching claimed foods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch claimed foods",
      error: error.message,
    });
  }
};


// Delete volunteer
export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ngoId = req.user.id;
    console.log("Deleting volunteer with ID:", id, "for NGO ID:", ngoId);

    const ngo = await User.findById(ngoId);
    console.log("NGO found:", ngo);
    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    const volunteer = await User.findOne({
      _id: id,
      role: "volunteer",
      organization_name: ngo.organization_name,
    });
    console.log("Volunteer found:", volunteer);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found or not associated with this NGO",
      });
    }

    await User.findByIdAndDelete(id);
    console.log("Volunteer deleted successfully");

    res.status(200).json({
      success: true,
      message: "Volunteer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete volunteer",
      error: error.message,
    });
  }
};  
export const updateVolunteer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, contact_number } = req.body;
    const ngoId = req.user.id;

    // Validate input
    if (!name || !email || !contact_number) {
      return res.status(400).json({ success: false, message: "Name, email, and contact number are required" });
    }

    // Find the NGO
    const ngo = await User.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    // Find and update the volunteer
    const volunteer = await User.findOneAndUpdate(
      { _id: id, role: "volunteer", organization_name: ngo.organization_name },
      { name, email, contact_number },
      { new: true, runValidators: true }
    );

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found or not associated with this NGO",
      });
    }

    res.status(200).json({
      success: true,
      message: "Volunteer updated successfully",
      data: volunteer,
    });
  } catch (error) {
    console.error("Error updating volunteer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update volunteer",
      error: error.message,
    });
  }
};
// Add volunteer (Updated to send confirmation email)
export const addVolunteer = async (req: Request, res: Response) => {
  try {
    const { name, email, contact_number } = req.body;
    const ngoId = req.user.id;

    // Validate input
    if (!name || !email || !contact_number) {
      return res.status(400).json({ success: false, message: "Name, email, and contact number are required" });
    }

    // Find the NGO
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== "ngo") {
      return res.status(404).json({ success: false, message: "NGO not found" });
    }

    // Check for duplicate email
    const existingVolunteer = await User.findOne({ email });
    if (existingVolunteer) {
      return res.status(400).json({ success: false, message: "Volunteer with this email already exists" });
    }

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const registeredTime = new Date();

    // Create new volunteer
    const volunteer = new User({
      name,
      email,
      password: randomPassword, 
      contact_number,
      role: "volunteer",
      organization_name: ngo.organization_name,
      status: "Active",
      completedOrders: 0,
      joinedDate: registeredTime,
      ngoId,
      isApproved: true,
      address: "",
    });

    await volunteer.save();

    // Send confirmation email
    await sendVolunteerConfirmationEmail({
      to: email,
      name,
      password: randomPassword,
      organization_name: ngo.organization_name,
      registered_time: registeredTime.toISOString(),
    });

    // Return the saved volunteer (excluding password)
    const volunteerResponse = volunteer.toObject();
    delete volunteerResponse.password;
    res.status(201).json(volunteerResponse);
  } catch (error) {
    console.error("Error adding volunteer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add volunteer",
      error: (error as Error).message,
    });
  }
};

// Update Food Status
export const updateFoodStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["available", "in_progress", "assigned", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const ngoId = new mongoose.Types.ObjectId(req.user._id || req.user.id);
    const food = await Food.findOneAndUpdate(
      { _id: id, ngoId },
      { status },
      { new: true }
    ).populate("volunteerId", "name");
    if (!food) {
      return res.status(404).json({ message: "Food donation not found" });
    }
    if (status === "completed" && food.donorId) {
      const volunteerName = food.volunteerId ? (food.volunteerId as any).name : "no volunteer";
      await Notification.create({
        recipientId: food.donorId,
        message: `Your donation "${food.title}" has been completed by  ${volunteerName}.`,
        taskId: food._id,
        read: false,
      });
    }
    res.status(200).json({ message: "Food status updated successfully", food });
  } catch (error) {
    console.error("Error updating food status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Claimed Food
export const deleteClaimedFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ngoId = req.user.ngoId;
    const food = await Food.findOneAndDelete({ _id: id, ngoId });
    if (!food) {
      return res.status(404).json({ message: "Food donation not found" });
    }
    res.status(200).json({ message: "Claimed food deleted successfully" });
  } catch (error) {
    console.error("Error deleting claimed food:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// AssignVolunteerToFood

export const assignVolunteerToFood = async (req: Request, res: Response) => {
  try {
    const { volunteerId, foodId } = req.body;
    const food = await Food.findById(foodId).populate("ngoId", "organization_name");
    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    food.volunteerId = volunteerId;
    food.status = "assigned";
    await food.save();

    // Create a notification for the volunteer
    await Notification.create({
      recipientId: volunteerId,
      message: `A new task "${food.title}" has been assigned to you by ${food.ngoId.organization_name}.`,
      taskId: foodId,
    });

    res.status(200).json({ message: "Volunteer assigned successfully", food });
  } catch (error) {
    console.error("Error assigning volunteer:", error);
    res.status(500).json({ message: "Failed to assign volunteer", error });
  }
};