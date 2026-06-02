import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { updateDonationStatusSchema } from '../validators/schemas';
import * as donorController from '../controllers/donorController';

// Limit uploads to 5MB images; uploadImage also enforces the size server-side.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

const ALL_ROLES = ['donor', 'volunteer', 'ngo', 'admin'];

// Create a new donation (multipart; body validated in the controller).
router.post('/donate', authMiddleware(['donor']), upload.single('img'), donorController.createDonation);

router.get('/stats', authMiddleware(ALL_ROLES), donorController.getDonorStats);
router.get('/my-donations', authMiddleware(ALL_ROLES), donorController.getMyDonations);

router.delete('/donate/:id', authMiddleware(['donor']), donorController.deleteDonation);

router.put(
  '/donation/:id/status',
  authMiddleware(['donor']),
  validateBody(updateDonationStatusSchema),
  donorController.updateDonationStatus
);

// Notifications (kept at existing paths for frontend compatibility).
router.get('/Notifications', authMiddleware(ALL_ROLES), donorController.getNotifications);
router.put(
  '/notifications/:notificationId/read',
  authMiddleware(ALL_ROLES),
  donorController.markNotificationAsRead
);

export default router;
