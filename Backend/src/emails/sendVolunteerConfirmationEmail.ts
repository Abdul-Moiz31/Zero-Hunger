import transporter from '../config/nodemailer';
import { createEmailTemplate, createVolunteerConfirmationContent } from './emailTemplate';
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
  const content = createVolunteerConfirmationContent(name, to, password, organization_name || 'Unknown Organization', formattedDate);
  
  const emailData = createEmailTemplate({
    subject: 'Welcome to Zero Hunger - Volunteer Registration Confirmation',
    title: 'Welcome to Zero Hunger!',
    subtitle: 'Your volunteer account has been successfully created.',
    headerIcon: '🤝',
    content,
    actionButton: {
      text: 'Log In Now',
      url: `${process.env.FRONTEND_URL}/login`,
      color: '#16a34a'
    },
    footerText: 'Thank you for joining our mission to eliminate hunger!'
  });

  try {
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailData.subject,
      html: emailData.html,
    });
    console.log(`Volunteer confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending volunteer confirmation email:', error);
    throw new Error('Failed to send volunteer confirmation email');
  }
};