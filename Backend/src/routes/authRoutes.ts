import express from 'express';
import { getOwnUser, login, register  } from '../controllers/authController';
import { forgotPassword, resetPassword , getOrgsNames } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/org-names', getOrgsNames);

// me route
router.get('/me',authMiddleware(),getOwnUser)
export default router;
