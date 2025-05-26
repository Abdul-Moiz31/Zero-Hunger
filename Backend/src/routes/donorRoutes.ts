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
router.get("/stats", authMiddleware(["donor" , "volunteer" , "ngo"]), donorController.getDonorStats);

// Get all donations for the donor
router.get("/my-donations", authMiddleware(["donor" , "volunteer" , "ngo"]), donorController.getMyDonations);

// Delete a donation
router.delete("/donate/:id", authMiddleware(["donor"]), donorController.deleteDonation);

// Update donation status (only for donor)
router.put(
  "/donation/:id/status",
  authMiddleware(["donor"]),
  donorController.updateDonationStatus
);

// Get notifications for donor or NGO
router.get("/Notifications", authMiddleware(["donor", "ngo" , "volunteer"]), donorController.getNotifications);

// Mark a notification as read for donor or NGO
router.put("/notifications/:id/read", authMiddleware(["donor", "ngo"]), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found or unauthorized" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking notification as read", error });
  }
});

export default router;