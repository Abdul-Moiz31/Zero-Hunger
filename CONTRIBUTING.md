# Contributing

Thanks for your interest in improving Zero Hunger! 🌱

## Getting set up

See the [Quick start](README.md#-quick-start) in the README. In short:

```bash
cd Backend  && cp .env.example .env && npm install && npm run dev
cd Frontend && cp .env.example .env && npm install && npm run dev
```

## Workflow

1. Create a branch from `main`: `feature/<short-description>` or `fix/<short-description>`.
2. Make your change. Keep commits focused and write clear messages.
3. Make sure everything is green (see below).
4. Open a pull request describing **what** changed and **why**.

## Checks that must pass

These run in CI and should pass locally before you push:

```bash
# Backend
cd Backend
npx tsc --noEmit     # type check
npm run lint         # lint
npm test             # tests (in-memory MongoDB)

# Frontend
cd Frontend
npx tsc --noEmit     # type check
npm run build        # production build
```

## Coding guidelines

- **TypeScript everywhere.** Avoid `any`; prefer precise types.
- **Backend:** wrap async route handlers in `asyncHandler`, throw `AppError`
  for expected failures, and validate input with a Zod schema in `validators/`.
  Never return raw error objects to the client.
- **Frontend:** make all API calls through `utils/axios.ts` (never bare
  `axios`/`fetch` or hardcoded URLs). Reuse the design-system components in
  `components/ui/` rather than re-styling from scratch.
- **Notifications:** create them via `emitNotification()` so they persist and
  deliver in real time consistently.
- **Accessibility & responsiveness:** components should work on mobile and
  respect `prefers-reduced-motion`.

## Adding a test

Backend tests live in `Backend/test/` and use Vitest + Supertest against an
in-memory MongoDB (no external services needed). Follow the existing
`auth.test.ts` / `donation.test.ts` patterns.

## Reporting bugs / security issues

- **Bugs:** open an issue with steps to reproduce.
- **Security:** please report privately — see [SECURITY.md](SECURITY.md).
