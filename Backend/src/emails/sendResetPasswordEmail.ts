import transporter from '../config/nodemailer';
import { createEmailTemplate, createPasswordResetContent, createPasswordResetConfirmationContent } from './emailTemplate';
import dotenv from 'dotenv';

dotenv.config();

export const sendResetPasswordEmail = async (to: string, resetLink: string): Promise<void> => {
  try {
    const content = createPasswordResetContent();
    
    const emailData = createEmailTemplate({
      subject: 'Reset Your Password',
      title: 'Password Reset Request',
      subtitle: 'We received a request to reset your password.',
      headerIcon: '🔐',
      content,
      actionButton: {
        text: 'Reset Password',
        url: resetLink,
        color: '#3b82f6'
      },
      footerText: 'If you did not request a password reset, please ignore this email.'
    });
      
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailData.subject,
      html: emailData.html,
    });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw new Error('Failed to send reset email');
  }
};

export const sendPasswordResetConfirmation = async (to: string): Promise<void> => {
  try {
    const content = createPasswordResetConfirmationContent();
    
    const emailData = createEmailTemplate({
      subject: 'Password Reset Successful',
      title: 'Password Reset Successful',
      subtitle: 'Your password has been successfully reset.',
      headerIcon: '✅',
      content,
      footerText: 'If you did not perform this action, please contact our support team immediately.'
    });

    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailData.subject,
      html: emailData.html,
    });
  } catch (error) {
    console.error('Error sending reset confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};