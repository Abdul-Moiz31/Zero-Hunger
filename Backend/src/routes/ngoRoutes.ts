import { Router } from 'express';
import { getMyVolunteers, claimFood ,getNgoStats , getClaimedFoods,assignVolunteerToFood , deleteVolunteer  , updateVolunteer  , addVolunteer , updateFoodStatus , deleteClaimedFood} from '../controllers/ngoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/volunteers', authMiddleware(['ngo']), getMyVolunteers);

// This route will cliam the Food and add property of ngoId
router.post("/claim/food",authMiddleware(['ngo']),claimFood)
router.get("/claimed/foods",authMiddleware(['ngo']),getClaimedFoods)
router.get("/stats", authMiddleware(['ngo']), getNgoStats)

// Assign a volunteer to a food item
router.post('/assign/volunteer', authMiddleware(['ngo']), assignVolunteerToFood);

// Delete a volunteer 
router.delete('/volunteers/:id', authMiddleware(['ngo']), deleteVolunteer);
// Update a volunteer
router.put('/volunteers/:id', authMiddleware(['ngo']), updateVolunteer);

router.post('/volunteers', authMiddleware(['ngo']), addVolunteer);
// Updating Food Status
router.patch("/food/:id/status", authMiddleware(["ngo"]), updateFoodStatus);
// deleting claim food 
router.delete("/claimed-food/:id", authMiddleware(["ngo"]), deleteClaimedFood);



export default router;