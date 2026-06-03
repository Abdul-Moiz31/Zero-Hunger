import { Router } from 'express';
import multer from 'multer';
import {
  getVolunteerStats,
  getVolunteerTasks,
  updateTaskStatus,
  getVolunteerNotifications,
  markVolunteerNotificationRead,
} from '../controllers/volunteerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { updateFoodStatusSchema } from '../validators/schemas';

const router = Router();
const volunteerOnly = authMiddleware(['volunteer']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/stats', volunteerOnly, getVolunteerStats);
router.get('/tasks', volunteerOnly, getVolunteerTasks);
router.patch('/tasks/:taskId/status', volunteerOnly, upload.single('proof_img'), validateBody(updateFoodStatusSchema), updateTaskStatus);
router.get('/notifications', volunteerOnly, getVolunteerNotifications);
router.patch('/notifications/:notificationId/read', volunteerOnly, markVolunteerNotificationRead);

export default router;
