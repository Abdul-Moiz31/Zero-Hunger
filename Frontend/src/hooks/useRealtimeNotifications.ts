import { useEffect } from 'react';
import { getSocket } from '@/utils/socket';

interface IncomingNotification {
  _id: string;
  message: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Subscribes to real-time `notification:new` events for the logged-in user and
 * invokes `onNotification` for each one. Falls back gracefully (does nothing) if
 * there's no token / socket. Dashboards keep their polling as a safety net.
 */
export function useRealtimeNotifications(onNotification: (n: IncomingNotification) => void): void {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (n: IncomingNotification) => onNotification(n);
    socket.on('notification:new', handler);

    return () => {
      socket.off('notification:new', handler);
    };
    // onNotification is expected to be stable (useCallback) from the caller.
  }, [onNotification]);
}

export default useRealtimeNotifications;
