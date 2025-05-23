import express from 'express';
import { forgotPassword, resetPassword , getOrgsNames , updateProfile  ,getOwnUser, login, register  } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/org-names', getOrgsNames);
router.put('/update-profile', authMiddleware(), updateProfile);

// me route
router.get('/me',authMiddleware(),getOwnUser)
export default router;
