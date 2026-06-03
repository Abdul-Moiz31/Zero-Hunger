import React, { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationItem, type NotificationLike } from './NotificationItem';

interface Props {
  notifications: NotificationLike[];
  onMarkRead: (id: string) => void;
  onMarkAllRead?: () => void;
  loading?: boolean;
}

/**
 * Bell button with an unread badge and an animated dropdown of typed
 * notifications. Shared across all role dashboards. Closes on outside click /
 * Escape.
 */
export const NotificationBell: React.FC<Props> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-gray-800">
                Notifications {unread > 0 && <span className="text-green-600">({unread})</span>}
              </h3>
              <div className="flex items-center gap-2">
                {unread > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs font-medium text-green-600 hover:text-green-700"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-600" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <NotificationItem key={n._id} notification={n} onMarkRead={onMarkRead} />
                ))
              ) : (
                <div className="py-8 text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">You're all caught up</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
