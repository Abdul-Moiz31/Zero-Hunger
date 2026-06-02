import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) console.error('Nodemailer configuration error:', error);
  else console.log('Nodemailer ready:', success);
});

// Used for sending approval emails to users when admin approves them
export default transporter;