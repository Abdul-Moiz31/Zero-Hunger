import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getThread, sendMessage, getInbox } from '../controllers/messageController';

const ALL = authMiddleware();

const router = Router();

router.get('/inbox',    ALL, getInbox);
router.get('/:foodId',  ALL, getThread);
router.post('/:foodId', ALL, sendMessage);

export default router;
