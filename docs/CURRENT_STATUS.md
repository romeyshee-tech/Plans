# FEST MVP — Current Status

**State**: MVP core + beta hardening done. PRs #3 (profile save + native auth + realtime backfill), #4 (security minimum), and #5 (observability) are merged into `master`.

> 🧭 New agent? Read [`docs/HANDOFF.md`](./HANDOFF.md) first — it is the current
> session handoff and the single source of truth for "what's on master today,
> what are sensible next steps, and what you should not do without asking."

## Implementation status

| Slice | Scope | Status |
|-------|-------|--------|
| 1 | REST read-only + minimal writes (auth, events, venues, search, interest/save) | Done |
| 2 | Plan lifecycle, participants, invitations, groups, notifications | Done |
| 3 | Proposals, voting, finalize/unfinalize, repeat, messages | Done |
| 4 | WebSocket real-time (messages, proposals, votes, lifecycle, participants, notifications) | Done |
| Beta hardening | Profile save, native auth storage, realtime backfill for lifecycle/participants, OTP rate limit + lockout, strict prod JWT_SECRET, helmet, Sentry, PostHog | Done |

All 7 Zustand stores are API-backed.

## What is real API vs still mock-only

| Feature | Status |
|---------|--------|
| Auth (OTP) | **Mock** — `OTP_CODE=1111`, no SMS. Rate-limited + 5-attempt lockout (PR #4). |
| Events | Seed-only, read-only |
| Venues | Seed-only, read-only |
| Plans | Full CRUD + lifecycle, all API-backed |
| Proposals + votes | Full API-backed |
| Messages | Full API-backed |
| Invitations | Full API-backed (atomic accept with 15-participant lock; flips `invited → going` correctly post-PR #3) |
| Groups | Full API-backed |
| Notifications | Full API-backed, server-created only |
| Friends | Full API-backed; `pending → accepted` flow + `friend_request` notifications |
| Plan share / deep link | Share token + public preview + authed join + `plan_join_via_link` notification + `fest://p/:token` linking |
| Profile save (`PATCH /users/me`) | **Wired** in `ProfileScreen` (PR #3) |
| Auth persistence on native | **`AsyncStorage`** on native / `localStorage` on web (PR #3) |
| WebSocket | Real — push-only, REST is source of truth |
| Sentry (FE + BE) | Wired, no-op without DSN (PR #5) |
| PostHog server-side analytics | Wired, 11 core-loop events, no-op without key (PR #5) |

## Realtime

- **Connection**: `ws://localhost:3001/api/ws` — JWT auth on connect
- **Channels**: `user:{userId}`, `plan:{planId}`
- **Events emitted**: `plan.message.created`, `plan.proposal.created`, `plan.vote.changed`, `plan.finalized`, `plan.unfinalized`, `plan.cancelled`, `plan.completed`, `plan.participant.added`, `plan.participant.updated`, `plan.participant.removed`, `notification.created`
- **Reconnect**: exponential backoff + resubscribe + data resync
- **Dedup**: `client_message_id` for messages, ID check for proposals, optimistic vote filtering

## How to run

See [`docs/RUNBOOK.md`](./RUNBOOK.md). Short version:
1. Backend: `npx tsx src/index.ts` (workdir: `backend/`)
2. Frontend: `npx expo start --web` (workdir: `fest-app/`)
3. Auth: any phone + code `1111`

## Known limitations (still open)

- No real SMS — OTP always `1111`
- No refresh-token rotation / revocation
- No request-body schema validation
- No PII scrubbing in Sentry beyond defaults
- No push notifications — in-app + WS only
- No map view
- No email auth
- No group chat — chat is plan-level only
- No event creation form — events are seed-only
- Max 15 participants per plan
- No CI, no automated tests (two manual smoke scripts only)
- WebSocket is single-process (in-memory `Map`)
- `plansStore.error` is global — one banner for all operations
- Notification shape mismatch: WS-pushed uses snake_case, REST-fetched is camelized
- Web-only tested for each release; native flow is wired but not walked end-to-end
- `fest-app/src/fest-animations/**` intentionally excluded from the main frontend quality gate

## Dev/mock-only items intentionally kept

- `OTP_CODE=1111` — mock OTP
- `authStore.logout` clears tokens locally only — no server-side invalidation
- `fetchUser`, `addFriend`, `removeFriend` API functions exist but are unused

## Next steps

See [`docs/HANDOFF.md §5`](./HANDOFF.md) — non-committed list of sensible follow-ups (real SMS, refresh-token rotation, schema validation, device smoke, PII-safe logging, beta hardening round 2, dark theme). None are in flight.
