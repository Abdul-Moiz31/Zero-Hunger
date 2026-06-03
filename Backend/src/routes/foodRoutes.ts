import express from 'express';
import { getAvailableFoods } from '../controllers/foodController';

const router = express.Router();

// Public: list available, unclaimed food donations.
router.get('/available', getAvailableFoods);

export default router;
