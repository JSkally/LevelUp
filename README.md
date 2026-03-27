# Level

A comprehensive fitness and athletic performance platform for trainers and athletes. Trainers build programs on the web portal; athletes execute them on mobile with real-time velocity-based training (VBT) feedback. The core differentiator is a closed-loop autoregulation engine: trainer builds the plan → readiness engine proposes daily adjustments → athlete executes with VBT enforcement → post-session feedback refines the next session.

## Monorepo Structure

```
apps/
  web/      — Next.js 15 coach portal
  mobile/   — React Native / Expo SDK 52 athlete app
  api/      — Fastify v5 API server
packages/
  db/       — Drizzle ORM schema, migrations, seed data
  shared/   — Shared types, schemas, and utilities
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web | Next.js 15, Clerk auth, Tailwind CSS |
| Mobile | React Native, Expo SDK 52, Clerk auth |
| API | Fastify v5, Drizzle ORM |
| Database | PostgreSQL 16, TimescaleDB, Redis |
| Search | Meilisearch |
| Storage | Cloudflare R2 |
| Auth | Clerk (roles: Admin, Trainer, Assistant Coach, Athlete) |
| Infra | AWS ECS Fargate, Cloudflare Pages, GitHub Actions |
| Monitoring | Sentry, Grafana Cloud |

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for local Postgres, Redis, Meilisearch)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start local services (Postgres, Redis, Meilisearch)
docker-compose up -d

# Copy env vars
cp .env.example .env
# Fill in required values (Clerk keys, database URL, etc.)

# Run all apps in dev mode
pnpm dev
```

Apps will be available at:
- Web: http://localhost:3000
- API: http://localhost:3001
- Mobile: start with `pnpm --filter mobile start` and open in Expo Go

## Commands

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm typecheck    # Type-check all packages
```

## Subscription Tiers

| Tier | Description |
|------|-------------|
| Base | Core workout logging and program access |
| Pro | Advanced analytics, messaging, team management |
| Elite | VBT bar tracking, autoregulation, full analytics |

## Key Features

- **Program builder** — drag-and-drop on web, touch on mobile; full hierarchy: Program → Macrocycle → Week → Day → Exercise → Sets
- **VBT bar tracking** — on-device computer vision (TensorFlow.js MoveNet) for real-time velocity feedback, no server round-trip
- **Autoregulation engine** — composite readiness scoring with graduated thresholds (Green/Gray/Yellow/Red) and per-exercise accept/reject UI
- **Offline-first mobile** — WatermelonDB sync for full workout logging without connectivity
- **Exercise library** — 500+ exercises with video demos, searchable via Meilisearch
- **Advanced analytics** — volume charts, 1RM trends, ACWR gauge, scatter plots, radar charts
- **Real-time messaging** — Socket.io + Redis Pub/Sub with rich media and group messaging
- **Multi-currency support** — JMD, TTD, BBD, GYD, BSD, XCD

## Environment Variables

See `.env.example` for the full list. Key variables:

```
DATABASE_URL=
REDIS_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
SENTRY_DSN=
```

## Deployment

- **API** — AWS ECS Fargate via `infra/ecs/`
- **Web** — Cloudflare Pages via `infra/cloudflare/`
- **CI/CD** — GitHub Actions (`.github/workflows/`)

Deploy workflow triggers on push to `main`. Uses OIDC role assumption for AWS — no long-lived credentials stored as secrets.
