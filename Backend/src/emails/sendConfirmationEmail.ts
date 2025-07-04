import transporter from '../config/nodemailer';
import { createEmailTemplate, createRegistrationConfirmationContent } from './emailTemplate';
// import { UtensilsCrossed } from 'lucide-react';
type EmailProps = {
  to: string;
  name: string;
  role: string;
};

export const sendConfirmationEmail = async ({ to, name, role }: EmailProps) => {
  let roleMessage = '';
  let roleDescription = '';

  switch (role.toLowerCase()) {
    case 'donor':
      roleMessage = 'Thank you for choosing to make a difference. Your contribution can help feed someone in need.';
      roleDescription = 'Food Donor';
      break;
    case 'volunteer':
      roleMessage = 'We appreciate your willingness to serve. Your time and effort are valuable in making this mission successful.';
      roleDescription = 'Volunteer';
      break;
    case 'ngo':
      roleMessage = 'Thank you for partnering with us. Together, we can make food reach those who need it most.';
      roleDescription = 'NGO Partner';
      break;
    default:
      roleMessage = 'Welcome to the Zero Hunger Platform!';
      roleDescription = 'Member';
  }

  const content = createRegistrationConfirmationContent(name, role, roleMessage, roleDescription);
  
  const emailData = createEmailTemplate({
    subject: 'Welcome to Zero Hunger - Account Created Successfully!',
    title: `Welcome, ${name}! 👋`,
    subtitle: 'Your account has been created and is pending approval.',
    headerIcon: '🍽️',
    content,
    footerText: 'Thank you for joining our mission to eliminate hunger!'
  });

  try {
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailData.subject,
      html: emailData.html,
    });
    console.log(`Confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};
