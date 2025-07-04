# Email Template System

This directory contains a unified email template system for the Zero Hunger platform. All emails now use a consistent design and branding.

## 📁 Files

### Core Template System
- **`emailTemplate.ts`** - Main template system with reusable components
- **`sendConfirmationEmail.ts`** - Registration confirmation emails
- **`sendApprovalEmail.ts`** - Account approval emails  
- **`sendContactEmail.ts`** - Contact form submission emails
- **`sendResetPasswordEmail.ts`** - Password reset emails
- **`sendVolunteerConfirmationEmail.ts`** - Volunteer account creation emails

## 🎨 Design Features

### Consistent Branding
- **Zero Hunger logo and colors** (green gradient: #16a34a to #22c55e)
- **Professional typography** (Segoe UI font family)
- **Responsive design** (600px max-width, mobile-friendly)
- **Modern styling** (rounded corners, shadows, gradients)

### Email Structure
```
┌─────────────────────────────────────┐
│           Header Section            │
│  🍽️ Zero Hunger Logo & Title       │
│  "Fighting Hunger, One Meal at a   │
│   Time" tagline                     │
└─────────────────────────────────────┘
│           Content Section           │
│  • Personalized greeting            │
│  • Role-specific messaging          │
│  • Action buttons (when needed)    │
│  • Information boxes               │
└─────────────────────────────────────┘
│           Footer Section            │
│  • Mission statement               │
│  • Automated message notice        │
└─────────────────────────────────────┘
```

## 🛠️ Usage

### Creating a New Email

1. **Import the template system:**
```typescript
import { createEmailTemplate } from './emailTemplate';
```

2. **Create content using helper functions:**
```typescript
import { createCustomContent } from './emailTemplate';

const content = createCustomContent(/* parameters */);
```

3. **Generate the email:**
```typescript
const emailData = createEmailTemplate({
  subject: 'Your Email Subject',
  title: 'Main Title',
  subtitle: 'Optional subtitle',
  headerIcon: '🎉', // Emoji or icon
  content,
  actionButton: {
    text: 'Click Here',
    url: 'https://example.com',
    color: '#16a34a' // Optional, defaults to green
  },
  footerText: 'Custom footer message'
});
```

4. **Send the email:**
```typescript
await transporter.sendMail({
  from: `"Zero Hunger Platform" <${process.env.EMAIL_USER}>`,
  to: recipientEmail,
  subject: emailData.subject,
  html: emailData.html,
});
```

## 📧 Email Types

### 1. Registration Confirmation
- **Purpose:** Sent when user registers
- **Status:** Pending approval
- **Icon:** 🍽️
- **Content:** Account creation confirmation, approval process explanation

### 2. Account Approval
- **Purpose:** Sent when admin approves account
- **Status:** Approved and ready to use
- **Icon:** 🎉
- **Content:** Congratulations, role-specific next steps, login button

### 3. Contact Form
- **Purpose:** Sent to admin when contact form submitted
- **Icon:** 📧
- **Content:** Form details, sender information

### 4. Password Reset
- **Purpose:** Sent when user requests password reset
- **Icon:** 🔐
- **Content:** Reset link, security warnings

### 5. Password Reset Confirmation
- **Purpose:** Sent after successful password reset
- **Icon:** ✅
- **Content:** Success confirmation, security notice

### 6. Volunteer Confirmation
- **Purpose:** Sent when volunteer account created
- **Icon:** 🤝
- **Content:** Account details, login credentials, security tips

## 🎯 Benefits

### For Developers
- **Consistent codebase** - All emails use same structure
- **Easy maintenance** - Changes to design apply to all emails
- **Reusable components** - Helper functions for common content
- **Type safety** - TypeScript interfaces for all parameters

### For Users
- **Professional appearance** - Consistent branding across all emails
- **Clear messaging** - Role-specific content and instructions
- **Mobile-friendly** - Responsive design works on all devices
- **Accessible** - Proper contrast, readable fonts, semantic HTML

### For Admins
- **Easy to customize** - Simple parameters to modify content
- **Scalable** - Easy to add new email types
- **Maintainable** - Centralized template system

## 🔧 Customization

### Adding New Email Types
1. Create a helper function in `emailTemplate.ts`
2. Add the function to the exports
3. Create a new email file using the template system
4. Import and use in your controllers

### Modifying Design
1. Edit the `createEmailTemplate` function in `emailTemplate.ts`
2. Changes apply to all emails automatically
3. Test with different email types to ensure consistency

### Adding New Content Types
1. Create a new helper function in `emailTemplate.ts`
2. Follow the existing pattern for content structure
3. Use consistent color schemes and styling

## 🚀 Best Practices

1. **Always use the template system** for new emails
2. **Test emails** in different email clients
3. **Use semantic HTML** for accessibility
4. **Keep content concise** and action-oriented
5. **Include clear CTAs** when appropriate
6. **Use consistent icons** and emojis
7. **Maintain brand colors** throughout

## 📱 Email Client Compatibility

The template system is designed to work across:
- ✅ Gmail (web & mobile)
- ✅ Outlook (web & desktop)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Mobile email apps

## 🔒 Security Considerations

- **No sensitive data** in email content
- **Secure links** for password resets
- **Environment variables** for URLs and credentials
- **Rate limiting** on email sending
- **Error handling** for failed sends 