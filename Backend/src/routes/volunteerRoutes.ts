import { Router } from 'express';
import { getVolunteerStats, getVolunteerTasks, updateTaskStatus } from '../controllers/volunteerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import Notification from '../models/Notification';

const router = Router();

router.get('/stats', authMiddleware(['volunteer']), getVolunteerStats);
router.get('/tasks', authMiddleware(['volunteer']), getVolunteerTasks);
router.patch('/tasks/:taskId/status', authMiddleware(['volunteer']), updateTaskStatus);
router.get('/notifications', authMiddleware(['volunteer']), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error });
  }
});
router.patch('/notifications/:notificationId/read', authMiddleware(['volunteer']), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipientId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read', error });
  }
});

export default router;