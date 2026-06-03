# Security Guide

This document describes the security posture of the Zero Hunger platform and the
steps required to operate it safely.

## Reporting a vulnerability

Please report security issues privately to the maintainer rather than opening a
public issue. Include steps to reproduce and the potential impact.

## Authentication & authorization

- Passwords are hashed with **bcrypt** (cost 10) and never stored or logged in plaintext.
- Sessions use **JWT** (7-day expiry) sent as a Bearer token. The same token
  authenticates the REST API and the Socket.IO connection.
- Role-based access control is enforced by `authMiddleware(roles)` on every
  protected route (donor / ngo / volunteer / admin).
- Password-reset tokens are random 32-byte values, stored **hashed** (SHA-256)
  with a 1-hour expiry. The forgot-password endpoint does not reveal whether an
  email is registered.

## Application hardening

| Control | Implementation |
|---|---|
| Secure HTTP headers | `helmet` (HSTS, X-Content-Type-Options, X-Frame-Options, COOP/CORP) |
| Rate limiting | `express-rate-limit` — strict on auth (10 / 15 min) and contact (5 / hr), global backstop (300 / 15 min) |
| NoSQL injection | `express-mongo-sanitize` strips `$`/`.` operators; all input validated with `zod` |
| Input validation | `zod` schemas on every mutating route |
| CORS | Origin allowlist from `CORS_ORIGINS` / `FRONTEND_URL` env |
| Payload limits | JSON/urlencoded capped at 1 MB; uploads capped at 5 MB |
| Error handling | Centralized handler; stack traces never returned in production |
| Secrets | Read through a validated config module that refuses weak/missing `JWT_SECRET` |

## Required environment configuration

The server **refuses to start** unless a strong configuration is provided:

- `JWT_SECRET` must be present, not a known-default, and at least 32 characters.
  Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, `IMGBB_KEY` must be set.

Never commit `.env` files. Use `.env.example` as a template.

## ⚠️ Credential rotation (required)

Earlier revisions of this repository committed real credentials and contained a
malicious script. **Before any deployment, rotate every secret:**

1. **MongoDB** — create a new database user / cluster and update `MONGO_URI`.
   Assume the old connection string is compromised.
2. **JWT secret** — generate a new `JWT_SECRET` (see above). Rotating it
   invalidates all existing sessions.
3. **Email** — revoke the old Gmail App Password and issue a new `EMAIL_PASS`.
4. **ImgBB** — regenerate the `IMGBB_KEY`.

Because secrets existed in git history, also audit any machine that ran the
project from an old checkout.

## Real-time (Socket.IO)

- Socket connections require a valid JWT in the handshake; unauthenticated
  sockets are rejected.
- Each user joins a private room keyed by their user id, so notifications are
  only delivered to their intended recipient.
