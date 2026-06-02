# IMPLEMENTATION_PLAN.md — Zero Hunger

> Phased plan to take the platform to production on Render. Each phase = one `feature/phase-xx-*` branch, committed and reported.
> Cross-references issue IDs in [AUDIT_REPORT.md](AUDIT_REPORT.md).

---

## Phase 1 — Analysis & docs ✅ (this commit)
- Full repo read; `PROJECT_MEMORY.md`, `AUDIT_REPORT.md`, `IMPLEMENTATION_PLAN.md`, `CHANGELOG.md`.
- Establish build baseline (backend tsc, frontend tsc + build — all green).

## Phase 2 — Critical fixes  `feature/phase-02-critical-fixes`
- **C1** Fix JWT id mismatch (align payload + middleware on `id`).
- **C2** `git rm --cached` both `.env`; add `Backend/.env.example`, `Frontend/.env.example`.
- **C3** Enforce strong `JWT_SECRET` from env (fail fast); placeholder rotated in examples.
- **C4** Secure/align or remove `/api/notifications` (`recipientId`, add auth).
- **H7** Add real `/auth` redirects; fix `/login` & `/my-claims` navigations.
- Smoke: typecheck both, build frontend.

## Phase 3 — Backend reliability  `feature/phase-03-backend`
- **H3** Add async wrapper + global error-handling middleware; wrap all controllers.
- **H4** Add validation (zod) on auth, donation, status-update, volunteer, contact bodies.
- **H6** Stop leaking raw errors; standardized JSON error shape; structured logging.
- **M4** Reconcile `Food` schema/interface. **M3** add real `ngoId` linkage (keep org_name fallback for migration). **M5/M10** remove dead food endpoints + unused ResetToken (if confirmed). **M8** remove debug logs.
- Centralize env config module with validation; `connectDB` ret/timeout + don't `process.exit` in serverless contexts.

## Phase 4 — Frontend quality  `feature/phase-04-frontend`
- **M1** Route all API calls through the shared axios instance (baseURL + interceptors + 401 handling).
- **M2** Consolidate to one toast library.
- Fix user-shape consistency (`_id`), loading/empty/error states on dashboards & listings.
- **L1/L2/L4** Branding (title, favicon, package name), fix `.env` whitespace.
- Route guards: redirect unauthenticated to `/auth`; post-login role routing already present.

## Phase 5 — High-value features  `feature/phase-05-features`
- **Socket.IO real-time notifications** (server integration + per-user rooms + client hook), replacing/augmenting 10s polling (M9).
- Notification "mark all read" + unread badge; consistent notification model across roles.
- Donation lifecycle polish (volunteer pickup confirmation, donor cancel guards).

## Phase 6 — Security hardening  `feature/phase-06-security`
- **H1** CORS allowlist from env. **H2/H8** coherent auth transport + document.
- **H5** Rate limiting (auth, contact, global). **H6** `helmet`, payload size limits.
- Input sanitization / NoSQL-injection guard (`express-mongo-sanitize` or manual). Secrets rotation doc.

## Phase 7 — Performance  `feature/phase-07-performance`
- **M7** Pagination on admin/donation/notification lists. DB indexes (status, donorId, ngoId, volunteerId, recipientId).
- **L3** Frontend code-splitting (route-level lazy, manualChunks). gzip/asset caching.
- Reduce notification polling once sockets land.

## Phase 8 — Render deployment  `feature/phase-08-render`
- `render.yaml` (Backend Web Service + Frontend Static Site).
- `/health` endpoint; production build/start commands; env var documentation.
- Replace `vercel.json`; ensure Socket.IO works on persistent web service; SPA rewrite for static site.

## Phase 9 — Testing & QA  `feature/phase-09-testing`
- Backend unit/integration tests (auth, donation flow, notifications) with an in-memory/CI Mongo.
- Frontend smoke/component tests for critical flows. Wire into CI (`ci.yml`).
- Manual QA pass of all four role flows.

## Phase 10 — Documentation  `feature/phase-10-docs`
- Finalize: `README.md`, `SYSTEM_ARCHITECTURE.md`, `API_DOCUMENTATION.md`, `DATABASE_DOCUMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `SECURITY_GUIDE.md`, `CONTRIBUTING.md`.
- Ensure docs reflect final implementation; update PROJECT_MEMORY + CHANGELOG.

---

### Working rules
- Update `PROJECT_MEMORY.md` + `CHANGELOG.md` each phase.
- Per phase report: **Summary · Risks · Files changed · Tests performed**.
- Keep typecheck + frontend build green at every phase boundary.
