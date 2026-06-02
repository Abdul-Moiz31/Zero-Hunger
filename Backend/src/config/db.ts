import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connects to MongoDB. Throws on failure so the caller can decide how to handle
 * startup (we await this before binding the HTTP server). Mongoose buffers
 * queries and auto-reconnects after the initial connection succeeds.
 */
const connectDB = async (): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));

  return mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
};

export default connectDB;
