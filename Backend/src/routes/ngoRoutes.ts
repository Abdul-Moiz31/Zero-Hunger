import { Router } from 'express';
import { getMyVolunteers, claimFood, getNgoStats, getClaimedFoods, assignVolunteerToFood, deleteVolunteer, updateVolunteer, addVolunteer, updateFoodStatus, deleteClaimedFood } from '../controllers/ngoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import Notification from '../models/Notification';

const router = Router();

router.get('/volunteers', authMiddleware(['ngo']), getMyVolunteers);
router.post("/claim/food", authMiddleware(['ngo']), claimFood);
router.get("/claimed/foods", authMiddleware(['ngo']), getClaimedFoods);
router.get("/stats", authMiddleware(['ngo']), getNgoStats);
router.post('/assign-volunteer', authMiddleware(['ngo']), assignVolunteerToFood);
router.delete('/volunteers/:id', authMiddleware(['ngo']), deleteVolunteer);
router.put('/volunteers/:id', authMiddleware(['ngo']), updateVolunteer);
router.post('/volunteers', authMiddleware(['ngo']), addVolunteer);
router.patch("/food/:id/status", authMiddleware(["ngo"]), updateFoodStatus);
router.delete("/claimed-food/:id", authMiddleware(["ngo"]), deleteClaimedFood);
router.get('/notifications', authMiddleware(['ngo']), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
});
router.patch('/notifications/:notificationId/read', authMiddleware(['ngo']), async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipientId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification as read", error });
  }
});

export default router;