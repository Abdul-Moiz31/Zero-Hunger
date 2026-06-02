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
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/schemas';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateBody(resetPasswordSchema), resetPassword);
router.get('/org-names', getOrgsNames);
router.put('/update-profile', authMiddleware(), validateBody(updateProfileSchema), updateProfile);
router.get('/me', authMiddleware(), getOwnUser);

export default router;
