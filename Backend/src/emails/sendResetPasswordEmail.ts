import transporter from '../config/nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendResetPasswordEmail = async (to: string, resetLink: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #F44336;">Password Reset</h2>
          <p>Click the button below to reset your password:</p>
          <p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #2196F3; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </p>
          <p><strong>Note:</strong> This link expires in 1 hour.</p>
          <hr style="margin: 30px 0;" />
          <p style="font-size: 12px; color: #777;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw new Error('Failed to send reset email');
  }
};

export const sendPasswordResetConfirmation = async (to: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">Password Reset Successful</h2>
          <p>Your password has been successfully reset.</p>
          <p>If you did not perform this action, please contact our support team immediately.</p>
          <p>Thank you,<br/>Zero Hunger Platform Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending reset confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};