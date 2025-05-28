import transporter from '../config/nodemailer';
// import { UtensilsCrossed } from 'lucide-react';
type EmailProps = {
  to: string;
  name: string;
  role: string;
};

export const sendConfirmationEmail = async ({ to, name, role }: EmailProps) => {
  let roleMessage = '';

  switch (role.toLowerCase()) {
    case 'donor':
      roleMessage = 'Thank you for choosing to make a difference. Your contribution can help feed someone in need.';
      break;
    case 'volunteer':
      roleMessage = 'We appreciate your willingness to serve. Your time and effort are valuable in making this mission successful.';
      break;
    case 'ngo':
      roleMessage = 'Thank you for partnering with us. Together, we can make food reach those who need it most.';
      break;
    default:
      roleMessage = 'Welcome to the Zero Hunger Platform!';
  }

  const mailOptions = {
    from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to Zero Hunger!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center;">
          <UtensilsCrossed className="w-8 h-8 text-green-600" />
        </div>
        <h2 style="color: #4CAF50;">Hello ${name},</h2>
        <p>Welcome to <strong>Zero Hunger</strong>! Your account has been successfully created as a <strong>${role}</strong>.</p>
        <p>${roleMessage}</p>
        <p style="margin-top: 20px;">We're excited to have you onboard. Feel free to log in and explore the platform.</p>
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #777;">This is an automated message. If you didn’t sign up for this, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};
