import express from 'express';
import { submitContactForm } from '../controllers/contactController';
import { validateBody } from '../middlewares/validate';
import { contactLimiter } from '../middlewares/security';
import { contactSchema } from '../validators/schemas';

const router = express.Router();

router.post('/', contactLimiter, validateBody(contactSchema), submitContactForm);

export default router;
