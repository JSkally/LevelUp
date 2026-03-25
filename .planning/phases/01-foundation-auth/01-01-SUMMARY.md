---
phase: 01-foundation-auth
plan: 01
subsystem: monorepo-infrastructure
tags: [turborepo, pnpm, drizzle, fastify, nextjs, expo, ci, docker]
dependency_graph:
  requires: []
  provides:
    - pnpm-workspace with apps/* and packages/*
    - packages/shared Zod schemas (UserRole, TierCapabilities, DEFAULT_TIERS)
    - packages/db Drizzle schema (users, subscriptionTiers) + createDb() factory
    - apps/api Fastify v5 server skeleton (db + redis plugins, autoload routes)
    - apps/web Next.js 15.2.3 skeleton
    - apps/mobile Expo SDK 52 skeleton
    - docker-compose.yml (TimescaleDB pg16 + Redis 7)
    - .github/workflows/ci.yml + eas-build.yml
    - Wave 0 test stub files (7 files)
  affects:
    - 01-02 (auth plan depends on this monorepo structure)
    - 01-03 (tiers plan depends on shared schemas)
    - All subsequent phases
tech_stack:
  added:
    - turbo@^2 (build orchestration)
    - pnpm@9 workspaces (node-linker=hoisted for Expo compatibility)
    - typescript@^5 (strict, ES2022, NodeNext)
    - drizzle-orm@0.41.0 + drizzle-kit@^0.31
    - fastify@^5 + fastify-plugin@^5 + @fastify/autoload@^6
    - "@sentry/node@^9"
    - ioredis@^5
    - zod@^3.22.4
    - next@15.2.3 (CVE-2025-29927 patched)
    - expo@~52.0.0 (SDK 52 monorepo auto-detection)
    - vitest@^2 + @vitest/coverage-v8
    - "@playwright/test@^1.40"
    - eslint@^8 + @typescript-eslint/*
  patterns:
    - Turborepo task graph (build → ^build, typecheck → ^build, lint standalone, test → ^build)
    - GIN index on JSONB capabilities column using index().using('gin', ...)
    - Drizzle workspace:* dependency sharing between packages/db and apps/api
    - Fastify fastify-plugin wrapping for db and redis decorators
key_files:
  created:
    - turbo.json
    - pnpm-workspace.yaml
    - .npmrc
    - package.json
    - tsconfig.base.json
    - .eslintrc.js
    - .prettierrc
    - .gitignore
    - docker-compose.yml
    - .env.example
    - vitest.config.ts
    - packages/shared/src/schemas/user.ts
    - packages/shared/src/schemas/tiers.ts
    - packages/shared/src/index.ts
    - packages/db/src/schema/tiers.ts
    - packages/db/src/schema/users.ts
    - packages/db/src/schema/index.ts
    - packages/db/src/index.ts
    - packages/db/drizzle.config.ts
    - apps/api/src/instrument.ts
    - apps/api/src/server.ts
    - apps/api/src/plugins/db.ts
    - apps/api/src/plugins/redis.ts
    - apps/api/Dockerfile
    - apps/web/next.config.ts
    - apps/mobile/app/index.tsx
    - .github/workflows/ci.yml
    - .github/workflows/eas-build.yml
    - packages/db/src/__tests__/schema.test.ts
    - packages/shared/src/__tests__/user.test.ts
    - packages/shared/src/__tests__/tiers.test.ts
    - apps/api/src/__tests__/auth.test.ts
    - apps/api/src/__tests__/tier-gate.test.ts
    - apps/api/src/__tests__/webhooks.test.ts
    - apps/web/playwright.config.ts
  modified: []
decisions:
  - "node-linker=hoisted in .npmrc required for Expo SDK 52 native module compatibility"
  - "GIN index on subscriptionTiers.capabilities uses table-level index().using('gin', column) — column-level .on() fails for jsonb in drizzle-orm 0.41.0"
  - "rootDir omitted from tsconfig in packages/db and apps/api — workspace boundary imports cross rootDir constraint"
  - "next@15.2.3 pinned to patch CVE-2025-29927 (auth bypass in middleware)"
  - "react 18.3.1 and react-native 0.76.7 pinned in pnpm.overrides to prevent duplicate React versions"
metrics:
  duration: "~7 minutes"
  completed: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 36
  files_modified: 3
---

# Phase 1 Plan 01: Monorepo Scaffold Summary

**One-liner:** Turborepo + pnpm monorepo with 5 workspaces, Drizzle schema (users + subscriptionTiers with GIN-indexed JSONB capabilities), Fastify v5 API skeleton, Next.js 15.2.3 web, Expo SDK 52 mobile, Docker Compose dev env, GitHub Actions CI, and 7 Wave 0 test stubs.

## What Was Built

Complete monorepo foundation from an empty repository:

1. **Task 1: Monorepo scaffold** — All 5 workspaces (web, mobile, api, db, shared), root tooling config (turbo.json, .npmrc, tsconfig.base.json, eslint, prettier), Drizzle schema with users and subscriptionTiers tables, createDb() factory, Fastify v5 server with instrument.ts Sentry hook, db and redis plugins, Docker Compose with TimescaleDB pg16 + Redis 7.

2. **Task 2: CI/CD and test stubs** — GitHub Actions CI workflow (lint + typecheck + test + build on every push), EAS Build workflow (mobile changes to main), root vitest.config.ts, all 7 Wave 0 stub files (schema.test.ts with 2 passing tests, user.test.ts + tiers.test.ts with 7 passing tests, 3 API stub files with 8 todos, playwright.config.ts).

## Verification Results

- `pnpm install`: Succeeded, 1403 packages across 5 workspaces
- `pnpm turbo run typecheck`: 5/5 workspaces pass
- `pnpm turbo run lint`: 5/5 workspaces pass (10 tasks total)
- `pnpm turbo run test --filter=@repo/shared`: 7/7 tests pass
- `pnpm turbo run test --filter=@repo/db`: 2/2 tests pass
- GitHub Actions YAML: Syntactically valid (ci.yml + eas-build.yml)
- docker-compose.yml: Valid YAML, services: db + redis + api

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed GIN index syntax for JSONB column in drizzle-orm 0.41.0**
- **Found during:** Task 2 (test run)
- **Issue:** `index('capabilities_gin_idx').on(subscriptionTiers.capabilities)` throws `SyntaxError: "undefined" is not valid JSON` — column-level `.on()` fails when the jsonb column's SQL toString() returns undefined
- **Fix:** Moved index to table-level third argument using `index('capabilities_gin_idx').using('gin', table.capabilities)` pattern
- **Files modified:** `packages/db/src/schema/tiers.ts`
- **Commit:** 4050a55

**2. [Rule 1 - Bug] Removed rootDir from cross-workspace tsconfigs**
- **Found during:** Task 1 (first typecheck run)
- **Issue:** TypeScript's rootDir constraint rejects files from external workspace packages (e.g., `packages/shared/src/*` is "not under rootDir" when rootDir is `apps/api/src`)
- **Fix:** Removed `rootDir` from `packages/db/tsconfig.json` and `apps/api/tsconfig.json`; workspace cross-package imports work via path aliases in compilerOptions
- **Files modified:** `packages/db/tsconfig.json`, `apps/api/tsconfig.json`
- **Commit:** 808b57f (pre-task-commit fix)

**3. [Rule 1 - Bug] Removed invalid instrumentationHook from Next.js 15 config**
- **Found during:** Task 1 (web typecheck)
- **Issue:** `experimentalConfig.instrumentationHook` was removed in Next.js 15 — `tsc` reports "Object literal may only specify known properties"
- **Fix:** Removed the `experimental.instrumentationHook` property from `apps/web/next.config.ts`; Sentry instrumentation will be wired in Plan 02
- **Files modified:** `apps/web/next.config.ts`
- **Commit:** 808b57f (pre-task-commit fix)

**4. [Rule 2 - Missing] Added drizzle.config.ts exclusion and mobile placeholder**
- **Found during:** Task 1 verification
- **Issue 1:** drizzle.config.ts was inside tsconfig include paths but outside rootDir causing TS6059
- **Issue 2:** Mobile workspace had no TypeScript source files, causing TS18003 (no inputs found)
- **Fix:** Removed drizzle.config.ts from tsconfig include; created minimal `apps/mobile/app/index.tsx` placeholder
- **Files modified/created:** `packages/db/tsconfig.json`, `apps/mobile/app/index.tsx`

## Self-Check: PASSED

All 15 required files found. Both task commits verified (808b57f, 4050a55).

| Check | Result |
|-------|--------|
| turbo.json | FOUND |
| pnpm-workspace.yaml | FOUND |
| .npmrc (node-linker=hoisted) | FOUND |
| packages/db/src/index.ts (createDb export) | FOUND |
| packages/shared/src/index.ts | FOUND |
| docker-compose.yml | FOUND |
| .github/workflows/ci.yml | FOUND |
| vitest.config.ts | FOUND |
| apps/web/playwright.config.ts | FOUND |
| 7 Wave 0 test stub files | ALL FOUND |
| Task 1 commit 808b57f | VERIFIED |
| Task 2 commit 4050a55 | VERIFIED |
| pnpm turbo run typecheck | 5/5 PASS |
| pnpm turbo run lint | 5/5 PASS |
| pnpm turbo run test --filter=@repo/shared --filter=@repo/db | 9/9 PASS |
