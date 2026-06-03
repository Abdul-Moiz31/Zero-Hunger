import React from 'react';
import { motion } from 'framer-motion';
import { getNotificationMeta, timeAgo } from './notificationMeta';

export interface NotificationLike {
  _id: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  notification: NotificationLike;
  onMarkRead?: (id: string) => void;
}

/** A single notification row with type icon, message, relative time, unread dot. */
export const NotificationItem: React.FC<Props> = ({ notification, onMarkRead }) => {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 rounded-xl border p-3 transition-colors ${
        notification.read ? 'border-gray-100 bg-white' : 'border-green-100 bg-green-50/60'
      }`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800">{notification.message}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>
          {!notification.read && onMarkRead && (
            <button
              onClick={() => onMarkRead(notification._id)}
              className="text-xs font-medium text-green-600 hover:text-green-700"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
      {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />}
    </motion.div>
  );
};

export default NotificationItem;
