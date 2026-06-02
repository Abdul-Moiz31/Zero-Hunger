import { Router, Request, Response } from 'express';
import {
  deleteUser,
  getDashboardStats,
  updateUserStatus,
  getFoodDonations,
  deleteFoodDonation,
} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const adminOnly = authMiddleware(['admin']);

router.get('/dashboard-stats', adminOnly, getDashboardStats);
router.get('/food-donations', adminOnly, getFoodDonations);
router.put('/user-status/update', adminOnly, updateUserStatus);
router.delete('/users/:userId', adminOnly, deleteUser);
router.delete('/food-donations/:donationId', adminOnly, deleteFoodDonation);

// Settings persistence is not implemented yet; acknowledge the request so the
// admin UI does not error. Replace with real persistence when settings exist.
router.put('/settings', adminOnly, (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Settings saved successfully' });
});

export default router;
