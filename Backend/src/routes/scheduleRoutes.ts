import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getMySchedules, createSchedule, updateSchedule,
  deleteSchedule, runScheduleNow,
} from '../controllers/scheduleController';

const router = Router();

router.get('/',         authMiddleware(['donor']), getMySchedules);
router.post('/',        authMiddleware(['donor']), createSchedule);
router.patch('/:id',    authMiddleware(['donor']), updateSchedule);
router.delete('/:id',   authMiddleware(['donor']), deleteSchedule);
router.post('/:id/run', authMiddleware(['donor']), runScheduleNow);

export default router;
