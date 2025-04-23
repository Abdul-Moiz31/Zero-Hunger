import { Router } from 'express';
import { approveVolunteer, getPendingVolunteers, getVolunteersByNgo} from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.patch('/approve/volunteer/:id', authMiddleware(['admin']), approveVolunteer);
router.get('/volunteers/pending', authMiddleware(['admin']), getPendingVolunteers);
router.get('/ngo/:id/volunteers', authMiddleware(['ngo']), getVolunteersByNgo);


export default router;
