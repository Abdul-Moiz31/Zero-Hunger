import { Router } from 'express';
import { getImpactStats } from '../controllers/impactController';

const router = Router();

// Public — no auth
router.get('/', getImpactStats);

export default router;
