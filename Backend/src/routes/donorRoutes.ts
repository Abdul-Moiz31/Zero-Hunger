import express , { Request, Response } from "express";
import { getNotifications } from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as donorController from "../controllers/donorController";
import multer from "multer";
import Notification from "../models/Notification"; // Add this import

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Create a new donation
router.post(
  "/donate",
  authMiddleware(["donor"]),
  upload.single("img"),
  donorController.createDonation
);

// Get donor statistics
router.get("/stats", authMiddleware(["donor" , "volunteer" , "ngo" , "admin"]), donorController.getDonorStats);

// Get all donations for the donor
router.get("/my-donations", authMiddleware(["donor" , "volunteer" , "ngo" , "admin"]), donorController.getMyDonations);

// Delete a donation
router.delete("/donate/:id", authMiddleware(["donor"]), donorController.deleteDonation);

// Update donation status (only for donor)
router.put(
  "/donation/:id/status",
  authMiddleware(["donor"]),
  donorController.updateDonationStatus
);

// Get notifications for donor or NGO
router.get("/Notifications", authMiddleware(["donor", "ngo", "volunteer" , "admin"]), donorController.getNotifications);

// Mark a notification as read for donor or NGO
router.put("/notifications/:notificationId/read", authMiddleware(["donor", "ngo"]), donorController.markNotificationAsRead);

export default router;