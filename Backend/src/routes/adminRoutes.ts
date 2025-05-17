import { Router } from "express";
import { deleteUser, getDashboardStats, updateUserStatus, getFoodDonations , deleteFoodDonation} from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Route to get the stats 
router.get('/dashboard-stats', authMiddleware(['admin']), getDashboardStats);

// Route to get all food donations
router.get('/food-donations', authMiddleware(['admin']), getFoodDonations);

// Route to update the status of isApproved of a user 
router.put('/user-status/update', authMiddleware(['admin']), updateUserStatus);

// Route to delete a user
router.delete('/users/:userId', authMiddleware(['admin']), deleteUser);

// Route to delete a food donation
router.delete('/food-donations/:donationId', authMiddleware(['admin']), deleteFoodDonation);

export default router;