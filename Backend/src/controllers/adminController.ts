import { Request, Response } from "express";
import User from "../models/User"
import Food from "../models/Food";

// @ts-ignore
export const getDashboardStats = async (req, res) => {
    try {
        // all users
        const users=await User.find({role: {$ne: "admin"}});
        const ngoCount=await User.countDocuments({role:"ngo"});
        const donorCount=await User.countDocuments({role:"donor"});
        const volunteerCount=await User.countDocuments({role:"volunteer"});
        const donationCount = await Food.countDocuments()

        return res.status(200).json({ngoCount,donorCount,volunteerCount,users , donationCount})
    }catch(error){
        res.status(500).json(error)
    }
}


export const updateUserStatus=async (req: Request, res: Response)=>{
    try{
       const {userId,status}=req.body;

       if(!userId){
        return res.status(400).json({message:"User Id required"})

       }

       if(status==undefined){
         return res.status(400).json({message:"Bad Request"})

       }


       const userExist=await User.findById(userId);

       if(!userExist){
        throw new Error("User does not exist.");
       }


       await User.findByIdAndUpdate(userId,{
        isApproved:status
       })
       
    res.status(200).json({message:"Status Updated Sucessfully"});       
    }catch(error){
        res.status(500).json(error)
    }
}


export const deleteUser=async (req: Request, res: Response)=>{
    try{
        const {userId}=req.params;
 
        if(!userId){
         return res.status(400).json({message:"User Id required"})
 
        }
 
        const userExist=await User.findById(userId);
 
        if(!userExist){
         throw new Error("User does not exist.");
        }
 
 
        await User.findByIdAndDelete(userId)
        
     res.status(200).json({message:"User Deleted Sucessfully"});       
     }catch(error){
         res.status(500).json(error)
     }
}
// Get all food donations
export const getFoodDonations = async (req: Request, res: Response) => {
    try {
        const donations = await Food.find()
            .populate("donorId", "name")
            .populate("ngoId", "name")
            .populate("volunteerId", "name")
            .lean();

        const formattedDonations = donations.map(donation => ({
            id: donation._id.toString(),
            donorName: donation.donorId?.name || "Unknown",
            ngoName: donation.ngoId?.name || "Not Claimed",
            volunteerName: donation.volunteerId?.name || "Not Assigned",
            title: donation.title,
            quantity: donation.quantity,
            unit: donation.unit,
            pickup_location: donation.pickup_location,
            createdAt: donation.createdAt
        }));

        res.status(200).json(formattedDonations);
    } catch (error) {
        res.status(500).json(error);
    }
}

// Delete food donation
export const deleteFoodDonation = async (req: Request, res: Response) => {
    try {
        const { donationId } = req.params;

        if (!donationId) {
            return res.status(400).json({ message: "Donation Id required" });
        }

        const donationExist = await Food.findById(donationId);

        if (!donationExist) {
            throw new Error("Donation does not exist.");
        }

        await Food.findByIdAndDelete(donationId);
        
        res.status(200).json({ message: "Donation Deleted Successfully" });
    } catch (error) {
        res.status(500).json(error);
    }
}

