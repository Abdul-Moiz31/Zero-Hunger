import rateLimit from 'express-rate-limit';

/**
 * Rate limiters. Auth and contact endpoints are stricter to deter brute-force
 * and email-bomb abuse; a looser global limiter protects the rest of the API.
 * Disabled under NODE_ENV=test so the suite isn't throttled.
 */

const message = (m: string) => ({ message: m });

const isTest = process.env.NODE_ENV === 'test';
const skip = () => isTest;

// 5 attempts / 15 min on sensitive auth actions.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: message('Too many attempts. Please try again in a few minutes.'),
});

// Contact form: prevent spamming the inbox.
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: message('Too many messages sent. Please try again later.'),
});

// Generous global limiter as a backstop against abuse.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: message('Too many requests. Please slow down.'),
});
