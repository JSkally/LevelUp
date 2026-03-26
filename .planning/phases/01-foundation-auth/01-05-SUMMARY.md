---
phase: 01-foundation-auth
plan: 05
subsystem: infra
tags: [sentry, grafana, loki, pino, pino-loki, observability, error-tracking, logging]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: "Fastify API with pino logger, Next.js web app scaffold"
provides:
  - "Sentry error tracking wired in Next.js web app (client, server, edge runtime)"
  - "Grafana Cloud Loki log transport conditionally active in Fastify API"
  - "withSentryConfig() wrapping in next.config.ts with source map deletion"
affects: [all-phases, 02-coach-portal, 03-athlete-mobile]

# Tech tracking
tech-stack:
  added: [pino-loki]
  patterns:
    - "Sentry SDK split by runtime: @sentry/nextjs with three config files (client/server/edge)"
    - "pino transport multi-target: stdout + Loki conditional on env vars"
    - "Fastify plugin for observability config with graceful skip when creds absent"

key-files:
  created:
    - apps/web/sentry.client.config.ts
    - apps/web/sentry.server.config.ts
    - apps/web/sentry.edge.config.ts
    - apps/api/src/plugins/grafana.ts
  modified:
    - apps/web/next.config.ts
    - apps/api/src/server.ts
    - .env.example

key-decisions:
  - "@sentry/nextjs v9 removed hideSourceMaps option — use sourcemaps.deleteSourcemapsAfterUpload instead"
  - "pino-loki transport configured at Fastify logger init (not plugin registration) for correct log capture"
  - "Grafana plugin gracefully skips with log message when GRAFANA_LOKI_URL/USER/PASSWORD absent — no crash in dev"

patterns-established:
  - "Observability: three-file Sentry pattern for Next.js (client.config/server.config/edge.config)"
  - "Observability: pino multi-target transport with conditional Loki target based on env var presence"

requirements-completed: [INFRA-06]

# Metrics
duration: 15min
completed: 2026-03-26
---

# Phase 1 Plan 05: Observability Wiring Summary

**Sentry fully wired in Next.js web app via three runtime-specific config files and withSentryConfig(), plus Grafana Cloud Loki transport added to Fastify API with graceful dev-mode skip**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-26T23:17:00Z
- **Completed:** 2026-03-26T23:32:51Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Sentry error tracking active across all Next.js runtimes: browser (with Session Replay), Node.js server, and Edge (middleware)
- next.config.ts wraps with withSentryConfig() — source maps deleted after upload, logger disabled, wide client upload enabled
- Grafana Cloud Loki transport wired into Fastify's pino logger with multi-target stdout+Loki config; skips silently in dev when env vars absent
- .env.example updated with all observability env var placeholders (Sentry DSN ×2, Sentry org/project, Grafana Loki URL/user/password)
- All 5 workspaces typecheck clean: db, shared, web, api, mobile

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Sentry in Next.js web app** - `380202b` (feat)
2. **Task 2: Grafana Cloud Loki integration for Fastify API** - `31139c1` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/web/sentry.client.config.ts` - Browser SDK init with Session Replay integration
- `apps/web/sentry.server.config.ts` - Next.js Node.js server-side SDK init (RSC, Server Actions, Route Handlers)
- `apps/web/sentry.edge.config.ts` - Edge runtime SDK init for Next.js middleware
- `apps/web/next.config.ts` - Replaced stub with withSentryConfig() wrapping; sourcemaps.deleteSourcemapsAfterUpload
- `apps/api/src/plugins/grafana.ts` - Fastify plugin validating Loki credentials and logging startup status
- `apps/api/src/server.ts` - buildServer() conditionally configures pino multi-target transport with pino-loki
- `.env.example` - Added NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, GRAFANA_LOKI_URL/USER/PASSWORD

## Decisions Made

- `@sentry/nextjs` v9 removed `hideSourceMaps` — replaced with `sourcemaps: { deleteSourcemapsAfterUpload: true }`
- pino-loki transport must be configured at Fastify init time (before logger creation), not inside the plugin — plugin only validates/logs status
- Loki transport uses multi-target array: `pino/file` to stdout + `pino-loki` to Grafana, so local dev logging is unaffected when Loki is disabled

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed invalid `hideSourceMaps` option for @sentry/nextjs v9**
- **Found during:** Task 1 (Wire Sentry in Next.js web app)
- **Issue:** Plan specified `hideSourceMaps: true` in withSentryConfig options, but @sentry/nextjs v9 renamed this to `sourcemaps.deleteSourcemapsAfterUpload`; tsc reported TS2561 error
- **Fix:** Replaced `hideSourceMaps: true` with `sourcemaps: { deleteSourcemapsAfterUpload: true }`
- **Files modified:** apps/web/next.config.ts
- **Verification:** `pnpm --filter @repo/web typecheck` passes
- **Committed in:** 380202b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — invalid API property for @sentry/nextjs v9)
**Impact on plan:** Required for TypeScript clean build. No scope creep.

## Issues Encountered

- Pre-existing web `next build` failure (unrelated to Sentry): `@repo/shared` exports `./schemas/user.js` and `./schemas/tiers.js` but webpack cannot resolve `.js` extensions from `.ts` source files. This was present before this plan and is out of scope. Logged to deferred-items.

## User Setup Required

The following environment variables must be configured to activate these integrations:

**Sentry (web app errors):**
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN for browser-side error capture
- `SENTRY_DSN` — Sentry DSN for server-side/edge error capture
- `SENTRY_ORG` — Org slug (build-time only, for source map upload)
- `SENTRY_PROJECT` — Project slug (build-time only, for source map upload)

**Grafana Cloud (structured log aggregation):**
- `GRAFANA_LOKI_URL` — Loki push endpoint (e.g., `https://logs-prod-us-central1.grafana.net`)
- `GRAFANA_LOKI_USER` — Numeric Grafana Cloud user ID
- `GRAFANA_LOKI_PASSWORD` — Grafana API token with Logs:Write scope

Both integrations gracefully skip when credentials are absent — no runtime errors in local dev.

## Next Phase Readiness

- INFRA-06 closed: Sentry captures web errors (client + server + edge), Grafana receives API logs
- All observability infrastructure is configured and typesafe
- Plans 04 (email) and 06+ can proceed independently

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-26*
