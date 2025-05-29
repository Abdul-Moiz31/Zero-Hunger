import transporter from '../config/nodemailer';
import dotenv from 'dotenv';
import { format } from 'date-fns';

interface VolunteerEmailData {
  to: string;
  name: string;
  password: string;
  organization_name?: string | undefined;
  registered_time: string;
}

export const sendVolunteerConfirmationEmail = async ({
  to,
  name,
  password,
  organization_name,
  registered_time,
}: VolunteerEmailData) => {
  const formattedDate = format(new Date(registered_time), 'MMMM dd, yyyy h:mm a');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to Our Platform - Volunteer Registration Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2f855a;">Welcome, ${name}!</h2>
        <p>Your volunteer account has been successfully created with <strong>${organization_name}</strong>. You can now access our platform to start contributing to our mission.</p>
        <h3 style="color: #2f855a;">Your Account Details</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li><strong>Organization:</strong> ${organization_name}</li>
          <li><strong>Registered On:</strong> ${formattedDate}</li>
        </ul>
        <p style="margin-top: 20px;">Please use the above credentials to log in to the platform. For security, we recommend changing your password after your first login.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #2f855a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Log In Now</a>
        <p style="margin-top: 20px;">If you have any questions or need assistance, feel free to contact us.</p>
        <p>Thank you for joining us!</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated email, please do not reply directly.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Volunteer confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending volunteer confirmation email:', error);
    throw new Error('Failed to send volunteer confirmation email');
  }
};