import express from 'express';
import { login, register  } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/authController';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
export default router;
