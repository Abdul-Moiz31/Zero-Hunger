import express from 'express';
import { submitContactForm } from '../controllers/contactController';
import { validateBody } from '../middlewares/validate';
import { contactSchema } from '../validators/schemas';

const router = express.Router();

router.post('/', validateBody(contactSchema), submitContactForm);

export default router;
