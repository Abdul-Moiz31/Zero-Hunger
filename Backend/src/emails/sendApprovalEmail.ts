import transporter from '../config/nodemailer';
import { createEmailTemplate, createApprovalEmailContent } from './emailTemplate';

type ApprovalEmailProps = {
  to: string;
  name: string;
  role: string;
};

export const sendApprovalEmail = async ({ to, name, role }: ApprovalEmailProps) => {
  let roleMessage = '';
  let roleDescription = '';
  let nextSteps = '';

  switch (role.toLowerCase()) {
    case 'donor':
      roleMessage = 'You can now start donating food and making a difference in your community.';
      roleDescription = 'Food Donor';
      nextSteps = 'Start by listing available food items that you\'d like to donate.';
      break;
    case 'volunteer':
      roleMessage = 'You can now help coordinate food distribution and make a real impact.';
      roleDescription = 'Volunteer';
      nextSteps = 'Browse available food donations and volunteer to help with distribution.';
      break;
    case 'ngo':
      roleMessage = 'You can now receive food donations and coordinate with volunteers to serve your community.';
      roleDescription = 'NGO Partner';
      nextSteps = 'Start by claiming available food donations and coordinating with volunteers.';
      break;
    default:
      roleMessage = 'You can now start using the platform to make a difference.';
      roleDescription = 'Member';
      nextSteps = 'Explore the platform and start contributing to our mission.';
  }

  const content = createApprovalEmailContent(name, role, roleMessage, roleDescription, nextSteps);
  
  const emailData = createEmailTemplate({
    subject: '🎉 Your Zero Hunger Account Has Been Approved!',
    title: `Congratulations, ${name}! 🎊`,
    subtitle: 'Your account has been approved and you can now access the platform.',
    headerIcon: '🎉',
    content,
    actionButton: {
      text: '🍽️ Login to Zero Hunger',
      url: process.env.FRONTEND_URL || 'http://localhost:3000',
      color: '#16a34a'
    },
    footerText: 'Welcome to the Zero Hunger community! Together, we can make a difference.'
  });

  try {
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailData.subject,
      html: emailData.html,
    });
    console.log(`Approval email sent to ${to}`);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
}; 