import { Router } from 'express';
import { getMyVolunteers } from '../controllers/ngoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/volunteers', authMiddleware(['ngo']), getMyVolunteers);

export default router;