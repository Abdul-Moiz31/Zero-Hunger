import express from 'express';
import { sendNotification, getNotifications } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { sendNotificationSchema } from '../validators/schemas';

const router = express.Router();

// Creating arbitrary notifications is admin-only; app flows generate
// notifications server-side within their own controllers.
router.post('/', authMiddleware(['admin']), validateBody(sendNotificationSchema), sendNotification);
router.get('/', authMiddleware(), getNotifications);

export default router;
