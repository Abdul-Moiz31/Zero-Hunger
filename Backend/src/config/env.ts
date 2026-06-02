import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized, validated environment configuration.
 *
 * The app reads configuration ONLY through this module so that:
 *  - required variables are validated once, at startup (fail fast);
 *  - weak/placeholder secrets are rejected before the server accepts traffic;
 *  - the rest of the codebase gets a typed, trustworthy `env` object.
 */

const WEAK_SECRETS = ['supersecretkey', 'secret', 'changeme', 'jwtsecret', 'password'];

type NodeEnv = 'development' | 'production' | 'test';

interface Env {
  NODE_ENV: NodeEnv;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  FRONTEND_URL: string;
  /** Comma-separated allowlist of origins permitted by CORS. */
  CORS_ORIGINS: string[];
  IMGBB_KEY: string;
  isProduction: boolean;
}

const errors: string[] = [];

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    errors.push(`Missing required environment variable: ${name}`);
    return '';
  }
  return value.trim();
}

const NODE_ENV = (process.env.NODE_ENV as NodeEnv) || 'development';
const isProduction = NODE_ENV === 'production';

const PORT = Number(process.env.PORT) || 5000;

const MONGO_URI = required('MONGO_URI');

const JWT_SECRET = required('JWT_SECRET');
if (JWT_SECRET) {
  if (WEAK_SECRETS.includes(JWT_SECRET.toLowerCase())) {
    errors.push('JWT_SECRET is a known weak/default value. Use a strong random secret.');
  } else if (JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long.');
  }
}

// Email is required so transactional mail (approval/reset/contact) works.
const EMAIL_USER = required('EMAIL_USER');
const EMAIL_PASS = required('EMAIL_PASS');

// IMGBB is required for donation image uploads.
const IMGBB_KEY = required('IMGBB_KEY');

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').trim();

// Allow a comma-separated CORS allowlist; default to the single frontend URL.
const CORS_ORIGINS = (process.env.CORS_ORIGINS || FRONTEND_URL)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (errors.length > 0) {
  console.error('\n❌ Invalid environment configuration:\n');
  errors.forEach((e) => console.error(`   • ${e}`));
  console.error('\nSee Backend/.env.example for the full list of variables.\n');
  process.exit(1);
}

export const env: Env = {
  NODE_ENV,
  PORT,
  MONGO_URI,
  JWT_SECRET,
  EMAIL_USER,
  EMAIL_PASS,
  FRONTEND_URL,
  CORS_ORIGINS,
  IMGBB_KEY,
  isProduction,
};

export default env;
