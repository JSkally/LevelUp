---
phase: 01-foundation-auth
plan: 02
subsystem: authentication
tags: [clerk, fastify, nextjs, expo, jwt, rbac, webhooks, svix]
dependency_graph:
  requires:
    - 01-01 (monorepo scaffold, shared schemas, Fastify skeleton)
  provides:
    - clerkPlugin + authenticate decorator + requireRole preHandler factory (apps/api/src/plugins/clerk.ts)
    - GET /api/health (public) + GET /api/health/protected (auth-gated) (apps/api/src/routes/health/index.ts)
    - POST /api/webhooks/clerk with svix verification + role assignment (apps/api/src/routes/webhooks/clerk.ts)
    - Web sign-in/sign-up pages via @clerk/nextjs SignIn/SignUp components
    - clerkMiddleware() protecting all non-public web routes
    - checkRole() and requireRole() helpers for server components
    - Mobile ClerkProvider with expo-secure-store tokenCache for JWT persistence
    - Mobile auth screens using @clerk/expo/legacy hooks
    - Mobile protected layout with useAuth() redirect enforcement
  affects:
    - 01-03 (tier gate plan builds on authenticate + requireRole decorators)
    - All API routes in subsequent phases require authenticate preHandler
tech_stack:
  added:
    - "@clerk/fastify@^2 (clerkPlugin, getAuth, clerkClient)"
    - "svix@^1 (Webhook signature verification)"
    - "@clerk/nextjs@^6 (ClerkProvider, clerkMiddleware, SignIn, SignUp, auth())"
    - "@clerk/expo@^2 (ClerkProvider, useAuth, useUser)"
    - "@clerk/expo/legacy (useSignIn, useSignUp with stable isLoaded/setActive API)"
    - "expo-secure-store@^14 (tokenCache for JWT persistence across app restarts)"
  patterns:
    - Fastify fastify-plugin wrapping for Clerk auth with typed decorators (authenticate, requireRole)
    - Role extracted from sessionClaims.metadata.role (JWT claim) — no per-request Clerk API call
    - svix Webhook.verify() for webhook signature validation before processing
    - clerkMiddleware() + createRouteMatcher for Next.js route protection (Pattern 3)
    - expo-secure-store tokenCache pattern for Clerk JWT persistence on mobile
    - Fastify rawBody buffer parsing for svix webhook verification
key_files:
  created:
    - apps/api/src/plugins/clerk.ts
    - apps/api/src/routes/health/index.ts
    - apps/api/src/routes/webhooks/clerk.ts
    - apps/web/app/layout.tsx
    - apps/web/middleware.ts
    - apps/web/lib/auth.ts
    - apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx
    - apps/web/app/(auth)/sign-up/[[...sign-up]]/page.tsx
    - apps/web/app/(protected)/layout.tsx
    - apps/web/app/(protected)/dashboard/page.tsx
    - apps/mobile/app/_layout.tsx
    - apps/mobile/app/(auth)/_layout.tsx
    - apps/mobile/app/(auth)/sign-in.tsx
    - apps/mobile/app/(auth)/sign-up.tsx
    - apps/mobile/app/(protected)/_layout.tsx
    - apps/mobile/app/(protected)/index.tsx
  modified:
    - apps/api/src/__tests__/auth.test.ts (filled in stubs with real tests)
    - apps/api/src/__tests__/webhooks.test.ts (filled in stubs with real tests)
    - apps/mobile/tsconfig.json (moduleResolution: bundler for @clerk/expo subpath exports)
decisions:
  - "@clerk/expo v2 exports signals-based useSignIn from @clerk/react — stable isLoaded/setActive API requires @clerk/expo/legacy import"
  - "Mobile tsconfig moduleResolution changed from node to bundler to support @clerk/expo/legacy subpath export"
  - "Fastify rawBody parsing uses buffer content-type parser so svix.Webhook.verify() receives raw bytes for HMAC validation"
  - "Role stored in sessionClaims.metadata.role (JWT claim configured via Clerk Dashboard Sessions > Customize session token) — avoids per-request Clerk API call"
metrics:
  duration: "~4 minutes"
  completed: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 16
  files_modified: 3
---

# Phase 1 Plan 02: Auth Pipeline Summary

**One-liner:** Full Clerk authentication pipeline across Fastify API (JWT verification + role enforcement + svix webhook handler), Next.js 15 web (clerkMiddleware + sign-in/sign-up/protected routes), and Expo mobile (ClerkProvider with expo-secure-store tokenCache + hooks-based auth screens).

## What Was Built

Complete authentication pipeline connecting all three apps to Clerk:

1. **Task 1: Fastify auth plugins (TDD)** — `clerkPlugin` registered as fastify-plugin; `authenticate` decorator returns 401 for missing userId; `requireRole(allowedRoles[])` preHandler factory returns 403 with `{ error: 'Forbidden', required }` when role not in allowedRoles; GET /api/health (public) and GET /api/health/protected (auth-gated); POST /api/webhooks/clerk with svix signature verification + `clerkClient.users.updateUser` assigning `{ role: 'athlete' }` on `user.created`.

2. **Task 2: Web and mobile integration** — Next.js root layout wraps children in `<ClerkProvider>`; `clerkMiddleware()` with `createRouteMatcher` protects all non-public routes; `checkRole()` and `requireRole()` server helpers use `auth().sessionClaims.metadata.role`; sign-in/sign-up pages use Clerk components; protected layout server-redirects unauthenticated users; Expo root layout provides `ClerkProvider` with `expo-secure-store` tokenCache for JWT persistence; mobile auth screens use `@clerk/expo/legacy` hooks with stable `isLoaded`/`setActive` API; protected layout enforces `isSignedIn` via `useAuth()`.

## Verification Results

- `pnpm turbo run test --filter=@repo/api`: 5/5 tests pass (2 auth, 2 webhook, 3 todo tier-gate stubs)
- `pnpm turbo run typecheck --filter=@repo/web`: PASS
- `pnpm turbo run typecheck --filter=@repo/mobile`: PASS
- Fastify: 401 for no userId, 200 with userId+role, 403 for wrong role — all verified by tests
- Webhook: svix verify → updateUser called with `{ publicMetadata: { role: 'athlete' } }`, invalid sig → 400 — verified by tests

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Fastify test: route registration after `fastify.ready()`**
- **Found during:** Task 1 GREEN phase (second test run)
- **Issue:** Test attempted `fastify.post('/api/programs', ...)` after `fastify.ready()` → `FastifyError: Fastify instance is already listening. Cannot add route!`
- **Fix:** Restructured third auth test to build its own Fastify instance and register the programs route before calling `ready()`
- **Files modified:** `apps/api/src/__tests__/auth.test.ts`
- **Commit:** fe28d42

**2. [Rule 1 - Bug] @clerk/expo v2 useSignIn returns signals-based API, not classic API**
- **Found during:** Task 2 typecheck
- **Issue:** `@clerk/expo` v2 re-exports `useSignIn` from `@clerk/react` which returns `SignInSignalValue` (no `isLoaded`, `setActive`, or `signIn.create({ password })`)
- **Fix:** Changed import to `@clerk/expo/legacy` which exports the stable `UseSignInReturn` with `isLoaded`, `setActive`, and `signIn.create({ identifier, password })`
- **Files modified:** `apps/mobile/app/(auth)/sign-in.tsx`, `apps/mobile/app/(auth)/sign-up.tsx`
- **Commit:** 5346c0e

**3. [Rule 1 - Bug] Mobile tsconfig moduleResolution incompatible with @clerk/expo/legacy subpath**
- **Found during:** Task 2 typecheck (after fixing Bug 2)
- **Issue:** `expo/tsconfig.base` uses `moduleResolution: node` which cannot resolve package.json `exports` subpaths like `@clerk/expo/legacy`
- **Fix:** Added `"moduleResolution": "bundler"` to `apps/mobile/tsconfig.json` compilerOptions (overriding expo base)
- **Files modified:** `apps/mobile/tsconfig.json`
- **Commit:** 5346c0e

### Out-of-Scope Discovery (Deferred)

`@repo/web#test` fails because the web package has a `vitest run` script but no vitest test files (only playwright.config.ts). This was introduced in Plan 01 scaffold and is not caused by Plan 02 changes. Logged to deferred-items.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| apps/api/src/plugins/clerk.ts | FOUND |
| apps/api/src/routes/health/index.ts | FOUND |
| apps/api/src/routes/webhooks/clerk.ts | FOUND |
| apps/web/app/layout.tsx | FOUND |
| apps/web/middleware.ts | FOUND |
| apps/web/lib/auth.ts | FOUND |
| apps/mobile/app/_layout.tsx | FOUND |
| apps/mobile/app/(auth)/sign-in.tsx | FOUND |
| apps/mobile/app/(protected)/_layout.tsx | FOUND |
| Task 1 commit fe28d42 | VERIFIED |
| Task 2 commit 5346c0e | VERIFIED |
| pnpm turbo run test --filter=@repo/api | 5/5 PASS |
| pnpm turbo run typecheck --filter=@repo/web | PASS |
| pnpm turbo run typecheck --filter=@repo/mobile | PASS |
