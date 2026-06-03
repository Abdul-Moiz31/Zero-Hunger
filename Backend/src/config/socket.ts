import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env';

let io: IOServer | null = null;

/**
 * Initializes Socket.IO on the given HTTP server. Each authenticated client
 * joins a private room named by their user id, so we can push notifications to
 * a specific recipient with `emitToUser(userId, ...)`.
 */
export function initSocket(server: HttpServer): IOServer {
  io = new IOServer(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
  });

  // Authenticate the socket handshake using the same JWT as the REST API.
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    if (userId) socket.join(userId);

    // Volunteer broadcasts their GPS position for an active task.
    // Server relays it to the NGO that owns the task.
    socket.on('location:update', async (payload: { taskId: string; ngoId: string; lat: number; lng: number }) => {
      if (!payload?.taskId || !payload?.ngoId) return;
      io!.to(String(payload.ngoId)).emit('volunteer:location', {
        taskId: payload.taskId,
        volunteerId: userId,
        lat: payload.lat,
        lng: payload.lng,
        timestamp: Date.now(),
      });
    });

    socket.on('disconnect', () => {
      // rooms are cleaned up automatically
    });
  });

  return io;
}

/** Emits an event to a single user's room (no-op if sockets aren't running). */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(String(userId)).emit(event, payload);
}

export function getIO(): IOServer | null {
  return io;
}
