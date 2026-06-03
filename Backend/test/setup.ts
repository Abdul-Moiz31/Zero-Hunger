import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Provide a valid environment BEFORE any app module (which reads env at import)
// is loaded. A strong JWT secret is required by config/env.ts.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test_secret_'.padEnd(48, 'x'); // >= 32 chars
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-pass';
process.env.IMGBB_KEY = 'test-key';
process.env.FRONTEND_URL = 'http://localhost:5173';
// MONGO_URI is set once the in-memory server is up (below). env.ts only needs
// it to be present, so seed a placeholder that connectDB never actually uses
// in tests (tests connect to the in-memory server explicitly).
process.env.MONGO_URI = 'mongodb://placeholder/test';

// Don't send real emails during tests.
vi.mock('../src/config/nodemailer', () => ({
  default: { sendMail: vi.fn().mockResolvedValue(true), verify: vi.fn() },
}));
vi.mock('../src/emails/sendConfirmationEmail', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock('../src/emails/sendApprovalEmail', () => ({
  sendApprovalEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock('../src/emails/sendResetPasswordEmail', () => ({
  sendResetPasswordEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetConfirmation: vi.fn().mockResolvedValue(true),
}));
vi.mock('../src/emails/sendVolunteerConfirmationEmail', () => ({
  sendVolunteerConfirmationEmail: vi.fn().mockResolvedValue(true),
}));

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  // Wipe all collections between tests for isolation.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
