import { Router } from 'express';
import { getVolunteers } from '../controllers/ngoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/volunteers', authMiddleware(['ngo']), getVolunteers);

export default router;
