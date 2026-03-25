# Deferred Items

## Pre-existing Lint Failures (out of scope for Plan 03)

These lint errors exist in Plan 02 files and are not caused by Plan 03 changes:

### @repo/api lint errors (from commit fe28d42 / 5346c0e)
- `apps/api/src/plugins/clerk.ts:27` — `Unexpected any` (`sessionClaims as any`)
- `apps/api/src/routes/health/index.ts:16` — `Unexpected any` (`sessionClaims as any`)
- `apps/api/src/routes/webhooks/clerk.ts:32` — `_err is defined but never used`
- Additional `no-explicit-any` errors in webhooks/clerk.ts

### @repo/mobile lint errors (from commit 5346c0e)
- `apps/mobile/app/(auth)/sign-in.tsx:21` — `Unexpected any`
- `apps/mobile/app/(auth)/sign-up.tsx:21` — `Unexpected any`

These should be addressed in a dedicated lint cleanup plan or at the start of the next phase.
