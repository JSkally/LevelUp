# Phase 1: Foundation & Auth - Research

**Researched:** 2026-03-24
**Domain:** Turborepo monorepo, Clerk auth, Drizzle ORM, Fastify v5, Next.js 15, Expo SDK 52+, JSONB tier gating, GitHub Actions CI
**Confidence:** HIGH (primary stack has strong official docs coverage; JSONB tier pattern is MEDIUM)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Monorepo with Turborepo + pnpm workspaces (apps/web, apps/mobile, apps/api, packages/db, packages/shared) | Turborepo official docs + Expo SDK 52 monorepo auto-detection; pnpm hoisting required |
| INFRA-02 | Shared Drizzle ORM schema in `packages/db` consumed by API and type-safe clients | Drizzle monorepo sharing pattern documented; workspace:* dependency linkage |
| INFRA-03 | Shared Zod validators and TypeScript types in `packages/shared` | Standard Zod monorepo pattern; drizzle-zod for schema-derived validators |
| INFRA-04 | CI/CD pipeline via GitHub Actions (lint, type-check, test, build, deploy) | Turborepo CI docs; pnpm/action-setup + actions/setup-node caching |
| INFRA-05 | Docker + AWS ECS Fargate deployment with Cloudflare CDN | Docker Compose dev environment with TimescaleDB + Redis images |
| INFRA-06 | Sentry error monitoring + Grafana Cloud observability | @sentry/nextjs wizard + @sentry/node for Fastify; instrument.js pattern |
| INFRA-07 | Expo EAS (Build + Update) for mobile deployment | expo/expo-github-action@v8 with EXPO_TOKEN secret |
| AUTH-01 | User register with email/password via Clerk | @clerk/nextjs + @clerk/expo + @clerk/fastify SDKs |
| AUTH-02 | User log in and maintain authenticated session across web and mobile | expo-secure-store for token persistence; clerkMiddleware for web |
| AUTH-03 | User can reset password via email link | Built into Clerk dashboard; no custom implementation needed |
| AUTH-04 | JWT tokens validated at API middleware with role claims embedded | clerkPlugin + getAuth() in Fastify; publicMetadata.role in custom JWT claims |
| AUTH-05 | Role assigned at registration or by admin: Athlete, Trainer, Admin, Assistant Coach | Clerk publicMetadata role field; webhook or server-action on sign-up |
| AUTH-06 | Admin can promote/demote user roles from management dashboard | Clerk Backend SDK updateUser() to set publicMetadata; custom admin UI |
| AUTH-07 | Assistant Coach sub-role view/log on behalf of athletes; cannot create programs | Role-based middleware check; permission enum in publicMetadata |
| TIER-01 | Subscription tiers stored as JSONB capability map in subscription_tiers table | Drizzle jsonb() column type; GIN index on capabilities |
| TIER-02 | Feature gating at API middleware (hard 403 with machine-readable upgrade context) | Fastify preHandler hook reads tier from user record; structured 403 response |
| TIER-03 | Feature gating at UI layer (soft gate showing locked state with upgrade prompt) | Client-side tier check hook; context propagated from Clerk session claims |
| TIER-04 | Admin configures tier capabilities via visual tier editor without schema migrations | JSONB enables in-place key updates; admin UI writes to subscription_tiers table |
| TIER-05 | Tier-gated features list (messaging, VBT, analytics, etc.) | Capability keys defined in shared types; checked at middleware and UI |
| TIER-06 | Caribbean currency display (JMD, TTD, BBD, GYD, BSD, XCD with USD base) | Intl.NumberFormat currency support; exchange rate storage in tiers or config |
</phase_requirements>

---

## Summary

Phase 1 establishes the complete foundation that all subsequent phases depend on: a working Turborepo + pnpm monorepo with Next.js 15, Expo SDK 52+, and Fastify v5; Clerk authentication flowing through all three apps; Drizzle ORM connected to PostgreSQL 16 + TimescaleDB via a shared `packages/db`; a JSONB-based subscription tier system; and a passing CI pipeline.

The stack is well-supported by official documentation. The largest practical risks are (1) pnpm + Expo SDK 52 package resolution requiring `.npmrc` hoisting configuration, (2) the Next.js 15 middleware security vulnerability (CVE-2025-29927) requiring version 15.2.3+, and (3) Clerk JWT custom claims for roles requiring explicit Dashboard configuration before API middleware will have role data. None of these are blockers — all have known fixes.

The JSONB capability-map pattern for subscription tiers (TIER-01 through TIER-06) is a deliberate architectural choice that trades query simplicity for schema flexibility. It is the right call for this project because new tier features must never require migrations. The implementation is straightforward but requires careful Drizzle type declarations and GIN indexing.

**Primary recommendation:** Wire the entire auth pipeline first (registration → role assignment → JWT claim → Fastify verification → tier gate) as a single vertical slice before expanding to full UI. This proves the end-to-end pipeline and surfaces integration issues early.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| turborepo | ^2.x | Monorepo build orchestration, caching | Official Vercel product; first-class pnpm support |
| pnpm | ^9.x | Package manager with workspace support | Faster installs, disk efficiency, isolated deps |
| next | 15.2.3+ | Web app (App Router, RSC, middleware) | Locked in requirements; 15.2.3 patches CVE-2025-29927 |
| expo | SDK 52+ | React Native mobile app | Locked; SDK 52 adds monorepo auto-detection |
| fastify | ^5.x | API server | Locked; v5 drops callback/promise mixing |
| @clerk/nextjs | ^6.x | Clerk SDK for Next.js App Router | Official SDK; provides clerkMiddleware, auth(), currentUser() |
| @clerk/expo | ^2.x | Clerk SDK for Expo | Official SDK; uses expo-secure-store for token persistence |
| @clerk/fastify | ^2.x | Clerk SDK for Fastify | Official SDK; provides clerkPlugin, getAuth() |
| drizzle-orm | ^0.41+ | Type-safe ORM | Locked; zero code-gen, direct SQL, Zod integration |
| drizzle-kit | ^0.31+ | Migration tooling for Drizzle | Companion to drizzle-orm; generate + migrate commands |
| drizzle-zod | bundled in drizzle-orm ^0.41 | Generate Zod schemas from Drizzle tables | Moved into drizzle-orm repo in 2025 |
| postgres (pg driver) | ^3.x | PostgreSQL connection (node-postgres) | Standard pg driver; drizzle-orm/node-postgres |
| zod | ^3.x | Runtime validation + type inference | Locked in packages/shared; composable with Drizzle |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-secure-store | ^14.x | Encrypted token storage on device | Required for Clerk tokenCache in Expo |
| expo-auth-session | ^6.x | OAuth flows in Expo | When social auth providers are needed |
| expo-web-browser | ^14.x | OAuth redirect handling | Paired with expo-auth-session |
| @fastify/autoload | ^6.x | Auto-load route plugins from directory | Route organization at scale |
| @sentry/nextjs | ^9.x | Sentry for Next.js (client + server + edge) | Phase 1 observability requirement |
| @sentry/node | ^9.x | Sentry for Fastify/Node.js | Import as instrument.js before Fastify init |
| timescaledb | 2.x (Docker) | Time-series extension on PostgreSQL | Already part of timescale/timescaledb Docker image |
| redis | ^4.x (ioredis) | Cache, pub/sub | Phase 1: basic connection; used heavily in Phase 6 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Clerk | Auth.js (NextAuth) | Clerk handles mobile SDKs natively; Auth.js requires custom Expo integration |
| Drizzle ORM | Prisma | Drizzle has lighter footprint, direct SQL escape hatches, faster type generation |
| Fastify v5 | Express / Hono | Fastify is faster, has plugin system, official Clerk SDK support |
| pnpm workspaces | Yarn Berry | pnpm is faster, better disk usage; hoisting is simpler to configure |

**Installation:**
```bash
# Root
pnpm add -D turbo typescript @types/node eslint prettier

# apps/web
pnpm add next@15.2.3 react react-dom @clerk/nextjs @sentry/nextjs

# apps/mobile
pnpm add expo@~52.0.0 @clerk/expo expo-secure-store expo-auth-session expo-web-browser

# apps/api
pnpm add fastify @clerk/fastify @fastify/autoload @sentry/node drizzle-orm postgres ioredis

# packages/db
pnpm add drizzle-orm postgres zod
pnpm add -D drizzle-kit

# packages/shared
pnpm add zod
```

---

## Architecture Patterns

### Recommended Project Structure

```
LevelUP/
├── apps/
│   ├── web/                    # Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── (auth)/         # Clerk sign-in/sign-up routes
│   │   │   ├── (protected)/    # Role-gated app routes
│   │   │   └── layout.tsx      # ClerkProvider wrapper
│   │   ├── middleware.ts        # clerkMiddleware() + route matchers
│   │   └── next.config.ts
│   ├── mobile/                 # Expo SDK 52+
│   │   ├── app/                # Expo Router file-based routing
│   │   │   ├── (auth)/
│   │   │   └── (protected)/
│   │   └── app.json
│   └── api/                    # Fastify v5
│       ├── src/
│       │   ├── instrument.ts   # Sentry init (must be first import)
│       │   ├── server.ts       # Fastify build + register plugins
│       │   ├── plugins/
│       │   │   ├── clerk.ts    # clerkPlugin registration
│       │   │   ├── db.ts       # Drizzle connection plugin
│       │   │   └── redis.ts    # Redis connection plugin
│       │   └── routes/
│       │       ├── auth/       # Clerk webhook handlers
│       │       └── health/     # Health + tier-gate demo route
│       └── Dockerfile
├── packages/
│   ├── db/                     # Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts
│   │   │   │   ├── tiers.ts
│   │   │   │   └── index.ts    # Re-exports all tables
│   │   │   └── index.ts        # db client factory
│   │   ├── migrations/
│   │   └── drizzle.config.ts
│   └── shared/                 # Zod schemas + TypeScript types
│       └── src/
│           ├── schemas/
│           │   ├── user.ts     # UserRole enum, user validators
│           │   └── tiers.ts    # TierCapability type, tier validators
│           └── index.ts
├── turbo.json
├── pnpm-workspace.yaml
├── .npmrc                      # node-linker=hoisted (required for Expo)
└── package.json
```

### Pattern 1: Turborepo Pipeline Configuration

**What:** Defines task dependency graph so Turborepo knows build order and what to cache.
**When to use:** Always. Without this, turbo runs tasks in wrong order.
**Example:**
```json
// turbo.json
// Source: https://turborepo.dev/docs/guides/ci-vendors/github-actions
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL", "CLERK_SECRET_KEY"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Pattern 2: pnpm Workspace + Expo Compatibility

**What:** `.npmrc` with hoisted linker prevents native module resolution failures in Expo SDK 52+.
**When to use:** Any monorepo with Expo. Without this, native builds fail with missing module errors.
**Example:**
```ini
# .npmrc — REQUIRED for React Native / Expo in pnpm monorepo
# Source: https://docs.expo.dev/guides/monorepos/
node-linker=hoisted
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Pattern 3: Clerk Integration — Next.js 15 App Router

**What:** Middleware wraps entire app; Server Components use `auth()` and `currentUser()`.
**When to use:** Every Next.js route that requires authentication or role checking.
**Example:**
```typescript
// apps/web/middleware.ts
// Source: https://clerk.com/docs/nextjs/getting-started/quickstart
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

```typescript
// Role check helper
// Source: https://clerk.com/docs/guides/secure/basic-rbac
import { auth } from '@clerk/nextjs/server'
import type { UserRole } from '@repo/shared'

export const checkRole = async (role: UserRole) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role === role
}
```

### Pattern 4: Clerk Integration — Fastify v5

**What:** `clerkPlugin` attaches auth state to every request; preHandler hooks enforce auth/roles.
**When to use:** All protected Fastify routes. Register at app level, not per-route.
**Example:**
```typescript
// apps/api/src/plugins/clerk.ts
// Source: https://clerk.com/docs/fastify/getting-started/quickstart
import fp from 'fastify-plugin'
import { clerkPlugin, getAuth } from '@clerk/fastify'

export default fp(async (fastify) => {
  fastify.register(clerkPlugin)

  // Decorate with auth guard
  fastify.decorate('authenticate', async (request, reply) => {
    const { userId } = getAuth(request)
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
  })
})

// Usage in route
fastify.get('/protected', {
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    const { userId, sessionClaims } = getAuth(request)
    const role = sessionClaims?.metadata?.role
    return { userId, role }
  }
})
```

### Pattern 5: Clerk Role Assignment on Sign-Up (Webhook)

**What:** Clerk sends a `user.created` webhook; API sets default role in publicMetadata.
**When to use:** AUTH-05 — role must be assigned at registration time.
**Example:**
```typescript
// apps/api/src/routes/webhooks/clerk.ts
import { clerkClient } from '@clerk/fastify'
import { Webhook } from 'svix'

fastify.post('/api/webhooks/clerk', async (request, reply) => {
  // Verify svix signature
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const event = wh.verify(request.rawBody, request.headers as any)

  if (event.type === 'user.created') {
    await clerkClient.users.updateUser(event.data.id, {
      publicMetadata: { role: 'athlete' } // Default role
    })
  }
  return reply.send({ received: true })
})
```

### Pattern 6: Clerk Custom JWT Claims for Role

**What:** Adds `metadata` containing role to the session token so API middleware can read it without a Clerk API call.
**When to use:** Required for AUTH-04 — role in JWT so Fastify middleware is stateless.
**Configuration (Clerk Dashboard):**
```json
// Sessions → Customize session token → Claims editor
// Source: https://clerk.com/docs/guides/sessions/session-tokens
{
  "metadata": "{{user.public_metadata}}"
}
```
After this, `getAuth(request).sessionClaims.metadata.role` is available in Fastify.

**Important:** Metadata changes don't appear in the JWT until the next token refresh (60-second default TTL). After admin changes a role, client must refresh token.

### Pattern 7: Drizzle ORM — packages/db Setup

**What:** Central schema package imported by API (and potentially web server actions).
**When to use:** Any table definition or query. Never define schema in app packages.
**Example:**
```typescript
// packages/db/src/schema/tiers.ts
// Source: https://orm.drizzle.team/docs/sql-schema-declaration
import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import type { TierCapabilities } from '@repo/shared'

export const subscriptionTiers = pgTable('subscription_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),              // 'base', 'pro', 'elite'
  capabilities: jsonb('capabilities').$type<TierCapabilities>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),       // Clerk user ID
  role: text('role').notNull().default('athlete'),    // Mirrors Clerk publicMetadata
  tierId: uuid('tier_id').references(() => subscriptionTiers.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

```typescript
// packages/db/src/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const createDb = (connectionString: string) => {
  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
  return drizzle(pool, { schema })
}

export * from './schema'
export type { TierCapabilities } from '@repo/shared'
```

### Pattern 8: JSONB Tier Capability Map

**What:** Tier capabilities stored as a typed JSONB object; API middleware checks the relevant key.
**When to use:** TIER-01 through TIER-05. Enables adding new feature gates without migrations.
**Example:**
```typescript
// packages/shared/src/schemas/tiers.ts
import { z } from 'zod'

export const TierCapabilitiesSchema = z.object({
  messaging: z.boolean(),
  vbt: z.boolean(),
  analyticsDepth: z.enum(['basic', 'advanced', 'full']),
  programTemplates: z.boolean(),
  readinessEngine: z.boolean(),
  multiModalityTracking: z.boolean(),
  sportSpecificAssessments: z.boolean(),
  maxAthletes: z.number().int().positive().or(z.literal(-1)), // -1 = unlimited
})

export type TierCapabilities = z.infer<typeof TierCapabilitiesSchema>

// Default tier seeds
export const DEFAULT_TIERS: Record<string, TierCapabilities> = {
  base: {
    messaging: false, vbt: false, analyticsDepth: 'basic',
    programTemplates: false, readinessEngine: false,
    multiModalityTracking: false, sportSpecificAssessments: false,
    maxAthletes: 5,
  },
  pro: {
    messaging: true, vbt: false, analyticsDepth: 'advanced',
    programTemplates: true, readinessEngine: true,
    multiModalityTracking: true, sportSpecificAssessments: false,
    maxAthletes: 50,
  },
  elite: {
    messaging: true, vbt: true, analyticsDepth: 'full',
    programTemplates: true, readinessEngine: true,
    multiModalityTracking: true, sportSpecificAssessments: true,
    maxAthletes: -1,
  },
}
```

```typescript
// apps/api/src/plugins/tierGate.ts — Fastify preHandler factory
import { getAuth } from '@clerk/fastify'

export const requireTierCapability = (capability: keyof TierCapabilities) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuth(request)
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' })

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      with: { tier: true }
    })

    const caps = user?.tier?.capabilities as TierCapabilities | null
    if (!caps?.[capability]) {
      return reply.status(403).send({
        error: 'TIER_GATE',
        requiredCapability: capability,
        currentTier: user?.tier?.name ?? 'none',
        upgradeUrl: '/upgrade',
      })
    }
  }
}
```

### Pattern 9: Fastify v5 Plugin Architecture

**What:** Each domain is a plugin registered with a prefix; Fastify encapsulates scope per plugin.
**When to use:** All route organization. Do NOT mix callback/promise in v5.
**Example:**
```typescript
// apps/api/src/server.ts
import Fastify from 'fastify'
import autoLoad from '@fastify/autoload'
import { join } from 'path'

// instrument.ts must be imported BEFORE this file
export const buildServer = async () => {
  const fastify = Fastify({ logger: true })

  await fastify.register(import('./plugins/clerk'))
  await fastify.register(import('./plugins/db'))
  await fastify.register(autoLoad, {
    dir: join(__dirname, 'routes'),
    options: { prefix: '/api' }
  })

  return fastify
}
```

### Pattern 10: GitHub Actions CI Pipeline

**What:** Runs lint, typecheck, test, build on every push via Turborepo.
**When to use:** INFRA-04. Required for CI.
**Example:**
```yaml
# .github/workflows/ci.yml
# Source: https://turborepo.dev/docs/guides/ci-vendors/github-actions
name: CI
on: [push, pull_request]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Lint + Typecheck + Test + Build
        run: pnpm turbo run lint typecheck test build
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

```yaml
# .github/workflows/eas-build.yml
# Source: https://docs.expo.dev/build/building-on-ci/
name: EAS Build
on:
  push:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - 'packages/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: pnpm install --frozen-lockfile
      - run: eas build --platform all --non-interactive
        working-directory: apps/mobile
```

### Anti-Patterns to Avoid

- **Defining Drizzle schema in apps/api instead of packages/db:** Breaks type sharing with web server actions; breaks single migration source of truth.
- **Using Clerk's deprecated `authMiddleware()`:** Replaced by `clerkMiddleware()` in @clerk/nextjs v5+. Old pattern breaks in Next.js 15.
- **Storing role only in Clerk publicMetadata without adding to JWT claims:** Fastify middleware would need a Clerk API call per request. Add `metadata` to JWT template in Dashboard.
- **Running `pnpm install` without `node-linker=hoisted` for Expo:** Native module resolution will fail at build time.
- **Using Next.js versions before 15.2.3:** CVE-2025-29927 (CVSS 9.1) allows middleware auth bypass via crafted header.
- **Mixing callback and promise plugin styles in Fastify v5:** Explicitly disallowed, will throw at startup.
- **Importing Sentry after Fastify is initialized:** Sentry instrument.ts must be the first import; otherwise auto-instrumentation misses modules.
- **Embedding large objects in Clerk JWT claims:** Browser cookie limit is 4KB total. Only embed role and minimal metadata, not full user objects.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User authentication UI | Custom sign-in/sign-up forms | Clerk hosted components or prebuilt | Password hashing, email verification, social OAuth, MFA — all handled |
| Session management | Custom JWT signing/refresh | Clerk SDK | Short-lived JWTs (60s), auto-refresh, device token storage |
| Password reset | Custom email + token flow | Clerk built-in | Email delivery, token expiry, rate limiting already implemented |
| Role storage + propagation | Custom users table with role column only | Clerk publicMetadata + JWT claims | Role must be in JWT for stateless API auth; Clerk handles the claim |
| Migration runner | Custom migration scripts | `drizzle-kit migrate` | Handles __drizzle_migrations table, ordering, idempotency |
| Monorepo task orchestration | Custom Makefiles or shell scripts | Turborepo tasks | Dependency graph, caching, parallel execution |
| Mobile EAS builds | Local Xcode/Android Studio scripts | expo/expo-github-action + EAS | Handles code signing, provisioning profiles, app store submission |

**Key insight:** Clerk's value in this stack is that it covers auth for web (RSC + middleware), mobile (Expo, token persistence), and API (JWT verification) with a single dashboard. Building any piece of this from scratch multiplies maintenance burden across three runtimes.

---

## Common Pitfalls

### Pitfall 1: pnpm Isolated Dependencies Break Expo Native Builds

**What goes wrong:** Native Expo/React Native modules fail to resolve during `eas build` or `expo prebuild` with errors like `Unable to resolve module`.
**Why it happens:** pnpm's default isolated install strategy symlinks packages in ways that native bundlers (Metro, Gradle, Xcode) don't follow correctly.
**How to avoid:** Add `node-linker=hoisted` to `.npmrc` at monorepo root before any `pnpm install`.
**Warning signs:** `Unable to resolve module` errors during Expo build; works in web but fails in mobile.

### Pitfall 2: Clerk Role Not Available in Fastify JWT

**What goes wrong:** `getAuth(request).sessionClaims?.metadata?.role` returns `undefined` even though the user has a role in Clerk.
**Why it happens:** The `metadata` claim is not included in the session token by default. It must be explicitly added in the Clerk Dashboard under Sessions → Customize session token.
**How to avoid:** Configure the Clerk Dashboard JWT template to include `"metadata": "{{user.public_metadata}}"` before implementing any role-based middleware.
**Warning signs:** Role is visible in Clerk Dashboard but undefined in `sessionClaims`; requires Clerk API call to read.

### Pitfall 3: Next.js 15 Middleware Security Vulnerability

**What goes wrong:** CVE-2025-29927 allows attackers to bypass all middleware-based authentication by adding `x-middleware-subrequest` header (CVSS 9.1).
**Why it happens:** Next.js versions 11.1.4 through 15.2.2 improperly trust this internal header from external requests.
**How to avoid:** Use Next.js 15.2.3 or later. Verify version with `next --version` in CI.
**Warning signs:** Any Next.js version < 15.2.3 deployed to production.

### Pitfall 4: Clerk Metadata Changes Don't Propagate Immediately

**What goes wrong:** Admin promotes a user role; user's API requests still show old role.
**Why it happens:** Clerk JWTs have a 60-second TTL. The new role is in publicMetadata but not in the active JWT until next refresh.
**How to avoid:** After role changes, either force a session refresh or design role changes to be eventually consistent (acceptable delay). Document the behavior in the admin UI.
**Warning signs:** Role change applied in Clerk Dashboard but not reflected in API for up to 60 seconds.

### Pitfall 5: Duplicate React / React Native Versions in pnpm Monorepo

**What goes wrong:** Runtime errors like "Invalid hook call" or "Cannot read properties of undefined" in the Expo app.
**Why it happens:** Multiple packages each bring their own React/React Native, and bundler picks the wrong one.
**How to avoid:** Use `pnpm why --depth=10 react-native` to audit before first build. Pin React Native version in root package.json `pnpm.overrides`.
**Warning signs:** Hook errors that only appear in production build, not Expo Go.

### Pitfall 6: Turborepo Shallow Clone Missing Git History

**What goes wrong:** `turbo run --filter=[origin/main]...` (affected-only CI) fails with "could not determine affected packages."
**Why it happens:** `actions/checkout` defaults to `fetch-depth: 1` (shallow), so Turborepo cannot compare against the base branch.
**How to avoid:** Set `fetch-depth: 2` (for push) or `fetch-depth: 0` (for PRs across many commits) in the checkout action.
**Warning signs:** Turborepo runs all tasks instead of only affected packages in CI.

### Pitfall 7: Sentry Initialized Too Late

**What goes wrong:** Database errors and Fastify lifecycle errors are not captured by Sentry.
**Why it happens:** Sentry instruments modules via import hooks; if Sentry initializes after those modules are imported, the hooks are never attached.
**How to avoid:** In `apps/api/src/server.ts`, the very first line must import the instrument file: `import './instrument'`. Never import the DB plugin before Sentry.
**Warning signs:** HTTP 5xx errors visible in logs but not in Sentry; DB errors missing from Sentry traces.

---

## Code Examples

### Docker Compose: Dev Environment

```yaml
# docker-compose.yml
# Source: https://hub.docker.com/r/timescale/timescaledb, https://hub.docker.com/_/redis
version: '3.8'
services:
  db:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_USER: level
      POSTGRES_PASSWORD: level_dev
      POSTGRES_DB: level_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Drizzle Kit Config

```typescript
// packages/db/drizzle.config.ts
// Source: https://orm.drizzle.team/docs/kit-overview
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Shared UserRole Type

```typescript
// packages/shared/src/schemas/user.ts
import { z } from 'zod'

export const UserRoleSchema = z.enum(['athlete', 'trainer', 'admin', 'assistant_coach'])
export type UserRole = z.infer<typeof UserRoleSchema>

// Permission map for AUTH-07
export const ROLE_PERMISSIONS = {
  athlete: ['log_own_workouts', 'view_own_data'],
  trainer: ['log_own_workouts', 'view_own_data', 'create_programs', 'manage_athletes', 'view_athlete_data'],
  assistant_coach: ['log_own_workouts', 'view_own_data', 'log_on_behalf', 'view_athlete_data'],
  admin: ['*'], // all permissions
} as const
```

### Fastify Tier Gate — 403 with Machine-Readable Context

```typescript
// Source: TIER-02 requirement pattern
// apps/api/src/routes/health/tier-test.ts
fastify.get('/api/tier-test/:capability', {
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    const { capability } = request.params as { capability: string }
    const gate = await checkTierCapability(request, capability)
    if (!gate.allowed) {
      return reply.status(403).send({
        error: 'TIER_GATE',
        code: 'UPGRADE_REQUIRED',
        capability,
        currentTier: gate.currentTier,
        requiredTier: gate.requiredTier,
        upgradeUrl: `${process.env.WEB_URL}/upgrade`,
        message: `This feature requires the ${gate.requiredTier} tier.`,
      })
    }
    return reply.send({ allowed: true, capability })
  }
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `authMiddleware()` in @clerk/nextjs | `clerkMiddleware()` with `createRouteMatcher` | @clerk/nextjs v5 (2024) | Old API removed; must migrate |
| Prisma as default ORM | Drizzle ORM becoming standard | 2024-2025 | Lighter, faster type inference, direct SQL |
| Custom metro.config.js for monorepo | Expo SDK 52 auto-detects monorepos | SDK 52 (2024) | No manual Metro config needed |
| serial/bigserial columns in Drizzle | `generatedAlwaysAsIdentity()` | Drizzle 2025 | PostgreSQL best practice for primary keys |
| Turbopack unstable in Next.js | Turbopack stable in Next.js 15 | Next.js 15 (2024) | But Sentry does not yet fully support Turbopack in dev mode |

**Deprecated/outdated:**
- `authMiddleware()` in @clerk/nextjs: Removed in favor of `clerkMiddleware()`.
- `<SignedIn>` / `<SignedOut>` wrappers: Replaced by `auth()` in Server Components and `useAuth()` in Client Components.
- pnpm `public-hoist-pattern` workaround for Expo: Now replaced by `node-linker=hoisted` in SDK 52+.

---

## Open Questions

1. **Turborepo Remote Cache (Vercel) vs GitHub Actions Cache**
   - What we know: Vercel Remote Cache provides cross-machine caching; GitHub Actions cache is per-repo but free.
   - What's unclear: Whether this is a solo/client project with Vercel team account access.
   - Recommendation: Start with GitHub Actions native cache (`actions/cache` on `.turbo`); upgrade to Vercel Remote Cache if CI times become a bottleneck.

2. **Clerk Webhook vs Server Action for Initial Role Assignment**
   - What we know: Webhook requires a public endpoint and `svix` signature verification; server action from a registration flow requires a redirect after sign-up.
   - What's unclear: Whether the registration flow has a server action step where role can be set, or if it's pure Clerk-hosted UI.
   - Recommendation: Use Clerk webhook (`user.created` event) for robustness. This works regardless of which Clerk UI component is used.

3. **TIER-06 Caribbean Currency Exchange Rates**
   - What we know: `Intl.NumberFormat` supports JMD, TTD, BBD etc. display formatting. Exchange rate storage is not yet defined.
   - What's unclear: Whether exchange rates are static seeds or fetched from an external rate API.
   - Recommendation: For Phase 1, seed static reference rates in the `subscription_tiers` table or a `currency_rates` config table. Live rate integration is deferred.

4. **Sentry + Turbopack Compatibility**
   - What we know: Sentry docs note that Turbopack support in dev mode is incomplete as of early 2026.
   - What's unclear: Whether this affects production builds (Webpack-based) or only `next dev --turbo`.
   - Recommendation: Do not use `--turbopack` flag in development until Sentry confirms support. Production builds use Webpack and are unaffected.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (for packages + API) + Playwright (for web E2E) |
| Config file | None yet — Wave 0 gap |
| Quick run command | `pnpm turbo run test` |
| Full suite command | `pnpm turbo run test build typecheck lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Workspace packages resolve correctly | integration | `pnpm turbo run typecheck` | ❌ Wave 0 |
| INFRA-02 | packages/db schema imports in api and web | integration | `pnpm turbo run typecheck` | ❌ Wave 0 |
| INFRA-03 | packages/shared Zod schemas validate | unit | `pnpm test --filter=@repo/shared` | ❌ Wave 0 |
| INFRA-04 | CI pipeline passes | smoke | GitHub Actions run | ❌ Wave 0 |
| INFRA-05 | Docker services healthy | smoke | `docker compose up -d && docker compose ps` | ❌ Wave 0 |
| INFRA-06 | Sentry captures test error | smoke | manual (trigger test error, verify in Sentry) | manual-only |
| INFRA-07 | EAS build succeeds | smoke | `eas build --non-interactive` | ❌ Wave 0 |
| AUTH-01 | User can register | e2e | Playwright: sign-up flow | ❌ Wave 0 |
| AUTH-02 | Session persists across reload | e2e | Playwright: login + refresh | ❌ Wave 0 |
| AUTH-03 | Password reset email sent | manual | Clerk Dashboard verification | manual-only |
| AUTH-04 | API returns 401 without token | unit | `pnpm test --filter=@repo/api -- auth` | ❌ Wave 0 |
| AUTH-05 | New user has default 'athlete' role | integration | webhook handler unit test | ❌ Wave 0 |
| AUTH-06 | Admin role change reflects in JWT | integration | Clerk API mock + handler test | ❌ Wave 0 |
| AUTH-07 | assistant_coach cannot create programs | unit | permission check unit test | ❌ Wave 0 |
| TIER-01 | subscription_tiers table has Base/Pro/Elite | integration | DB seed + query test | ❌ Wave 0 |
| TIER-02 | API returns 403 with TIER_GATE body | unit | `pnpm test --filter=@repo/api -- tier` | ❌ Wave 0 |
| TIER-03 | UI shows locked state for ungated feature | e2e | Playwright: access gated feature | ❌ Wave 0 |
| TIER-04 | Admin updates tier capability without migration | integration | DB update + verify JSON | ❌ Wave 0 |
| TIER-05 | Capability keys present in shared schema | unit | `pnpm test --filter=@repo/shared` | ❌ Wave 0 |
| TIER-06 | JMD/TTD currency displays correctly | unit | Intl.NumberFormat unit test | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm turbo run typecheck lint`
- **Per wave merge:** `pnpm turbo run test typecheck lint build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` at monorepo root — shared test config
- [ ] `packages/shared/src/__tests__/tiers.test.ts` — covers INFRA-03, TIER-05
- [ ] `packages/shared/src/__tests__/user.test.ts` — covers INFRA-03
- [ ] `apps/api/src/__tests__/auth.test.ts` — covers AUTH-04, AUTH-07
- [ ] `apps/api/src/__tests__/tier-gate.test.ts` — covers TIER-02
- [ ] `apps/api/src/__tests__/webhooks.test.ts` — covers AUTH-05
- [ ] `packages/db/src/__tests__/schema.test.ts` — covers INFRA-02, TIER-01
- [ ] Playwright config: `apps/web/playwright.config.ts` — covers AUTH-01, AUTH-02, TIER-03
- [ ] Framework installs: `pnpm add -D vitest @vitest/coverage-v8 --filter=@repo/api`
- [ ] Framework installs: `pnpm add -D @playwright/test --filter=@repo/web`

*(Wave 0 must create test infrastructure before any implementation tasks)*

---

## Sources

### Primary (HIGH confidence)
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart) — clerkMiddleware, auth(), ClerkProvider
- [Clerk Fastify Quickstart](https://clerk.com/docs/fastify/getting-started/quickstart) — clerkPlugin, getAuth()
- [Clerk Expo Quickstart](https://clerk.com/docs/expo/getting-started/quickstart) — @clerk/expo, expo-secure-store
- [Clerk RBAC Guide](https://clerk.com/docs/guides/secure/basic-rbac) — publicMetadata role, checkRole pattern
- [Clerk Session Tokens](https://clerk.com/docs/guides/sessions/session-tokens) — JWT custom claims
- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new) — schema, drizzle-kit setup
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations) — generate + migrate workflow
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/) — SDK 52 auto-detection, pnpm hoisting
- [Turborepo GitHub Actions](https://turborepo.dev/docs/guides/ci-vendors/github-actions) — CI workflow, caching
- [Turborepo Next.js Guide](https://turborepo.dev/docs/guides/frameworks/nextjs) — turbo.json pipeline

### Secondary (MEDIUM confidence)
- [Expo GitHub Action](https://github.com/expo/expo-github-action) — EAS Build in CI
- [Fastify v5 Migration Guide](https://fastify.dev/docs/v5.1.x/Guides/Migration-Guide-V5/) — breaking changes
- [Fastify Plugins Guide](https://fastify.dev/docs/latest/Guides/Plugins-Guide/) — plugin architecture
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/) — wizard, onRequestError
- [Sentry Fastify](https://docs.sentry.io/platforms/javascript/guides/fastify/) — instrument.js pattern
- [byCedric/expo-monorepo-example](https://github.com/byCedric/expo-monorepo-example) — reference monorepo

### Tertiary (LOW confidence — needs validation)
- Multiple Medium articles on Turborepo + pnpm + Expo setup — cross-referenced with official docs, patterns verified
- [Drizzle ORM Best Practices Gist 2025](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) — generatedAlwaysAsIdentity pattern
- [CVE-2025-29927 Next.js Middleware Bypass](https://nvd.nist.gov/vuln/detail/CVE-2025-29927) — NVD listing confirms affected versions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages have official docs; versions verified against official sources
- Monorepo configuration: HIGH — Expo SDK 52 official docs + multiple cross-verified sources
- Clerk auth integration: HIGH — official Clerk docs for all three SDKs
- JSONB tier architecture: MEDIUM — pattern is well-understood PostgreSQL/Drizzle but specific implementation is project-specific; no canonical reference
- Pitfalls: HIGH — CVE verified via NVD; pnpm hoisting verified via Expo official docs; JWT claims timing documented in Clerk docs

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable stack — Clerk and Drizzle release frequently; verify versions at plan time)
