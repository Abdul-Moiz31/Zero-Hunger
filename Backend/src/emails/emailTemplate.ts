import dotenv from 'dotenv';

dotenv.config();

interface EmailTemplateProps {
  subject: string;
  title: string;
  subtitle?: string;
  headerIcon: string;
  content: string;
  actionButton?: {
    text: string;
    url: string;
    color?: string;
  };
  footerText?: string;
}

export const createEmailTemplate = ({
  subject,
  title,
  subtitle,
  headerIcon,
  content,
  actionButton,
  footerText
}: EmailTemplateProps) => {
  const buttonColor = actionButton?.color || '#16a34a';
  
  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 40px 20px; text-align: center;">
            <div style="background-color: white; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: #16a34a;">${headerIcon}</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Zero Hunger</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Fighting Hunger, One Meal at a Time</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 24px; font-weight: 600;">${title}</h2>
            ${subtitle ? `<p style="color: #6b7280; margin: 0 0 25px; font-size: 16px;">${subtitle}</p>` : ''}
            
            <div style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${content}
            </div>

            ${actionButton ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${actionButton.url}" 
                   style="background-color: ${buttonColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  ${actionButton.text}
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">
              ${footerText || 'Thank you for being part of our mission to eliminate hunger!'}
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              This is an automated message from Zero Hunger Platform.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Helper function to create contact form email content
export const createContactFormContent = (name: string, email: string, subject: string, message: string) => `
  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px; font-weight: 600;">📧 New Contact Form Submission</h3>
    <div style="color: #1e40af; font-size: 14px; line-height: 1.5;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    </div>
  </div>
`;

// Helper function to create password reset content
export const createPasswordResetContent = () => `
  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #92400e; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🔐 Password Reset Request</h4>
    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
  </div>
  
  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <h4 style="color: #1e40af; margin: 0 0 10px; font-size: 16px; font-weight: 600;">⚠️ Important</h4>
    <ul style="color: #1e40af; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
      <li>This link expires in 1 hour</li>
      <li>If you didn't request this, please ignore this email</li>
      <li>For security, change your password after resetting</li>
    </ul>
  </div>
`;

// Helper function to create password reset confirmation content
export const createPasswordResetConfirmationContent = () => `
  <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
    <h3 style="color: #065f46; margin: 0 0 15px; font-size: 20px; font-weight: 600;">✅ Password Reset Successful!</h3>
    <p style="color: #065f46; margin: 0; font-size: 16px; line-height: 1.5;">
      Your password has been successfully reset. You can now log in to your account with your new password.
    </p>
  </div>
  
  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #92400e; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🔒 Security Notice</h4>
    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
      If you did not perform this action, please contact our support team immediately to secure your account.
    </p>
  </div>
`;

// Helper function to create volunteer confirmation content
export const createVolunteerConfirmationContent = (name: string, email: string, password: string, organization_name: string, registered_time: string) => `
  <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
    <h3 style="color: #065f46; margin: 0 0 15px; font-size: 20px; font-weight: 600;">✅ Account Created Successfully!</h3>
    <p style="color: #065f46; margin: 0; font-size: 16px; line-height: 1.5;">
      Your volunteer account has been created with <strong>${organization_name}</strong>.
    </p>
  </div>

  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <h4 style="color: #1e40af; margin: 0 0 10px; font-size: 16px; font-weight: 600;">📋 Account Details</h4>
    <div style="color: #1e40af; font-size: 14px; line-height: 1.5;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><strong>Organization:</strong> ${organization_name}</p>
      <p><strong>Registered:</strong> ${registered_time}</p>
    </div>
  </div>

  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #92400e; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🔐 Security Recommendation</h4>
    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
      For security, we recommend changing your password after your first login.
    </p>
  </div>
`;

// Helper function to create registration confirmation content
export const createRegistrationConfirmationContent = (name: string, role: string, roleMessage: string, roleDescription: string) => `
  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <h3 style="color: #1e40af; margin: 0 0 10px; font-size: 18px; font-weight: 600;">Account Created Successfully</h3>
    <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
      Your account has been created as a <strong>${roleDescription}</strong> and is currently pending admin approval.
    </p>
  </div>

  <p style="color: #374151; margin: 20px 0; font-size: 16px; line-height: 1.6;">
    ${roleMessage}
  </p>

  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #92400e; margin: 0 0 10px; font-size: 16px; font-weight: 600;">⏳ What's Next?</h4>
    <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
      <li>Your account is currently under review by our admin team</li>
      <li>You'll receive an approval email once your account is approved</li>
      <li>After approval, you can log in and start using the platform</li>
    </ul>
  </div>

  <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #065f46; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🎯 Our Mission</h4>
    <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5;">
      Zero Hunger connects food donors with NGOs and volunteers to ensure no food goes to waste and no one goes hungry. 
      Together, we're building a more sustainable and compassionate world.
    </p>
  </div>
`;

// Helper function to create approval email content
export const createApprovalEmailContent = (name: string, role: string, roleMessage: string, roleDescription: string, nextSteps: string) => `
  <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
    <h3 style="color: #065f46; margin: 0 0 15px; font-size: 20px; font-weight: 600;">✅ Account Approved!</h3>
    <p style="color: #065f46; margin: 0; font-size: 16px; line-height: 1.5;">
      Your account has been approved by our admin team. You can now log in and start using the Zero Hunger platform as a <strong>${roleDescription}</strong>.
    </p>
  </div>

  <p style="color: #374151; margin: 20px 0; font-size: 16px; line-height: 1.6;">
    ${roleMessage}
  </p>

  <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
    <h4 style="color: #1e40af; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🚀 Next Steps</h4>
    <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.5;">
      ${nextSteps}
    </p>
  </div>

  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #92400e; margin: 0 0 10px; font-size: 16px; font-weight: 600;">🔐 Ready to Login</h4>
    <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
      You can now log in to your account using your email and password. 
      Visit our platform and start making a difference in your community!
    </p>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
    <h4 style="color: #475569; margin: 0 0 10px; font-size: 16px; font-weight: 600;">💡 Getting Started Tips</h4>
    <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
      <li>Complete your profile with all required information</li>
      <li>Explore the platform features and dashboard</li>
      <li>Connect with other members in your community</li>
      <li>Start contributing to our mission immediately</li>
    </ul>
  </div>
`; 