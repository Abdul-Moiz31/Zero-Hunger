import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getProfile, updateMyProfile } from '../controllers/profileController';

const router = Router();

// Public profile
router.get('/:id', getProfile);

// Update own profile (any authenticated role)
router.patch('/me', authMiddleware(), updateMyProfile);

export default router;
