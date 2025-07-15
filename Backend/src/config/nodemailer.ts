import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); 

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS must be defined in .env');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) console.error('Nodemailer configuration error:', error);
  else console.log('Nodemailer ready:', success);
});

// Used for sending approval emails to users when admin approves them
export default transporter;