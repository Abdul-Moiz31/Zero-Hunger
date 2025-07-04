import { Router, Request, Response } from "express";
import { deleteUser, getDashboardStats, updateUserStatus, getFoodDonations, deleteFoodDonation } from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Route to get the stats
router.get('/dashboard-stats', authMiddleware(['admin']), getDashboardStats);

// Route to get all food donations
router.get('/food-donations', authMiddleware(['admin']), getFoodDonations);

// Route to approve a user (not toggle)
router.put('/user-status/update', authMiddleware(['admin']), updateUserStatus);

// Route to delete a user
router.delete('/users/:userId', authMiddleware(['admin']), deleteUser);

// Route to delete a food donation
router.delete('/food-donations/:donationId', authMiddleware(['admin']), deleteFoodDonation);

// Placeholder route for saving settings (to be implemented)
router.put('/settings', authMiddleware(['admin']), (req: Request, res: Response) => {
  res.status(200).json({ message: "Settings saved successfully" });
});

export default router;