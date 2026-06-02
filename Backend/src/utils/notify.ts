import { Types } from 'mongoose';
import Notification, { NOTIFICATION_TYPES } from '../models/Notification';

type NotificationType = (typeof NOTIFICATION_TYPES)[number];

interface NotifyInput {
  recipientId: Types.ObjectId | string | unknown;
  message: string;
  taskId?: Types.ObjectId | string | unknown;
  type?: NotificationType;
}

/**
 * Persists a notification for a recipient. This is the single entry point for
 * creating notifications so that real-time delivery (Socket.IO, added in a
 * later phase) can be wired in here without touching every controller.
 */
export const emitNotification = async ({ recipientId, message, taskId, type = 'general' }: NotifyInput) => {
  const notification = await Notification.create({
    recipientId,
    message,
    taskId,
    type,
    read: false,
  });

  // NOTE: real-time push (Socket.IO) is attached here in Phase 5.
  return notification;
};

export default emitNotification;
