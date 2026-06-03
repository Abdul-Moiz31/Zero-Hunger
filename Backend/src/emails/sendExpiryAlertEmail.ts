import transporter from '../config/nodemailer';
import { createEmailTemplate } from './emailTemplate';

interface ExpiryAlertPayload {
  to: string;
  ngoName: string;
  donationTitle: string;
  expiryTime: string;
  pickupLocation: string;
}

export async function sendExpiryAlertEmail(payload: ExpiryAlertPayload): Promise<void> {
  const { to, ngoName, donationTitle, expiryTime, pickupLocation } = payload;

  const { subject, html } = createEmailTemplate({
    subject: `⏰ Urgent: "${donationTitle}" expires soon — claim it now`,
    title: 'Food Expiring Soon',
    subtitle: `Dear ${ngoName}, an available donation needs urgent attention.`,
    headerIcon: '⏰',
    content: `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;background:#f9fafb;font-weight:600;width:40%">Donation</td><td style="padding:8px">${donationTitle}</td></tr>
        <tr><td style="padding:8px;background:#fef2f2;font-weight:600">Expires</td><td style="padding:8px;color:#dc2626;font-weight:600">${expiryTime}</td></tr>
        <tr><td style="padding:8px;background:#f9fafb;font-weight:600">Pickup Location</td><td style="padding:8px">${pickupLocation || 'Not specified'}</td></tr>
      </table>
      <p style="color:#374151">Please log in to Zero Hunger and claim this donation before it expires.</p>
    `,
  });

  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
}
