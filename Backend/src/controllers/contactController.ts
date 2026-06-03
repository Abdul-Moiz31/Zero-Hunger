import { Request, Response } from 'express';
import { sendContactEmail } from '../emails/sendContactEmail';
import { asyncHandler } from '../utils/asyncHandler';

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  await sendContactEmail({ name, email, subject, message });

  res.status(200).json({ message: 'Thanks for reaching out — we will get back to you soon.' });
});
