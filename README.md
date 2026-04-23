# Планы? / FEST MVP

MVP core (Expo + Fastify + PostgreSQL) plus beta hardening: profile save, native auth persistence, realtime backfill for lifecycle/participant events, OTP rate-limit + attempt lockout, strict production `JWT_SECRET`, helmet, Sentry (FE + BE), and server-side PostHog.

## Repo layout

- `fest-app/` — frontend (Expo React Native web/native)
- `backend/` — Fastify 5 + PostgreSQL API
- `contracts/` — OpenAPI + DB schema + acceptance docs
- `docs/` — handoff, current status, runbook, observability

## Quick start

```bash
# backend
cd backend
npm install --legacy-peer-deps
npx tsx src/db/migrate.ts
npx tsx src/db/seed.ts
npx tsx src/index.ts           # → http://localhost:3001

# frontend (web)
cd fest-app
npm install --legacy-peer-deps
npx expo start --web           # → http://localhost:8081
```

Auth for dev: any phone + code `1111` (mock OTP).

### PowerShell variant (for the primary Windows dev machine)

The primary development VM is Windows with disk C full. Use:

```powershell
$env:npm_config_cache="E:\npm-cache"; npm install --legacy-peer-deps
$env:PORT="3001"; E:\FEST\V1\backend\node_modules\.bin\tsx.cmd E:\FEST\V1\backend\src\index.ts
```

See `AGENTS.md` for the full Windows paths + gotchas.

## Quality gate

No linter, no `npm test` script. `tsc --noEmit` is the gate — run it after any code change:

```bash
cd backend  && npx tsc --noEmit
cd fest-app && npx tsc --noEmit
```

Optional animation sandbox (excluded from the main frontend gate):

```bash
cd fest-app && npx tsc --noEmit -p tsconfig.fest-animations.json
```

## Mobile / LAN API setup

For physical device testing, point the app at the backend's LAN IP before `expo start`:

```bash
cd fest-app
EXPO_PUBLIC_API_BASE_URL="http://<LAN_IP>:3001/api" npx expo start --go --tunnel
```

Web defaults to `http://localhost:3001/api` when `EXPO_PUBLIC_API_BASE_URL` is unset.

## Backend smoke tests (manual)

```bash
cd backend
npx tsx src/tests/e2e-smoke.ts
npx tsx src/tests/rt2-smoke.ts
```

## Observability

All three clients (Sentry FE, Sentry BE, PostHog) are **no-op without their env var**, so local dev just works. See [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md) for the tracked event list and setup instructions.

## Documentation

Start here, in order:

1. [`docs/HANDOFF.md`](docs/HANDOFF.md) — current session handoff. What's on master, open issues, next sensible steps, branch hygiene. **Read this first.**
2. [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md) — feature-by-feature status.
3. [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — full setup + demo flow.
4. [`docs/OBSERVABILITY.md`](docs/OBSERVABILITY.md) — Sentry + PostHog setup.
5. [`docs/ProductPlan.md`](docs/ProductPlan.md) — canonical product spec.
6. [`docs/backend-contract.md`](docs/backend-contract.md) — API contract.
