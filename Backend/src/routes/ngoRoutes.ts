import { Router } from 'express';
import {
  getMyVolunteers,
  claimFood,
  getNgoStats,
  getClaimedFoods,
  assignVolunteerToFood,
  deleteVolunteer,
  updateVolunteer,
  addVolunteer,
  updateFoodStatus,
  deleteClaimedFood,
  getNgoNotifications,
  markNgoNotificationRead,
} from '../controllers/ngoController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import {
  claimFoodSchema,
  assignVolunteerSchema,
  volunteerSchema,
  updateFoodStatusSchema,
} from '../validators/schemas';

const router = Router();
const ngoOnly = authMiddleware(['ngo']);

router.get('/volunteers', ngoOnly, getMyVolunteers);
router.post('/claim/food', ngoOnly, validateBody(claimFoodSchema), claimFood);
router.get('/claimed/foods', ngoOnly, getClaimedFoods);
router.get('/stats', ngoOnly, getNgoStats);
router.post('/assign-volunteer', ngoOnly, validateBody(assignVolunteerSchema), assignVolunteerToFood);
router.delete('/volunteers/:id', ngoOnly, deleteVolunteer);
router.put('/volunteers/:id', ngoOnly, validateBody(volunteerSchema), updateVolunteer);
router.post('/volunteers', ngoOnly, validateBody(volunteerSchema), addVolunteer);
router.patch('/food/:id/status', ngoOnly, validateBody(updateFoodStatusSchema), updateFoodStatus);
router.delete('/claimed-food/:id', ngoOnly, deleteClaimedFood);
router.get('/notifications', ngoOnly, getNgoNotifications);
router.patch('/notifications/:notificationId/read', ngoOnly, markNgoNotificationRead);

export default router;
