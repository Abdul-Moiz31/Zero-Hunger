# AUDIT_REPORT.md — Zero Hunger

> Production-readiness audit. Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low/Polish
> Date: 2026-06-02 · Baseline: backend `tsc` clean, frontend `tsc` + `vite build` clean.

---

## 🔴 Critical (break functionality or expose the platform)

### C1 — JWT payload/claim mismatch breaks all authenticated `req.user.id` routes
- `authController.login` signs `{ id: user._id, role }` ([authController.ts:75](Backend/src/controllers/authController.ts#L75)).
- `authMiddleware` decodes as `{ _id, role }` and sets `req.user = { id: decoded._id, role }` ([authMiddleware.ts:28](Backend/src/middlewares/authMiddleware.ts#L28)).
- Result: `req.user.id === undefined` on every protected request. Any controller that queries by `req.user.id` (donor stats/donations/notifications, NGO stats/volunteers/claims, volunteer tasks, profile update, `getOwnUser`) operates on `undefined` → wrong/empty results or cast errors.
- **Fix:** make the signed payload and the decoded shape agree on one claim name (`id`), and type the decode accordingly.

### C2 — Live secrets committed to git
- `Backend/.env` (Mongo Atlas URI **with password**, `JWT_SECRET=supersecretkey`, Gmail `EMAIL_PASS`, `IMGBB_KEY`) and `Frontend/.env` are tracked (`git ls-files` confirms).
- **Fix:** `git rm --cached` both, add to ignore (already ignored going forward), add `.env.example`, document mandatory credential rotation. (No history purge per decision.)

### C3 — Weak/committed JWT secret
- `JWT_SECRET=supersecretkey` — trivially guessable and public. Anyone can forge admin tokens.
- **Fix:** require a strong secret from env, fail fast if missing/weak; rotate.

### C4 — Unauthenticated notification creation + broken field names
- `POST /api/notifications` (`sendNotification`) has **no auth** and anyone can spam-create notifications/emails ([notificationRoutes.ts](Backend/src/routes/notificationRoutes.ts)).
- It writes `receiver_id` / reads `receiver_id`, but the schema field is `recipientId` ([notificationController.ts:7,26](Backend/src/controllers/notificationController.ts#L7)). These notifications never associate to a user.
- **Fix:** authenticate, restrict, and align field names — or remove the endpoint (per-role notification routes already cover the app).

## 🟠 High

### H1 — CORS hardcoded to localhost
- `server.ts` sets `origin: 'http://localhost:5173'` ([server.ts:26](Backend/src/server.ts#L26)); production frontend will be blocked. **Fix:** drive from `FRONTEND_URL`/allowlist env.

### H2 — Cookie `sameSite:'none'` without `secure` in dev
- Login cookie uses `sameSite:'none'` with `secure` only in prod ([authController.ts:81](Backend/src/controllers/authController.ts#L81)). `none` without `secure` is rejected by modern browsers. The app actually relies on the **Bearer token in localStorage**, so the cookie is dead weight + XSS-exfiltration surface. **Fix:** make cookie config coherent or drop it; pick one auth transport.

### H3 — No global error handler / unhandled async rejections
- `addFood`, `acceptFood`, `assignVolunteer`, `updateStatus` ([foodController.ts](Backend/src/controllers/foodController.ts)) have **no try/catch** → unhandled promise rejections crash or hang requests. No Express error middleware exists.

### H4 — No input validation layer
- Bodies are trusted directly. No schema validation (e.g., zod/express-validator). Status strings, IDs, quantities unvalidated in several handlers.

### H5 — No rate limiting / brute-force protection on auth
- `login`, `forgot-password`, `register`, `contact` are unthrottled → credential stuffing & email-bomb risk.

### H6 — No security headers (helmet) and `error` objects leaked to clients
- Many handlers return `error: error.message` (and sometimes the raw `error` object) to the client, leaking internals.

### H7 — Frontend dead routes
- App defines `/auth` but code navigates to `/login` (signOut, PrivateRoute redirect target, Listings) and `/my-claims` (Listings) — neither route exists; users land on catch-all `/`. ([App.tsx](Frontend/src/components/../App.tsx), [AuthContext.tsx:108](Frontend/src/contexts/AuthContext.tsx#L108), [Listings.tsx:89](Frontend/src/components/Listings.tsx#L89))

### H8 — Bearer token in `localStorage`
- Susceptible to XSS token theft. Acceptable for MVP but should be documented; mitigate with strict CSP / input sanitization, or move to httpOnly cookie consistently.

## 🟡 Medium

- **M1 — Inconsistent HTTP client:** `utils/axios.ts` instance (with interceptors) exists but contexts mostly call bare `axios` with manual headers → no centralized 401 handling, duplicated logic.
- **M2 — Two toast libraries** (`react-toastify` + `react-hot-toast`) bundled; pick one.
- **M3 — NGO↔volunteer linkage by `organization_name` string** instead of `ngoId` ObjectId ([ngoController.ts:57](Backend/src/controllers/ngoController.ts#L57)) — fragile (rename breaks links, name collisions).
- **M4 — `Food` schema vs `IFood` interface drift** ([Food.ts](Backend/src/models/Food.ts)) — interface fields (`foodLocation`, `expiryDate`) don't exist in schema; misleading types.
- **M5 — Legacy duplicate food endpoints** (`/api/food/*` `addFood/acceptFood/...`) overlap NGO/volunteer controllers and contain bugs (`userId` vs `donorId`); likely unused → remove.
- **M6 — `completedOrders` never incremented**; volunteer `rating` increments by 0.5 with no cap/ratings model.
- **M7 — No pagination** on admin/donation/notification lists → scaling problem.
- **M8 — `console.log` debugging left in** controllers (getOwnUser, deleteVolunteer, contact).
- **M9 — Socket.IO dependency unused**; notifications poll every 10s per role context (extra load).
- **M10 — `ResetToken` model appears unused** (reset uses User doc fields).
- **M11 — Frontend reads `user._id` in places but login response/`getOwnUser` shapes vary**; ensure consistent user shape.

## 🔵 Low / Polish

- **L1 — `index.html` title** = "Vite + React + TS"; favicon is default Vite svg.
- **L2 — Frontend package name** = "vite-react-typescript-starter".
- **L3 — Large single JS bundle** (429 KB) — no code-splitting/manualChunks.
- **L4 — `Frontend/.env` has a leading space** before `VITE_API_BASE_URL`.
- **L5 — `@types/date-fns` / `@types/react-toastify`** are stub/deprecated types; libs ship their own.
- **L6 — Commented-out dead code** across auth middleware, axios, volunteer controller.
- **L7 — No `.dockerignore`/Dockerfile**, no `/health` endpoint for Render health checks.
- **L8 — No automated tests** (CI only typechecks/builds).

---

## Build / Tooling baseline (verified Phase 1)
| Check | Result |
|---|---|
| Backend `tsc --noEmit` | ✅ pass |
| Frontend `tsc --noEmit` | ✅ pass |
| Frontend `vite build` | ✅ pass (1 chunk, 429 KB) |
| Tests | ❌ none |
| Lint | configured (eslint) — not run in audit |
