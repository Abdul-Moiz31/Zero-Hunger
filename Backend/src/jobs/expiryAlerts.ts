import cron from 'node-cron';
import Food from '../models/Food';
import User from '../models/User';
import { emitNotification } from '../utils/notify';
import { sendExpiryAlertEmail } from '../emails/sendExpiryAlertEmail';

/**
 * Runs every 15 minutes.
 * Finds available (unclaimed) food donations expiring in the next 2 hours
 * that haven't had an alert sent yet, then notifies all approved NGOs via
 * in-app notification and email.
 */
export function startExpiryAlertJob(): void {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const expiringFoods = await Food.find({
        status: 'available',
        expiry_alert_sent: { $ne: true },
        expiry_time: { $gte: now, $lte: twoHoursLater },
      });

      if (expiringFoods.length === 0) return;

      const ngos = await User.find({ role: 'ngo', isApproved: true }).select('_id email organization_name');

      for (const food of expiringFoods) {
        const expiryStr = new Date(food.expiry_time as Date).toLocaleString();

        await Promise.all(
          ngos.map(async (ngo) => {
            await emitNotification({
              recipientId: ngo._id,
              message: `⏰ "${food.title}" expires at ${expiryStr} — claim it before it's gone!`,
              taskId: food._id,
              type: 'expiry_alert',
            });

            try {
              await sendExpiryAlertEmail({
                to: ngo.email,
                ngoName: ngo.organization_name || ngo.email,
                donationTitle: food.title,
                expiryTime: expiryStr,
                pickupLocation: (food.pickup_location as string) || '',
              });
            } catch {
              // Email failure must not break the notification loop
            }
          })
        );

        (food as typeof food & { expiry_alert_sent?: boolean }).expiry_alert_sent = true;
        await food.save();
      }

      console.log(`[expiryAlerts] Alerted ${expiringFoods.length} expiring donation(s)`);
    } catch (err) {
      console.error('[expiryAlerts] Job failed:', err);
    }
  });

  console.log('[expiryAlerts] Expiry alert cron job started (every 15 min)');
}
