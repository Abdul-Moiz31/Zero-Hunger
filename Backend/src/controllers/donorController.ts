import { useCallback, useMemo } from 'react';
import type { Request, Response } from "express"
import Food from "../models/Food"
import uploadImage from "../utils/uploadImage"

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
      pickup_location
    } = req.body

    // Validate required fields
    if (!title || !description || !quantity || !expiry_time || !pickup_window_start || !pickup_window_end) {
      return res.status(400).json({ message: "All fields are required" })
    }

    // Image upload
    const url = req.file ? await uploadImage(req.file) : undefined
console.log("HERE is the user "+ JSON.stringify(req.user))
    const food = await Food.create({
      donorId: req.user.id,
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
      pickup_location
    })

    res.status(201).json({ message: "Donation created successfully", food })
  } catch (error) {
    console.error("Error creating donation:", error)
    res.status(500).json({ message: "Failed to create donation", error })
  }
}

// Dashboard stats for donor
export const getDonorStats = async (req: Request, res: Response) => {
  try {
    const donorId = req.user.id

    const totalDonations = await Food.countDocuments({ donorId })
    const pendingDonations = await Food.countDocuments({ donorId, status: "available" })
    const completedDonations = await Food.countDocuments({ donorId, status: "completed" })

    res.status(200).json({
      totalDonations,
      pendingDonations,
      completedDonations,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donor stats", error })
  }
}

// View all donations created by logged-in donor
export const getMyDonations = async (req: Request, res: Response) => {
  try {
    const donorId = req.user.id
    const donations = await Food.find({ donorId }).sort({ createdAt: -1 })
    res.status(200).json(donations)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donations", error })
  }
}

// Delete a donation
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const donation = await Food.findOne({ _id: id, donorId: req.user._id })

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or unauthorized" })
    }

    await Food.findByIdAndDelete(id)
    res.status(200).json({ message: "Donation deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting donation", error })
  }
}

// Update donation status (e.g. cancel)
export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["available", "assigned", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const donation = await Food.findOne({ _id: id, donorId: req.user._id })

    if (!donation) {
      return res.status(404).json({ message: "Donation not found or unauthorized" })
    }

    donation.status = status
    await donation.save()

    res.status(200).json({ message: "Status updated successfully", donation })
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error })
  }
}