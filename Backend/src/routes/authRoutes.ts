import express from 'express';
import {
  forgotPassword,
  resetPassword,
  getOrgsNames,
  updateProfile,
  getOwnUser,
  login,
  register,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validate';
import { authLimiter } from '../middlewares/security';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/schemas';

const router = express.Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', authLimiter, validateBody(resetPasswordSchema), resetPassword);
router.get('/org-names', getOrgsNames);
router.put('/update-profile', authMiddleware(), validateBody(updateProfileSchema), updateProfile);
router.get('/me', authMiddleware(), getOwnUser);

export default router;
