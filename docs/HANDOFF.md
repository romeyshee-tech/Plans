# Handoff — post PR #3–5 (beta hardening)

This is the **current** handoff doc. The previous revision referenced a
different org (`magtophard-ai`) and a different set of open PRs; it is
fully superseded by this one.

## TL;DR

- **Repo**: `romeyshee-tech/Plans` — single `master` trunk.
- **Baseline**: master with PRs #3, #4, #5 merged. MVP core + beta hardening done.
- **No open PRs.** All roadmap items from the last cycle (profile save + native auth + realtime backfill, security minimum, observability) are shipped.
- **Do not start dark-theme** (`devin/1776881462-dark-theme`) without a separate decision — see §6.
- **Next reasonable blocks of work** are in §5, but none are committed scope.

---

## 1. What's in master today

### Product surface (unchanged from MVP)
Plan lifecycle (`active → finalized → completed`, plus `cancelled`) with proposals, voting, chat, friends, invitations, groups, notifications, plan share link + `fest://p/:token` deep link. Expo React Native web + native frontend, Fastify 5 + PostgreSQL backend, WebSocket push for realtime.

### What the last three PRs added

| PR | What it delivers |
|---|---|
| **#3** — profile save + native auth + realtime backfill ([d54710b](https://github.com/romeyshee-tech/Plans/pull/3)) | `PATCH /users/me` wired end-to-end from `ProfileScreen` (was a no-op before). Token persistence moved to `AsyncStorage` on native / `localStorage` on web via `fest-app/src/utils/authStorage.ts` + async `restoring` gate in `authStore` → OTP survives app restart. Backend now emits `plan.cancelled`, `plan.completed`, `plan.participant.added/updated/removed` over WS; `wsHandler.ts` refetches on all of them. Bug fix: invitation accept actually promotes participant `invited → going` and emits the WS event (previous early-return made it dead code). |
| **#4** — security minimum hardening ([f4694f2](https://github.com/romeyshee-tech/Plans/pull/4)) | OTP rate limits (`/auth/otp/send` 3/min, `/auth/otp/verify` 10/min), per-phone attempt lockout after 5 bad codes (`otp.ts`), global 300/min default. `JWT_SECRET` is required and must be ≥32 chars / not a known dev placeholder when `NODE_ENV=production` — otherwise the server refuses to start. `@fastify/helmet` registered (CSP off — JSON API). `CORS_ORIGIN` env var, comma-separated; empty in prod = no origins allowed. |
| **#5** — observability ([aaab5b1](https://github.com/romeyshee-tech/Plans/pull/5)) | Sentry on backend (`@sentry/node`) + frontend (`@sentry/react-native`). Both init wrapped in `try/catch` so a bad DSN can't crash startup; `captureError` in `try/catch` so the global Fastify error handler still sends the 500. `flushSentry()` awaited before `process.exit()` so queued events land. PostHog server-side (`posthog-node`) capturing 11 core-loop events — full list in `docs/OBSERVABILITY.md`. All three clients are **no-op when their env var is unset**. |

### Known gotchas that survived the cleanup

1. **`backend/src/db/migrate.ts` ordering** — `001_init.sql` references `share_token` which is added by a later `ALTER TABLE`. `migrate.ts` runs the `ALTER TABLE … ADD COLUMN IF NOT EXISTS share_token` before the main init loop. Don't reorder.
2. **`fest-app/src/api/client.ts`** must not set `Content-Type: application/json` on bodyless POSTs — Fastify rejects. See `hasBody` branch.
3. **`pendingJoin.ts` native fallback** — web uses `localStorage`, native uses an in-memory mirror that's enough for the OTP window. Cold-start deep link is re-delivered by `Linking.getInitialURL()`.
4. **Notification shape mismatch** — WS-pushed notifications use `user_id` / `created_at`, REST-fetched ones are camelized. The `Notification` type matches the WS shape; screens that read REST shape coerce inline.
5. **`plansStore.error` is one field** — errors from different operations share one banner. No one's complained yet.
6. **`fest-app/src/fest-animations/**`** is intentionally excluded from the main frontend `tsconfig.json` quality gate. Validate separately with `tsconfig.fest-animations.json` if you touch it.

---

## 2. How to run

Full instructions: [`docs/RUNBOOK.md`](./RUNBOOK.md). Short version:

```bash
# backend
cd backend
npm install --legacy-peer-deps
npx tsx src/db/migrate.ts
npx tsx src/db/seed.ts
npx tsx src/index.ts            # → http://localhost:3001

# frontend (web)
cd fest-app
npm install --legacy-peer-deps
npx expo start --web            # → http://localhost:8081
```

Auth: any phone + code `1111` (mock OTP, see §3).

TypeCheck gate:
```bash
cd backend   && npx tsc --noEmit
cd fest-app  && npx tsc --noEmit
```
No linter, no `npm test` — `tsc --noEmit` is the gate.

---

## 3. Env / secrets (what exists today)

### `backend/.env`
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Default `postgres://postgres:postgres@localhost:5432/plans`. |
| `JWT_SECRET` | **yes in prod** | ≥32 chars, not `dev-secret*` / `changeme` / `secret` / empty. Dev default `dev-secret-change-in-prod` is fine locally. |
| `OTP_CODE` | no | Default `1111`. Mock OTP — see §4. |
| `PORT` | no | Default `3001`. Frontend expects `3001`. |
| `NODE_ENV` | no | Set to `production` to enable strict JWT_SECRET + strict CORS. |
| `CORS_ORIGIN` | no | Comma-separated allowlist. Unset + `NODE_ENV=production` = no origins allowed. Unset + dev = reflect request origin. |
| `SENTRY_DSN` | no | When unset, Sentry is a no-op. |
| `POSTHOG_KEY` | no | When unset, analytics is a no-op. |
| `POSTHOG_HOST` | no | Default `https://eu.i.posthog.com`. |

`.env.example` is the source of truth for available variables.

### `fest-app/.env`
| Variable | Required | Notes |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | no | Needed for native / LAN testing (e.g. `http://192.168.0.28:3001/api`). Web defaults to `http://localhost:3001/api`. |
| `EXPO_PUBLIC_WS_BASE_URL` | no | Derived from API base when unset. |
| `EXPO_PUBLIC_SENTRY_DSN` | no | Sentry for the app bundle. `EXPO_PUBLIC_*` is baked in at build time. |

Seeded demo users (password-less — OTP `1111`):
`+79990000000` (Я / me), `+79991111111` (Маша), `+79992222222` (Дима), `+79993333333` (Лена), `+79994444444` (Артём), `+79995555555` (Катя).

---

## 4. Known limitations still open

These are not bugs — they're deferred by scope. Before taking one on, check with the user.

- **Mock OTP**. `OTP_CODE=1111` — no SMS provider. User explicitly deferred this ("пока не хочу заниматься провайдерами").
- **No refresh-token rotation / revocation / blacklist.** `/auth/refresh` issues a new pair but old ones keep working until natural expiry.
- **No schema validation on request bodies.** Routes cast via `as {...}` — an invalid body can still reach a query. Fastify schema support is there, just not wired up.
- **No PII scrubbing in Sentry.** The doc warns against putting phones / tokens / raw bodies into `captureError` context; nothing enforces it.
- **No CI.** No workflows in `.github/`. `tsc --noEmit` is the gate, and it's run locally.
- **No tests.** There are two manual smoke scripts (`backend/src/tests/e2e-smoke.ts`, `rt2-smoke.ts`), not a test suite.
- **WebSocket is single-process.** In-memory `Map` — won't survive a horizontally-scaled deploy.
- **No push notifications.** In-app + WS only.
- **Web-only tested for each release.** Native flow is wired (including `AsyncStorage` auth persistence) but not walked end-to-end per release.

---

## 5. Sensible next blocks of work (not committed scope)

Pick one at a time, ask before starting. None of these are in-flight.

1. **Real SMS provider.** Replace `sendOtp` stub with a real provider (Twilio / SMS.ru / etc.). Keep `OTP_CODE` path for dev. Biggest beta unlock.
2. **Refresh-token rotation + revocation.** Track refresh-token family, invalidate on logout, detect replay. Sits between "has refresh endpoint" and "production-grade".
3. **Request-body schema validation.** Wire Fastify JSON schemas into the 5–6 hottest write routes (`/plans`, `/plans/:id/proposals`, `/invitations/:id`, `/users/me`). Cheap, high-value.
4. **Device smoke on real iOS/Android.** Walk the golden path (OTP → create plan → invite → chat → vote → finalize) on real devices. First things likely to break: WebSocket reconnect on backgrounding, deep link cold-start behavior, `AsyncStorage` migration.
5. **PII-safe logging.** A small helper that strips phone numbers and tokens before logging or `captureError` context.
6. **Beta hardening round 2.** Pagination on `GET /plans`, index audit, N+1 in plan list, dedupe the `plansStore.error` banner.
7. **Dark theme.** See §6.

---

## 6. Branches

| Branch | State | Action |
|---|---|---|
| `master` | Current trunk, includes PR #3/#4/#5 | — |
| `devin/1776946313-profile-save-native-auth-ws-backfill` | PR #3 (merged) | safe to delete |
| `devin/1776946848-security-hardening` | PR #4 (merged) | safe to delete |
| `devin/1776947143-observability` | PR #5 (merged) | safe to delete |
| `devin/1776803085-beautiful-ui` | stale, 0 ahead of master | safe to delete |
| `devin/1776859625-fix-finalize-without-proposal` | stale, 0 ahead | safe to delete |
| `devin/1776863429-friends-and-profile` | merged earlier (PR #1) | safe to delete |
| `devin/1776870581-plan-share-link` | merged earlier (PR #2) | safe to delete |
| `devin/1776873215-pendingjoin-native-fallback` | merged | safe to delete |
| `devin/1776873461-docs-handoff` | merged | safe to delete |
| `devin/1776877237-onboarding-empty-states` | merged | safe to delete |
| `devin/1776881462-dark-theme` | **4 ahead / 0 behind master at time of gap analysis; untested since PR #3–5 landed** | **do not merge without explicit decision** |

**About `dark-theme`** (recorded for context, not a recommendation):
- 26 files, ~+871/−528 — adds `ThemeContext`, `palettes.ts`, `themeStorage.ts`, migrates every screen to `useThemeColors()`.
- Product-risk is low (no navigation / store / API changes); conflict-risk is high (touches nearly every screen). PR #3 modified `ProfileScreen` and `authStore` — conflicts guaranteed.
- Default is light; dark is opt-in. Author noted some glass-surface `rgba(255,255,255,*)` spots still don't re-theme.
- If someone decides to revive it: rebase on current master first, resolve screen-level conflicts one file at a time, verify contrast on the updated `AuthScreen` / `ProfileScreen`.

---

## 7. For the next agent — what to do first

1. `git fetch && git checkout master && git pull` — you want this revision of the handoff.
2. Read this file and [`docs/CURRENT_STATUS.md`](./CURRENT_STATUS.md). That's enough to understand the state.
3. Run the stack (`§2`) end-to-end before touching anything.
4. Ask the user which item in §5 they want, or propose one with evidence.

What you **should not do** without a separate go-ahead from the user:
- Start dark-theme.
- Add a real SMS provider (deferred).
- Run a big cleanup / refactor across screens or stores.
- Reorganize `docs/`.
- Re-introduce a client-side PostHog (explicit non-goal in `docs/OBSERVABILITY.md`).
- Expand scope beyond the MVP defined in `docs/ProductPlan.md`.
