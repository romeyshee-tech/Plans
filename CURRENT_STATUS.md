# Current Status

Canonical status file lives in [`docs/CURRENT_STATUS.md`](./docs/CURRENT_STATUS.md). New to the repo? Start with [`docs/HANDOFF.md`](./docs/HANDOFF.md).

Snapshot:

- State: MVP core + beta hardening done (PRs #3, #4, #5 merged)
- Quality gate: `npx tsc --noEmit` in both `backend/` and `fest-app/` (no CI, no tests)
- Intentional dev-only: mock OTP (`OTP_CODE=1111`) — real SMS provider deferred
- All observability clients (Sentry FE/BE, PostHog) are no-op without their env var
