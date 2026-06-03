# System Architecture

## Overview

Zero Hunger is a two-tier web application:

```
┌─────────────────────────┐         HTTPS / WSS          ┌──────────────────────────┐
│   Frontend (React SPA)   │  ◄────────────────────────►  │   Backend (Express API)  │
│   Vite · Tailwind · FM   │      REST + Socket.IO         │   TypeScript · Mongoose  │
└─────────────────────────┘                               └────────────┬─────────────┘
        localStorage JWT                                                │
                                                                        ▼
                                                            ┌──────────────────────┐
                                                            │      MongoDB         │
                                                            └──────────────────────┘
                                          external: ImgBB (images), Gmail SMTP (email)
```

- **Frontend** — a single-page React app. Talks to the API through one shared
  axios instance (auth header + 401 handling) and one Socket.IO client.
- **Backend** — a stateless Express API plus a Socket.IO server sharing the same
  HTTP server, so REST and real-time run on one Render web service.
- **Database** — MongoDB via Mongoose, with three collections: `users`, `foods`,
  `notifications`.

## Request lifecycle (REST)

```
client → helmet → CORS → json/urlencoded → mongoSanitize → rate limiter
       → route → authMiddleware(roles) → validateBody(zodSchema)
       → asyncHandler(controller) → response
                                   ↘ (on throw) → errorHandler → clean JSON
```

Every controller is wrapped in `asyncHandler`, so rejected promises flow to a
single `errorHandler` that maps known errors (validation, cast, duplicate key,
JWT) to clean status codes and never leaks stack traces in production.

## Authentication & authorization

1. A user registers → stored with `isApproved: false`.
2. An admin approves them → they can log in.
3. `login` returns a **JWT** (`{ id, role }`, 7-day expiry); the SPA stores it in
   `localStorage` and sends it as a Bearer token.
4. `authMiddleware(roles)` verifies the token, attaches `req.user`, and enforces
   role membership per route.
5. The same JWT authenticates the Socket.IO handshake.

## Real-time notifications

```
controller action (e.g. donor posts food)
        │
        ▼
 emitNotification({ recipientId, message, type, taskId })
        │  ├── persists a Notification document
        │  └── io.to(recipientId).emit('notification:new', notification)
        ▼
 recipient's browser (joined room = their userId)
        │  useRealtimeNotifications hook
        ▼
 instant toast + notification list refresh
```

- On connect, each socket joins a **room named by the user's id**, so a
  notification reaches only its intended recipient.
- Dashboards also **poll** every 8–12s as a fallback if the socket drops.

## Domain flow

```
Donor posts food ──► status: available
        │  (all NGOs notified: new_donation)
        ▼
NGO claims ─────────► status: assigned        (donor notified: claimed)
        │
        ▼
NGO assigns volunteer                          (volunteer notified: assigned)
        │
        ▼
Volunteer: in_progress ─► completed            (NGO + donor notified: completed)
                                                volunteer rating += 0.5
```

## Frontend structure

- **`components/landing/`** — marketing sections (Hero, ImpactStats, HowItWorks,
  Roles, CtaBand), eagerly loaded for fast first paint.
- **`components/dashboard/`** — role dashboards, lazily code-split.
- **`components/ui/`** — the design system (StatCard, DataTable, StatusBadge,
  NotificationBell, Button, motion primitives) shared everywhere.
- **`contexts/`** — one context per role holds that role's data and API calls.
- **`utils/axios.ts`, `utils/socket.ts`** — the single HTTP and socket clients.

## Build & deploy

- Frontend builds to static assets (code-split, vendor-chunked, content-hashed)
  served by Render as a static site with an SPA rewrite.
- Backend compiles TypeScript to `dist/` and runs `node dist/server.js` as a
  Render web service with a `/health` check.

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.
