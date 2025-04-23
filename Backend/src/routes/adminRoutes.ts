import { Router } from "express";
import { deleteUser, getDashboardStats, updateUserStatus } from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router=Router();



// Route to get the stats 

router.get('/dashboard-stats',getDashboardStats);

// Route the update the status of isApproved of a user 
router.put('/user-status/update',updateUserStatus);

// Route to delete the user

router.delete('/users/:userId',deleteUser);

export default router;