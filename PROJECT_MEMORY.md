# PROJECT_MEMORY.md — Zero Hunger

> Single source of truth for the Zero Hunger platform. Updated continuously as work progresses.
> Last updated: 2026-06-02 (Phase 1 — initial analysis)

---

## 1. Product Purpose

**Zero Hunger** is a food-rescue / food-redistribution platform that connects four kinds of users to reduce food waste and fight hunger:

- **Donors** — restaurants, businesses, or individuals who post surplus food donations.
- **NGOs** — organizations that claim donations and coordinate distribution.
- **Volunteers** — people affiliated with an NGO who pick up and deliver claimed food.
- **Admins** — platform operators who approve users and oversee donations.

### Core value loop
1. Donor posts a food donation (with quantity, expiry, pickup window, location, photo).
2. All NGOs are notified; an NGO **claims** the donation.
3. NGO **assigns a volunteer** to handle pickup/delivery.
4. Volunteer updates task status (`in_progress` → `completed`).
5. Donor is notified at each milestone; volunteer earns a rating bump on completion.

---

## 2. Architecture Summary

Monorepo with two apps:

```
Zero-Hunger/
├── Backend/   → Node + Express + TypeScript REST API, MongoDB (Mongoose)
├── Frontend/  → React 18 + TypeScript + Vite + Tailwind + MUI
├── .github/workflows/ci.yml  → typecheck + frontend build
```

### Backend stack
- **Runtime:** Node, Express 4, TypeScript (commonjs, target ES2020)
- **DB:** MongoDB Atlas via Mongoose 7
- **Auth:** JWT (Bearer header), bcrypt password hashing, httpOnly cookie also set on login
- **Email:** Nodemailer (Gmail service) — confirmation, approval, reset, contact, volunteer onboarding
- **Image upload:** ImgBB API (base64) via multer memory storage
- **Real-time:** `socket.io` is a dependency but **NOT wired in** (server uses plain `app.listen`). Frontend currently **polls** notifications every 10s.
- **Build:** `tsc` → `dist/`, start `node dist/server.js`
- **Deploy (current):** `vercel.json` (serverless) — to be replaced with Render.

### Frontend stack
- **Framework:** React 18 + Vite 5 + TypeScript
- **Routing:** react-router-dom v6
- **State:** React Context per role (Auth, Admin, Donor, NGO, Volunteer, Food)
- **HTTP:** axios (a configured instance in `utils/axios.ts` exists, but most contexts call `axios` directly with manual headers)
- **UI:** Tailwind CSS + MUI + lucide-react icons; toasts via both `react-toastify` and `react-hot-toast`
- **Auth storage:** JWT + user JSON in `localStorage`

---

## 3. User & Admin Flows

### Registration / Approval
- Donor/NGO/Volunteer register → account created with `isApproved: false`.
- Confirmation email sent.
- **Admin approves** the user (`PUT /api/admin/user-status/update`) → approval email sent.
- Login is **blocked** until `isApproved === true` (403 otherwise).
- Volunteers can alternatively be **created directly by an NGO** (auto-approved, random password emailed).

### Donor flow
- Create donation (multipart, optional image) → all NGOs notified.
- View own donations + stats (total / pending / completed).
- Delete or update status of own donations.
- Receive notifications (claimed, completed).

### NGO flow
- View available donations (via `/api/food/available`), claim them.
- View claimed foods, assign a volunteer, update food status, delete claimed food.
- Manage volunteers (add / update / delete) scoped by `organization_name`.
- Stats: volunteers, completed, pending. Notifications.

### Volunteer flow
- View assigned tasks + stats (available / in_progress / completed).
- Update task status; NGO + donor notified on progress/completion; volunteer rating += 0.5 on completion.
- Notifications.

### Admin flow
- Dashboard stats (counts of NGOs / donors / volunteers / donations + user list).
- Approve users, delete users, view & delete all food donations.
- `PUT /api/admin/settings` is a placeholder (no-op).

---

## 4. Database Structure (Mongoose models)

### User (`models/User.ts`)
| field | type | notes |
|---|---|---|
| name | String (req) | |
| email | String (req, unique, regex) | |
| password | String (req) | bcrypt-hashed via pre-save hook |
| role | enum donor/ngo/volunteer/admin (req) | |
| organization_name | String | used to link NGO↔volunteers |
| contact_number | String | |
| resetPasswordToken / resetPasswordExpires | String / Date | sha256 hash + 1h expiry |
| status | enum Active/Inactive (def Active) | |
| completedOrders | Number (def 0) | not actually incremented anywhere |
| joinedDate | Date | |
| isApproved | Boolean (def false) | gates login |
| ngoId | ObjectId→User | set on volunteer (link is also done by org_name string — inconsistent) |
| rating | Number (def 0) | volunteer rating |
| timestamps | | createdAt/updatedAt |

### Food (`models/Food.ts`)
donorId, title, description, quantity, unit, expiry_time (Date), pickup_window_start/end (String), status (available/in_progress/assigned/completed, def available), ngoId, acceptance_time, volunteerId, delivered_time, pickup_location, temperature_requirements, contact_number, dietary_info, createdAt, img.
> Note: the `IFood` TS interface and the actual schema **diverge** (interface lists fields like `foodLocation`/`expiryDate` not in schema).

### Notification (`models/Notification.ts`)
recipientId (→User, req), message (req), taskId (→Food, req), read (def false), createdAt.
> Note: `notificationController.ts` writes/reads `receiver_id` — **field-name mismatch** with schema's `recipientId` (those notifications are broken).

### ResetToken (`models/ResetToken.ts`)
Present but reset flow stores token on the User doc instead — model likely unused. (To verify.)

---

## 5. API Structure

Base: `/api`

### `/api/auth`
- `POST /register`
- `POST /login`
- `POST /forgot-password`
- `POST /reset-password/:token`
- `GET  /org-names`
- `PUT  /update-profile` (auth)
- `GET  /me` (auth)

### `/api/admin` (admin only)
- `GET /dashboard-stats`, `GET /food-donations`
- `PUT /user-status/update`, `DELETE /users/:userId`
- `DELETE /food-donations/:donationId`
- `PUT /settings` (placeholder no-op)

### `/api/donor` (mostly donor; some shared)
- `POST /donate` (donor, multipart img)
- `GET /stats`, `GET /my-donations` (donor/volunteer/ngo/admin)
- `DELETE /donate/:id` (donor)
- `PUT /donation/:id/status` (donor)
- `GET /Notifications` (donor/ngo/volunteer/admin)  ← capital N
- `PUT /notifications/:notificationId/read` (donor/ngo)

### `/api/ngo` (ngo only)
- `GET /volunteers`, `POST /claim/food`, `GET /claimed/foods`, `GET /stats`
- `POST /assign-volunteer`, `DELETE /volunteers/:id`, `PUT /volunteers/:id`, `POST /volunteers`
- `PATCH /food/:id/status`, `DELETE /claimed-food/:id`
- `GET /notifications`, `PATCH /notifications/:notificationId/read`

### `/api/volunteer` (volunteer only)
- `GET /stats`, `GET /tasks`, `PATCH /tasks/:taskId/status`
- `GET /notifications`, `PATCH /notifications/:notificationId/read`

### `/api/food`
- `POST /` (donor) — `addFood` (legacy, sets `userId` not `donorId` — buggy/unused)
- `GET /available` — public list of available donations
- `PUT /accept/:id` (ngo), `PUT /assign/:id` (ngo), `PUT /status/:id` (volunteer) — legacy duplicate of ngo/volunteer controllers

### `/api/contact`
- `POST /` — contact form → email

### `/api/notifications`
- `POST /` (no auth!) — `sendNotification` (writes wrong field, no auth guard)
- `GET /` (auth) — `getNotifications` (reads wrong field)

> **Notification endpoints are fragmented**: donor/ngo/volunteer each have their own. The `/api/notifications` controller is broken (field mismatch) and `POST` is unauthenticated.

---

## 6. Known Issues (see AUDIT_REPORT.md for full list)

Top criticals discovered in Phase 1:
1. **JWT id mismatch** — login signs `{id}`, middleware reads `decoded._id` → `req.user.id` is `undefined`. Breaks every `req.user.id`-dependent route.
2. **Secrets committed** — `Backend/.env` & `Frontend/.env` are git-tracked with live Mongo/JWT/Gmail/ImgBB credentials.
3. **Dead routes** — frontend navigates to `/login` and `/my-claims` which don't exist (only `/auth`).
4. **Notification field mismatch** — `notificationController` uses `receiver_id` vs schema `recipientId`.
5. **CORS hardcoded** to `http://localhost:5173`; cookie `sameSite:'none'` without `secure` in dev.
6. **No global error handler, no input validation library, no rate limiting, no helmet.**

---

## 7. Decisions Made

- **Secrets:** untrack `.env`, add `.env.example`, document rotation in SECURITY_GUIDE (no history rewrite).
- **Deployment:** Render, two services — Backend Web Service + Frontend Static Site, via `render.yaml`.
- **Real-time:** wire up Socket.IO properly for live notifications (replaces/augments 10s polling).
- **Workflow:** autonomous through all 10 phases, commit per phase on `feature/phase-xx-*` branches, report after each.

---

## 8. Completed Work

- _Phase 1 (in progress):_ full repo analysis; PROJECT_MEMORY, AUDIT_REPORT, IMPLEMENTATION_PLAN created.

## 9. Pending Work

- Phases 2–10 per IMPLEMENTATION_PLAN.md.
