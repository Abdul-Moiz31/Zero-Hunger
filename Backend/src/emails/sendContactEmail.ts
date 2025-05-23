import transporter from '../config/nodemailer';
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
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to: 'abdulmoiz3140@gmail.com', 
      subject: `New Contact Form Submission: ${subject}`,
      replyTo: email, 
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr style="margin: 30px 0;" />
          <p style="font-size: 12px; color: #777;">This email was sent from the Zero Hunger Platform contact form.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw new Error('Failed to send contact email');
  }
};