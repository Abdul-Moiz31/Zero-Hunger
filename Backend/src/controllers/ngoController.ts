import { Request, Response } from "express";
import User from "../models/User";
import Food from "../models/Food";
import mongoose, { mongo } from "mongoose";

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

    // loop to find the count of Food where voluntterid is userid and status is completed

// foodController.js
export const claimFood = async (req, res) => {
  const { foodId } = req.body;
  const userId = req.user.id; // Assuming user is available from authentication middleware
  
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
    console.log("Here is ngo id"+ngoId)

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


// Assign a volunteer to a food item
export const assignVolunteerToFood = async (req: Request, res: Response) => {
  const { volunteerId, foodId } = req.body;
  const ngoId = req.user.id;

  if (!volunteerId || !foodId) {
    return res.status(400).json({ success: false, message: 'Volunteer ID and Food ID are required' });
  }

  try {
 

    // Find the food item and update it
    const updatedFood = await Food.findByIdAndUpdate(
      foodId,
      { 
        volunteerId,
        status: 'assigned', // Update status to 'assigned'
        delivered_time: new Date() // Record when the food was assigned
      },
      { new: true, runValidators: true } // Return the updated document and validate against schema
    );

    if (!updatedFood) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Return the updated food item
    return res.status(200).json({ 
      success: true, 
      message: 'Volunteer assigned successfully', 
      data: updatedFood 
    });

  } catch (error) {
    console.error('Error assigning volunteer to food:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while assigning volunteer', 
      error: error.message 
    });
  } 
}

