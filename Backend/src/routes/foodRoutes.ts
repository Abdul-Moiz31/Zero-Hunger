import express from 'express';
import { addFood, getAvailableFoods, acceptFood, assignVolunteer, updateStatus } from '../controllers/foodController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();
router.post('/', authMiddleware(['donor']), addFood);
router.get('/available', getAvailableFoods);
router.put('/accept/:id', authMiddleware(['ngo']), acceptFood);
router.put('/assign/:id', authMiddleware(['ngo']), assignVolunteer);
router.put('/status/:id', authMiddleware(['volunteer']), updateStatus);

export default router;
