# Level

## What This Is

Level is a comprehensive fitness, strength-conditioning, and athletic performance platform serving two audiences: trainers/coaches on a full-featured web portal, and athletes/clients on a mobile app. It is the first platform to integrate programming, velocity-based training (VBT), readiness monitoring, multi-modality load tracking, and closed-loop autoregulation into a single unified system. Built for a client, developed solo with AI.

## Core Value

The closed-loop autoregulation engine: trainer builds the plan → readiness engine proposes daily adjustments → athlete executes with real-time VBT enforcement → post-session feedback refines the next session → cycle repeats, getting smarter for each individual athlete.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Monorepo with Next.js 15 web portal + React Native/Expo mobile app sharing a single API
- [ ] Role-based access: Athletes, Trainers, Admins, Assistant Coaches
- [ ] Tiered subscription system (Base, Pro, Elite) with JSONB capability map, dual enforcement at API + UI
- [ ] Team management (trainers create named groups, assign programs to teams, multi-team membership)
- [ ] Exercise library (500+ exercises, searchable via Meilisearch, video demos on Cloudflare R2)
- [ ] Program builder (web drag-and-drop + mobile touch) with full hierarchy: Program → Macrocycle → Week → Day → Exercise → Sets
- [ ] Dynamic load parameters per set (JSONB): weight, reps, RPE, RIR, velocity targets, tempo, advanced protocols
- [ ] Program templates + starter library (20+ professionally designed)
- [ ] Workout logger: frictionless set logging, rest timer, plate calculator, warm-up generator, previous performance overlay
- [ ] Offline-first mobile with WatermelonDB sync
- [ ] Post-session feedback loop (sRPE, pump quality, joint pain map, exercise thumbs up/down)
- [ ] Multi-modality training logs: running, swimming, cycling, sport practice, conditioning, flexibility, custom
- [ ] Unified weekly load model: Internal Training Load, ACWR, monotony & strain
- [ ] VBT bar tracking via on-device computer vision (TensorFlow.js MoveNet)
- [ ] Real-time velocity display, cutoff alerts, fatigue detection during sets
- [ ] 1RM estimation engine: Epley + velocity regression, living load-velocity profiles
- [ ] Advanced analytics: volume charts, 1RM trends, scatter plots, ACWR gauge, heatmaps, radar charts
- [ ] Pre-training readiness checklist (subjective + objective + body map)
- [ ] Composite readiness scoring (0-100, configurable weights per trainer)
- [ ] Dynamic program adjustment algorithm with graduated thresholds (Green/Gray/Yellow/Red)
- [ ] Side-by-side adjustment UI with per-exercise accept/reject
- [ ] Trainer override + custom rule builder for autoregulation
- [ ] Sport-specific standardised assessments (vertical jump, sprint, agility, endurance, strength benchmarks)
- [ ] Normative comparison engine + weak-area detection reports
- [ ] Injury log + return-to-play tracking + automatic exercise flagging
- [ ] Real-time messaging (Socket.io + Redis Pub/Sub): rich media, read receipts, group messaging
- [ ] Global notice board with rich-text editor, tier-targeted publishing, pinned posts
- [ ] Leaderboards + PR celebrations + workout sharing
- [ ] Push notifications (FCM + APNs)
- [ ] Apple Health / Google Health Connect sync
- [ ] Wearable data pipeline (schema supports Garmin, Whoop, Oura, Polar — MVP: Apple/Google)
- [ ] TimescaleDB continuous aggregates for volume rollups
- [ ] Admin dashboard: platform analytics, subscription management, user management, billing
- [ ] Data export (CSV/JSON), workout log PDF
- [ ] Caribbean currency display (JMD, TTD, BBD, GYD, BSD, XCD)
- [ ] Dark mode default + light mode + system-auto
- [ ] In-app onboarding tutorial (role-specific: athlete vs trainer)

### Out of Scope

- Apple Watch / WearOS companion app — deferred to Phase 8 (polish)
- Program marketplace (sell templates) — data model must support it, UI deferred post-MVP
- Garmin, Whoop, Oura, Polar API integrations — schema in place, live integrations deferred post-MVP
- Timing gate system integration for sprint tests — manual entry only for MVP

## Context

- **Prototype exists:** A React-based UI prototype was built in Claude (raw.html + Level_Prototype_extracted.jsx) covering the coach dashboard, program builder, exercise library, client management, analytics, messaging, and notice board. This is UI reference only — not production code.
- **Target users:** Serious athletes and professional trainers/coaches. Caribbean market context (JMD/TTD/etc. currencies, mid-range Android reliability requirement).
- **Competing platforms:** RP Hypertrophy, Fitbod (automated), TrainHeroic (coach-directed). Level sits between them with its differentiating closed-loop autoregulation.
- **Development:** Solo developer + AI (Claude). Client project.
- **Build priority:** Coach web portal first — get trainers building and assigning programs before athlete mobile experience.

## Constraints

- **Tech Stack**: Next.js 15 (web) + React Native/Expo SDK 52+ (mobile) + Fastify v5 API + PostgreSQL 16 + TimescaleDB + Redis + Meilisearch + Cloudflare R2 — as specified in master build prompt
- **Auth**: Clerk — as specified
- **ORM**: Drizzle ORM — as specified
- **Performance**: Sub-200ms API response times; offline-first mobile (full workout logging without connectivity)
- **Reliability**: Must function on mid-range Android (Samsung A-series) with intermittent Caribbean mobile connectivity
- **Extensibility**: JSONB schemas for load params, subscription tiers, session data — avoids schema migrations for feature gating

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Coach web portal first | Real users need to build programs before athletes can log workouts | — Pending |
| Modular monolith architecture | Clear bounded contexts, extractable to microservices at scale | — Pending |
| WatermelonDB for offline | Pull-then-push sync, last-write-wins, UUID conflict resolution | — Pending |
| JSONB capability map for tiers | Gate new features without schema migrations | — Pending |
| TimescaleDB for time-series | Continuous aggregates for ACWR, volume rollups — avoids expensive ad-hoc queries | — Pending |
| On-device VBT (TensorFlow.js) | Eliminates server round-trip for real-time velocity feedback during sets | — Pending |

---
*Last updated: 2026-03-24 after initialization*
