import { Router } from 'express';
import { getMyVolunteers, claimFood ,getNgoStats , getClaimedFoods } from '../controllers/ngoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/volunteers', authMiddleware(['ngo']), getMyVolunteers);

// This route will cliam the Food and add property of ngoId
router.post("/claim/food",authMiddleware(['ngo']),claimFood)
router.get("/claimed/foods",authMiddleware(['ngo']),getClaimedFoods)
router.get("/stats", authMiddleware(['ngo']), getNgoStats)



export default router;