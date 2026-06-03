import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import connectDB from './config/db';
import { initSocket } from './config/socket';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import foodRoutes from './routes/foodRoutes';
import donorRoutes from './routes/donorRoutes';
import ngoRoutes from './routes/ngoRoutes';
import VolunteerRoutes from './routes/volunteerRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';

export const app = express();

// CORS — driven by an env allowlist so production origins work without code edits.
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server, health checks) with no origin.
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Health check (used by Render and uptime monitors). Does not require the DB.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Zero Hunger API', docs: '/health' });
});

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/volunteer', VolunteerRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 + centralized error handling (must be last).
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Boots the server: connect to the DB first, then bind the HTTP listener.
 * Binding only after a successful DB connection avoids the "server is up but
 * every request fails" state.
 */
const httpServer = createServer(app);
initSocket(httpServer);

async function start() {
  try {
    await connectDB();
    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} (${env.NODE_ENV}) — realtime enabled`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Crash-safety nets: log and exit cleanly so the platform can restart us.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

start();

export default app;
