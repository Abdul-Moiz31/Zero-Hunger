import express from 'express';
import { sendNotification, getNotifications } from '../controllers/notificationController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();
router.post('/', sendNotification);
router.get('/', authMiddleware(), getNotifications);
export default router;
