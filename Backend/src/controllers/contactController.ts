import { Request, Response } from 'express';
import { sendContactEmail } from '../emails/sendContactEmail';

export const submitContactForm = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  try {
    // Server-side validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({ message: 'Contact form submitted successfully.' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Failed to send contact form.' });
  }
};