import { io, Socket } from 'socket.io-client';

/**
 * Lazily-created singleton Socket.IO client. Connects to the API origin
 * (VITE_API_BASE_URL without the trailing /api) and authenticates with the
 * stored JWT. Used for real-time notification delivery.
 */
let socket: Socket | null = null;

function apiOrigin(): string {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  // Strip a trailing "/api" (and any trailing slash) to get the server origin.
  return base.replace(/\/api\/?$/, '');
}

export function getSocket(): Socket | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!socket) {
    socket = io(apiOrigin(), {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

/** Volunteer calls this to broadcast their GPS position for an active task. */
export function emitLocation(taskId: string, ngoId: string, lat: number, lng: number): void {
  getSocket()?.emit('location:update', { taskId, ngoId, lat, lng });
}
