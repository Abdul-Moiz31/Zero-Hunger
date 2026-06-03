# API Documentation

Base URL: `<server>/api` · All request/response bodies are JSON unless noted.

## Authentication

Most endpoints require a **Bearer token** obtained from `POST /auth/login`:

```
Authorization: Bearer <jwt>
```

Roles: `donor`, `ngo`, `volunteer`, `admin`. Endpoints list the roles allowed.

Common status codes: `400` validation, `401` unauthenticated, `403` wrong role,
`404` not found, `409` conflict, `429` rate-limited, `500` server error.

---

## Auth — `/api/auth`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/register` | public | `name, email, password, role, [organization_name, contact_number, ngoId]` | Creates a pending user; rate-limited |
| POST | `/login` | public | `email, password` | Returns `{ token, user }`; blocked until approved |
| POST | `/forgot-password` | public | `email` | Always 200 (no email enumeration) |
| POST | `/reset-password/:token` | public | `password` | Token is the emailed reset token |
| GET | `/org-names` | public | — | List of approved NGO organization names |
| GET | `/me` | any | — | Current user (no password) |
| PUT | `/update-profile` | any | `[name, organization_name, contact_number]` | |

## Donor — `/api/donor`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/donate` | donor | multipart: donation fields + optional `img` | Notifies all NGOs |
| GET | `/stats` | donor/ngo/volunteer/admin | — | `{ totalDonations, pendingDonations, completedDonations }` |
| GET | `/my-donations` | donor/ngo/volunteer/admin | — | The caller's donations |
| DELETE | `/donate/:id` | donor | — | Only the owner's |
| PUT | `/donation/:id/status` | donor | `status, [ngoId]` | |
| GET | `/Notifications` | donor/ngo/volunteer/admin | — | Caller's notifications (latest 50) |
| PUT | `/notifications/:id/read` | any role | — | Mark one read |

## NGO — `/api/ngo` (ngo only)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/stats` | — | Volunteer / donation counts |
| GET | `/volunteers` | — | Volunteers linked to this NGO |
| POST | `/volunteers` | `name, email, contact_number` | Creates a volunteer (emails a password) |
| PUT | `/volunteers/:id` | `name, email, contact_number` | |
| DELETE | `/volunteers/:id` | — | |
| POST | `/claim/food` | `foodId` | Claim an available donation |
| GET | `/claimed/foods` | — | This NGO's claimed/in-progress foods |
| POST | `/assign-volunteer` | `volunteerId, foodId` | Notifies the volunteer |
| PATCH | `/food/:id/status` | `status` | |
| DELETE | `/claimed-food/:id` | — | |
| GET | `/notifications` | — | Latest 50 |
| PATCH | `/notifications/:id/read` | — | |

## Volunteer — `/api/volunteer` (volunteer only)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/stats` | — | Assigned / in-progress / completed counts |
| GET | `/tasks` | — | Tasks assigned to this volunteer |
| PATCH | `/tasks/:taskId/status` | `status` | Notifies NGO + donor on completion |
| GET | `/notifications` | — | Latest 50 |
| PATCH | `/notifications/:id/read` | — | |

## Admin — `/api/admin` (admin only)

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/dashboard-stats` | — | Counts + non-admin user list |
| GET | `/food-donations` | — | All donations (formatted) |
| PUT | `/user-status/update` | `userId, status` | Approve a user (notifies + emails them) |
| DELETE | `/users/:userId` | — | |
| DELETE | `/food-donations/:donationId` | — | |

## Food — `/api/food`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/available` | public | Available, unclaimed donations |

## Contact — `/api/contact`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/` | public | `name, email, subject, message` | Emails the team; rate-limited |

## Notifications — `/api/notifications`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | any | Caller's notifications |
| POST | `/` | admin | Create a notification manually |

## Health — `/health`

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ status: 'ok', uptime, timestamp }` — used by Render |

---

## Real-time (Socket.IO)

Connect to the **server origin** (not `/api`) with the JWT:

```js
import { io } from 'socket.io-client';
const socket = io(SERVER_ORIGIN, { auth: { token } });
socket.on('notification:new', (notification) => { /* ... */ });
```

The server emits **`notification:new`** to the recipient with the full
notification document (`{ _id, recipientId, message, type, taskId, read, createdAt }`).
Notification `type` is one of: `new_donation`, `claimed`, `assigned`,
`in_progress`, `completed`, `approved`, `general`.
