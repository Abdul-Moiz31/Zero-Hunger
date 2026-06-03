import express from 'express';
import { sendNotification, getNotifications } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();
// Creating arbitrary notifications is an admin-only operation; the app's
// flows generate notifications server-side within their own controllers.
router.post('/', authMiddleware(['admin']), sendNotification);
router.get('/', authMiddleware(), getNotifications);
export default router;
