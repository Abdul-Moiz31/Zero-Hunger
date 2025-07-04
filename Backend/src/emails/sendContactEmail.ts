import transporter from '../config/nodemailer';
import { createEmailTemplate, createContactFormContent } from './emailTemplate';
import dotenv from 'dotenv';

dotenv.config();

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContactEmail = async ({ name, email, subject, message }: ContactFormData): Promise<void> => {
  try {
    const content = createContactFormContent(name, email, subject, message);
    
    const emailData = createEmailTemplate({
      subject: `New Contact Form Submission: ${subject}`,
      title: 'New Contact Form Submission',
      subtitle: 'A new message has been submitted through the contact form.',
      headerIcon: '📧',
      content,
      footerText: 'This email was sent from the Zero Hunger Platform contact form.'
    });

    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to: 'abdulmoiz3140@gmail.com',
      subject: emailData.subject,
      replyTo: email,
      html: emailData.html,
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw new Error('Failed to send contact email');
  }
};