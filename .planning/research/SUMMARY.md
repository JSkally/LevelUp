# Research Summary: Level

**Domain:** Fitness coaching platform with VBT, autoregulation, and offline-first mobile
**Researched:** 2026-03-24
**Overall confidence:** MEDIUM-HIGH

## Executive Summary

Level's technology stack is largely settled by the project constraints (Next.js 15, Expo, Fastify, PostgreSQL + TimescaleDB, etc.). The research focus was therefore on verifying current versions, identifying integration risks between these specific technologies, and flagging gotchas that would cause rework if discovered mid-build.

The stack is well-chosen for the problem domain. The highest-risk dependencies are WatermelonDB (unmaintained for ~1 year, community Expo plugin) and the VBT computer vision pipeline (VisionCamera v4 + react-native-fast-tflite + MoveNet on Expo SDK 53, which has reported frame processor crashes). Both should be prototyped early in isolation before building features on top of them.

The recommendation is to use Expo SDK 53 (not 52) since it enables New Architecture by default, use NativeWind 4.x for mobile styling, and critically, use react-native-fast-tflite instead of the official @tensorflow/tfjs-react-native package which has severe performance issues on mid-range Android. Next.js should stay on 15.x (not 16) due to Turbopack's Webpack incompatibility.

Drizzle ORM lacks native TimescaleDB support, but this is a minor inconvenience — TimescaleDB DDL is setup-time work handled via raw SQL, and day-to-day queries go through standard Drizzle PG queries.

## Key Findings

**Stack:** Next.js 15 + Expo SDK 53 + Fastify 5.8 + PG 16/TimescaleDB 2.25 + Drizzle 0.41 + WatermelonDB 0.28 + react-native-fast-tflite + Clerk + BullMQ 5.71 + Socket.io 4
**Architecture:** Turborepo monorepo with apps/web, apps/mobile, apps/api, packages/shared, packages/db
**Critical pitfall:** WatermelonDB library health — no publish in ~1 year, community Expo plugin is the only path forward. Needs a fallback plan.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation & Auth** - Monorepo setup, Turborepo config, Clerk auth on web + mobile + API, database schema with Drizzle + TimescaleDB hypertables
   - Addresses: Core infrastructure, role-based access
   - Avoids: Building on unvalidated offline sync or VBT

2. **Exercise Library & Program Builder (Web)** - Meilisearch integration, CRUD, dnd-kit nested drag-and-drop, R2 video storage
   - Addresses: Coach portal table-stakes features
   - Avoids: Mobile complexity before web is proven

3. **Workout Logger & Offline Sync** - WatermelonDB integration, sync protocol, mobile workout logging
   - Addresses: Core athlete experience, offline-first requirement
   - Avoids: VBT dependency (can log workouts without camera)

4. **VBT & Computer Vision** - VisionCamera + react-native-fast-tflite + MoveNet pipeline
   - Addresses: Key differentiator (bar tracking)
   - Avoids: Blocking other features on the highest-risk integration

5. **Analytics & Autoregulation** - TimescaleDB continuous aggregates, ACWR, readiness scoring, dynamic adjustments
   - Addresses: Closed-loop autoregulation (core value prop)
   - Avoids: Needs workout data to exist first

6. **Messaging & Social** - Socket.io real-time messaging, leaderboards, notice board
   - Addresses: Engagement features
   - Avoids: Not needed until coaches and athletes are both on the platform

7. **Assessments, Wearables & Admin** - Sport-specific tests, Apple Health/Google Health Connect, admin dashboard
   - Addresses: Professional trainer requirements
   - Avoids: Can ship MVP without these

**Phase ordering rationale:**
- Auth and schema must come first (everything depends on it)
- Web portal before mobile (per project constraint: "Coach web portal first")
- Offline sync before VBT (workout logging is table stakes; VBT is a differentiator)
- VBT isolated in its own phase because it has the highest integration risk
- Analytics after logging (needs real data to aggregate)
- Messaging is engagement, not core — defer until both sides of the platform exist

**Research flags for phases:**
- Phase 3 (Offline Sync): HIGH risk — WatermelonDB health, sync protocol complexity
- Phase 4 (VBT): HIGH risk — VisionCamera + TFLite + SDK 53 crash reports
- Phase 5 (Analytics): LOW risk — TimescaleDB continuous aggregates are well-documented
- Phase 6 (Messaging): LOW risk — Socket.io + Redis is a standard pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Most versions verified against npm/GitHub. Well-established technologies. |
| WatermelonDB | MEDIUM | Working but unmaintained. Community plugin bridges Expo gap. |
| VBT Pipeline | LOW-MEDIUM | react-native-fast-tflite is the right approach but VisionCamera v4 + SDK 53 has open crash reports |
| TimescaleDB | HIGH | Verified PG 16 support, continuous aggregate docs are thorough |
| dnd-kit Nesting | MEDIUM | Works for nested lists but 6-level hierarchy needs custom collision detection |
| Drizzle + TimescaleDB | HIGH | No native support confirmed (issue #2962), raw SQL workaround is clean |

## Gaps to Address

- WatermelonDB sync protocol implementation details need phase-specific research (pull/push endpoints, conflict resolution for concurrent program edits)
- VisionCamera v4 + Skia + SDK 53 stability needs a spike/prototype before committing to Phase 4
- dnd-kit 6-level nested drag needs a proof-of-concept — may need to simplify UX to 4 levels
- Clerk organization-based role management needs verification for the specific Athlete/Trainer/Admin/AssistantCoach model
- Caribbean payment processing (JMD/TTD currencies) not researched — likely needs Stripe with regional considerations
