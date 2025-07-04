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

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS
      });
      return res.status(500).json({ 
        message: 'Email service is not configured. Please contact the administrator.' 
      });
    }

    console.log('Sending contact email to:', process.env.EMAIL_USER);
    await sendContactEmail({ name, email, subject, message });

    res.status(200).json({ message: 'Contact form submitted successfully.' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('EMAIL_USER') || error.message.includes('EMAIL_PASS')) {
        return res.status(500).json({ 
          message: 'Email service is not configured. Please contact the administrator.' 
        });
      }
      if (error.message.includes('authentication') || error.message.includes('535')) {
        return res.status(500).json({ 
          message: 'Email authentication failed. Please contact the administrator.' 
        });
      }
    }
    
    res.status(500).json({ message: 'Failed to send contact form. Please try again later.' });
  }
};