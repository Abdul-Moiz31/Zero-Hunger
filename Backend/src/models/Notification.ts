import { Schema, model, InferSchemaType } from 'mongoose';

/**
 * Notification types let the frontend render distinct icons/colors and let us
 * filter/group notifications. `taskId` is optional because some notifications
 * (e.g. account approval) are not tied to a food task.
 */
export const NOTIFICATION_TYPES = [
  'new_donation',
  'claimed',
  'assigned',
  'in_progress',
  'completed',
  'delivery_confirmed',
  'approved',
  'general',
] as const;

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Food' },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'general' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export type INotification = InferSchemaType<typeof notificationSchema>;

export default model('Notification', notificationSchema);
