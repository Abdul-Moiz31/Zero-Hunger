import express from 'express';
import { getOwnUser, login, register  } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
// me route
router.get('/me',authMiddleware(),getOwnUser)
export default router;
