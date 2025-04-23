import transporter from '../config/nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendResetPasswordEmail = async (to: string, resetLink: string): Promise<void> => {
  await transporter.sendMail({
    from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center;">
          <img src="" alt="Zero Hunger Logo" width="120" style="margin-bottom: 20px;" />
        </div>
        <h2 style="color: #F44336;">Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetLink}" style="color: #2196F3;">${resetLink}</a>
        </p>
        <p><strong>Note:</strong> This link expires in 1 hour.</p>
        <hr style="margin: 30px 0;" />
        <p style="font-size: 12px; color: #777;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `
  });
};

export default sendResetPasswordEmail;
