# Technology Stack

**Project:** Level - Fitness Coaching & Athletic Performance Platform
**Researched:** 2026-03-24
**Overall Confidence:** MEDIUM-HIGH (most choices verified against current docs; a few integration points are LOW confidence)

---

## Recommended Stack

### Core Framework — Web Portal

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.x (stable) | Coach web portal | Proven App Router stability. Next.js 16 dropped Webpack for Turbopack — risky for a project that needs dnd-kit and other Webpack-dependent plugins. Start on 15, upgrade to 16 once Turbopack plugin ecosystem matures. | HIGH |
| React | 19.x | UI library | Ships with Next.js 15. Server Components, use() hook, Actions. | HIGH |
| TypeScript | 5.7+ | Type safety | Non-negotiable for a codebase this large. Strict mode. | HIGH |

**Why NOT Next.js 16:** Next.js 16 replaces Webpack with Turbopack entirely. Any custom Webpack config, loaders, or plugins you rely on will break. For a greenfield project with complex drag-and-drop, rich-text editing, and numerous integrations, staying on the battle-tested 15.x line avoids surprises. Revisit after 16.1+ stabilizes (mid-2026).

### Core Framework — Mobile App

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Expo | SDK 53 | React Native framework | New Architecture enabled by default, React Native 0.79, React 19. SDK 52 is viable but SDK 53 is the correct choice for a new project — avoids migrating to New Architecture later. SDK 54 will be the last to support legacy arch. | HIGH |
| React Native | 0.79.x | Mobile runtime | Ships with Expo SDK 53. Fabric renderer, TurboModules. | HIGH |
| Expo Router | v4 | File-based navigation | Type-safe routing, deep linking, web support. Ships with SDK 53. | HIGH |

**Why NOT SDK 52:** SDK 52 still allows opting out of New Architecture. Starting there means you will need to migrate to New Architecture before SDK 55. SDK 53 forces it from day one — better to deal with any library incompatibilities now than mid-project.

**Known Issue:** SDK 53 startup time is reportedly 2x slower than SDK 51 in some cases (GitHub issue #36730). Monitor this — likely fixed in patches. Does not affect runtime performance.

### Styling — Mobile

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| NativeWind | 4.x (stable) | Tailwind CSS for React Native | Most adopted RN styling solution in 2025. Compiles Tailwind utilities ahead-of-time, avoiding runtime cost. Same mental model as web Tailwind. Dark mode support built in. | HIGH |

**Why NOT Tamagui:** Tamagui's optimizing compiler is impressive but adds significant build complexity and has a steep learning curve. Its component primitives diverge from standard React Native patterns, making it harder to integrate third-party components. NativeWind is simpler, more widely adopted, and works with any RN component.

**Why NOT Gluestack UI v3:** Gluestack v3 actually uses NativeWind under the hood. It adds pre-built accessible components on top. Consider adding Gluestack UI components later if you need accessible form controls, but the styling layer should be NativeWind directly.

**Why NOT NativeWind v5:** v5 is in preview and targets Tailwind CSS v4. Not production-ready yet. Stick with v4.x stable.

### Styling — Web

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | 3.x | Web styling | Matches NativeWind mental model. Shared design tokens across web and mobile. | HIGH |

### API Server

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Fastify | 5.8.x | REST API server | 2-3x faster than Express, schema-first validation, excellent TypeScript support. v5 is stable (5.8.4 current). Active LTS. | HIGH |
| @fastify/websocket | latest | WebSocket upgrade | Native Fastify WebSocket support for Socket.io fallback. | MEDIUM |

**Key v5 Breaking Changes to Know:**
- Requires Node.js 20+
- Full JSON Schema required for querystring, params, body (no more shorthand)
- `req.hostname` no longer includes port (use `req.host` for old behavior)
- DELETE with empty JSON body no longer accepted
- Type providers split into ValidatorSchema and SerializerSchema
- Cannot mix callback and promise plugin APIs

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PostgreSQL | 16 | Primary database | Mature, JSONB for flexible schemas, full-text search fallback. PG16 is fully supported by TimescaleDB. | HIGH |
| TimescaleDB | 2.25.x | Time-series extension | Continuous aggregates for ACWR, volume rollups, load tracking. Eliminates expensive ad-hoc aggregation queries. Runs as a PG extension — no separate service. | HIGH |
| Drizzle ORM | 0.41.x (stable) | Query builder / ORM | Type-safe SQL, lightweight, excellent PG support. Use stable branch, NOT v1 beta. | HIGH |

**Drizzle + TimescaleDB Integration:**
Drizzle has NO native TimescaleDB support (open feature request #2962). You must use raw SQL via `db.execute()` for:
- `SELECT create_hypertable(...)`
- `CREATE MATERIALIZED VIEW ... WITH (timescaledb.continuous)`
- `SELECT add_continuous_aggregate_policy(...)`
- Compression policies

This is manageable — TimescaleDB DDL is one-time setup. Regular queries against hypertables work normally through Drizzle since they are standard PG tables.

**Why NOT Drizzle v1 beta:** Currently at v1.0.0-beta.18. Major migration engine overhaul. Do not use in production. The stable 0.41.x line is battle-tested and receives patches.

**TimescaleDB Continuous Aggregate Gotchas:**
- Real-time aggregates DISABLED by default since v2.13 — you must explicitly enable `WITH (timescaledb.continuous, timescaledb.materialized_only = false)` if you want real-time data in aggregate views
- Hierarchical aggregates (stacking aggregates on aggregates) available since v2.9 — useful for daily -> weekly -> monthly rollups
- Refresh policies must be tuned: too frequent = wasted compute, too rare = stale dashboards

### Caching & Queues

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Redis | 7.x | Cache, pub/sub, session store | Required by BullMQ and Socket.io adapter. Single Redis instance serves all three roles initially. | HIGH |
| BullMQ | 5.71.x | Background job queue | Mature, Redis-backed, repeatable jobs for aggregate refresh, notifications, sync. | HIGH |
| ioredis | 5.x | Redis client | Required by BullMQ. Do NOT use node-redis (incompatible with BullMQ). | HIGH |

**BullMQ Production Config:**
- Set `maxmemory-policy` to `noeviction` (CRITICAL — Redis will silently drop queue data otherwise)
- Set `maxRetriesPerRequest: null` on Worker connections
- Use separate Redis connections for Queue and Worker (Workers need blocking connections)
- Attach error event handlers to prevent unhandled promise rejections

### Search

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Meilisearch | 1.x | Exercise library search | Sub-50ms search, typo tolerance, faceted filtering. 500+ exercises with tags, muscle groups, equipment. | HIGH |

**React Native Integration:**
- Use `meilisearch` JS client (NOT `react-instantsearch-native` — it adds unnecessary weight)
- Must install `react-native-url-polyfill` for RN compatibility
- Server-side: sync exercise data to Meilisearch via BullMQ job on create/update/delete

### File Storage

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Cloudflare R2 | - | Video demos, media storage | Zero egress fees (critical for video-heavy exercise library). S3-compatible API. | HIGH |
| @aws-sdk/client-s3 | 3.x | R2 client | Official S3 SDK works with R2. Used for presigned upload/download URLs. | HIGH |
| @aws-sdk/s3-request-presigner | 3.x | Presigned URLs | Generate temporary upload URLs for mobile clients to upload directly to R2. | HIGH |

**Video Strategy:**
- Exercise demo videos: presigned upload from admin -> R2 -> presigned download URLs with 1-hour TTL for playback
- Do NOT use Cloudflare public buckets for video — use presigned URLs to control access and prevent hotlinking
- Consider Cloudflare Stream for transcoding/adaptive bitrate later, but R2 direct is fine for MVP

### Offline-First Mobile

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| WatermelonDB | 0.28.x | Local database + sync | Lazy-loading, reactive queries, pull-then-push sync protocol. The only mature offline-first DB for React Native. | MEDIUM |
| @lovesworking/watermelondb-expo-plugin-sdk-52-plus | 1.0.3 | Expo config plugin | Community-maintained plugin for Expo SDK 52+/53. Auto-configures native build including JSI. | MEDIUM |

**CRITICAL WatermelonDB Gotchas:**

1. **Expo Managed Workflow:** WatermelonDB does NOT work with Expo Go. You MUST use development builds (`npx expo run:ios` / `npx expo run:android` or EAS Build). The community plugin handles native config, but you lose Expo Go for quick iteration on screens that touch the DB.

2. **Release Build Compilation:** Import of WatermelonDB sync module can fail in release builds. Fix: configure Metro to use Terser instead of UglifyES as the minifier.

3. **JSI Migration:** `synchronous: true` is deprecated. Use `experimentalUseJSI: true` instead. JSI gives ~3x faster read performance.

4. **Sync Protocol:** WatermelonDB sync is pull-then-push with timestamps. Your Fastify API must implement `/sync/pull` (returns changes since last pull) and `/sync/push` (accepts local changes). Conflict resolution is last-write-wins by default. For workout logs, this is acceptable. For program assignments, you need custom merge logic.

5. **Migration Syncs:** When you add new columns/tables in a schema migration, WatermelonDB now supports "migration syncs" that request all data for new tables/columns from the server. Without this, clients that upgrade the app would have empty new columns until a full reset.

6. **Do NOT access records after deletion.** This will crash. Use `record.observe()` patterns that handle destruction.

**Library Health Concern:** WatermelonDB's last npm publish was ~1 year ago (0.28.0). The GitHub repo has open issues about RN 0.76+ compatibility. The community Expo plugin papers over most issues, but this is the highest-risk dependency in the stack. **Mitigation:** Pin versions strictly, test on both iOS and Android with every Expo SDK upgrade. Have a fallback plan (expo-sqlite + custom sync) if WatermelonDB becomes unmaintained.

### Real-Time Communication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Socket.io | 4.x | Real-time messaging, live updates | Auto-reconnection, room-based messaging, binary support. Works on React Native via standard WebSocket interface. | HIGH |
| @socket.io/redis-adapter | latest | Multi-process pub/sub | Required for horizontal scaling. Uses Redis pub/sub to broadcast across Fastify instances. | HIGH |

**Socket.io + Fastify Integration:**
Use `fastify-socket.io` plugin. Socket.io attaches to the Fastify HTTP server. For authentication, verify Clerk session tokens in the Socket.io `connection` middleware — do NOT rely on cookies in React Native.

### Computer Vision — VBT

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-native-vision-camera | 4.x | Camera access + frame processing | Marc Rousavy's camera library. Frame processors run on a C++ worklet thread at 60fps. Required for real-time VBT. | MEDIUM |
| react-native-fast-tflite | latest | TFLite runtime | Runs .tflite models with optional GPU delegate. Dramatically faster than @tensorflow/tfjs-react-native. | MEDIUM |
| MoveNet SinglePose Lightning | .tflite | Pose estimation model | 17 keypoints, optimized for mobile latency. Lightning variant for real-time (50+ fps on modern devices). | MEDIUM |

**CRITICAL: Do NOT use @tensorflow/tfjs-react-native.**
The official TF.js React Native adapter depends on `expo-gl` for GPU acceleration, which has known performance issues and is being deprecated in favor of native solutions. Instead:

1. Use `react-native-vision-camera` for camera frames
2. Use `react-native-fast-tflite` to run the MoveNet .tflite model directly
3. Process keypoints in a frame processor plugin (C++ thread, not JS thread)
4. Draw overlay with `react-native-skia`

This pipeline runs entirely on-device at 30-60fps on mid-range Android (Samsung A-series). The TF.js approach struggles to hit 15fps on the same hardware.

**Known Issues:**
- VisionCamera v4 + Skia frame processors have reported crashes on Expo SDK 53 (GitHub issue #3606). Monitor for patches.
- MoveNet Lightning trades accuracy for speed. For barbell tracking, you need wrist + shoulder + hip keypoints. Lightning is sufficient but Thunder gives better keypoint stability for velocity calculation. Test both.
- GPU delegate may not be available on all mid-range Android. Implement CPU fallback with reduced frame rate (15fps).
- Memory leak risk: MUST call `tf.dispose()` on tensors after each frame. Failure to do so will crash the app within minutes.

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Clerk | latest | Auth provider | Email/password, OAuth (Apple, Google), multi-tenant organizations, role management. First-class Expo support with native UI components. | HIGH |
| @clerk/nextjs | latest | Next.js middleware | Server-side session validation, route protection. | HIGH |
| @clerk/expo | latest | Expo auth | Secure token storage via expo-secure-store. | HIGH |

**Clerk Architecture:**
- Web: Clerk middleware in Next.js validates sessions server-side
- Mobile: Clerk Expo SDK stores tokens in expo-secure-store (encrypted)
- API: Fastify middleware verifies Clerk JWT on every request (`@clerk/fastify` or manual JWT verification with Clerk JWKS)
- Roles: Use Clerk's organization metadata for Athlete/Trainer/Admin/AssistantCoach roles
- Native Components (SDK 53+): Clerk now offers SwiftUI/Jetpack Compose sign-in screens. Use these for a polished auth experience.

**Gotcha:** Clerk's Expo Native Components require SDK 53+. If you stay on SDK 52, you must build custom auth screens.

### Drag-and-Drop — Program Builder

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| dnd-kit | 6.x | Web drag-and-drop | Lightweight, accessible, supports nested sortable lists. Best React DnD library for complex hierarchies. | MEDIUM |

**Program Builder Hierarchy:** Program > Macrocycle > Week > Day > Exercise > Sets. This is 6 levels of nesting.

**dnd-kit Nested DnD Approach:**
- Use `@dnd-kit/sortable` with nested `SortableContext` providers
- Each level gets its own `SortableContext` with a unique ID namespace
- Cross-level drag (e.g., moving an exercise from one day to another) requires `DndContext` at the top with custom collision detection
- `closestCenter` collision detection works poorly with nested lists — use `rectIntersection` or write a custom collision detector

**Why NOT Pragmatic Drag and Drop (Atlassian):** Smaller bundle size but less community examples for deeply nested use cases. dnd-kit has more battle-tested patterns for sortable nested lists.

**Why NOT react-beautiful-dnd:** Deprecated by Atlassian in 2022. Community fork (@hello-pangea/dnd) exists but lacks nested DnD support.

**Mobile Touch DnD:** dnd-kit is web-only. For React Native, use `react-native-draggable-flatlist` for single-level reordering. For the full nested program builder on mobile, consider a simplified UI (tap-to-move rather than drag) — deeply nested drag-and-drop on mobile is a UX anti-pattern.

### Additional Supporting Libraries

| Library | Version | Purpose | Why | Confidence |
|---------|---------|---------|-----|------------|
| Zod | 3.x | Runtime validation | Schema validation shared between API and client. Pairs with Drizzle for type inference. | HIGH |
| react-native-reanimated | 3.x | Animations | Required by NativeWind, Expo Router, and gesture-based UI. Ships with Expo SDK 53. | HIGH |
| react-native-gesture-handler | 2.x | Touch gestures | Required for drag-and-drop on mobile, swipe actions. Ships with Expo SDK 53. | HIGH |
| react-native-skia | 2.x | Canvas drawing | VBT overlay rendering, custom charts, keypoint visualization. | MEDIUM |
| react-native-mmkv | 3.x | Fast key-value storage | App preferences, feature flags, cached tokens. 30x faster than AsyncStorage. | HIGH |
| expo-secure-store | SDK 53 | Secure storage | Clerk tokens, sensitive user data. | HIGH |
| react-hook-form | 7.x | Form management | Workout logging, program builder forms. Minimal re-renders. | HIGH |
| date-fns | 3.x | Date manipulation | Workout dates, schedule calculations, timezone handling. | HIGH |
| recharts | 2.x | Web charts | Volume charts, 1RM trends, ACWR gauges for web portal. | MEDIUM |
| victory-native | 41.x | Mobile charts | Same chart types on React Native. Skia-based rendering. | MEDIUM |

---

## Monorepo Structure

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Turborepo | 2.x | Monorepo build orchestration | Incremental builds, task caching, parallel execution. | HIGH |
| pnpm | 9.x | Package manager | Faster than npm, strict dependency resolution, workspace support. | HIGH |

**Workspace Layout:**
```
apps/
  web/          # Next.js 15 coach portal
  mobile/       # Expo SDK 53 athlete app
  api/          # Fastify 5 API server
packages/
  shared/       # Shared types, Zod schemas, constants
  db/           # Drizzle schema, migrations, queries
  ui/           # Shared UI primitives (if cross-platform)
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Web Framework | Next.js 15 | Next.js 16 | Turbopack-only breaks Webpack plugins; too new for production |
| Mobile Framework | Expo SDK 53 | Expo SDK 52 | SDK 52 still on legacy arch by default; migration pain later |
| API Framework | Fastify 5 | Express 5 | Express 5 just reached stable but Fastify is 2-3x faster with built-in validation |
| ORM | Drizzle 0.41 | Prisma 6 | Prisma's query engine adds ~10MB to deploy, slower cold starts, less control over SQL |
| Mobile Styling | NativeWind 4 | Tamagui | Tamagui's custom primitives increase learning curve; NativeWind maps 1:1 to Tailwind |
| Offline DB | WatermelonDB | expo-sqlite | expo-sqlite has no built-in sync protocol; WatermelonDB's sync + reactive queries save months of work |
| Pose Detection | react-native-fast-tflite | @tensorflow/tfjs-react-native | tfjs-react-native uses expo-gl, poor performance on mid-range Android |
| DnD (Web) | dnd-kit | Pragmatic DnD | Less community patterns for 6-level nested sortable lists |
| Job Queue | BullMQ | Agenda/pg-boss | BullMQ is the standard; pg-boss adds PG load for something Redis handles better |
| Search | Meilisearch | Algolia | Meilisearch is self-hosted (no per-search pricing), good enough for 500+ exercises |

---

## Installation

```bash
# Root monorepo setup
pnpm create turbo@latest

# Web portal (apps/web)
pnpm add next@15 react@19 react-dom@19 @clerk/nextjs tailwindcss
pnpm add -D typescript @types/react @types/node

# Mobile app (apps/mobile)
pnpm add expo@~53 react-native@~0.79 expo-router @clerk/expo
pnpm add nativewind@~4 react-native-reanimated react-native-gesture-handler
pnpm add @nozbe/watermelondb@~0.28
pnpm add @lovesworking/watermelondb-expo-plugin-sdk-52-plus
pnpm add expo-build-properties expo-secure-store
pnpm add react-native-vision-camera react-native-fast-tflite @shopify/react-native-skia
pnpm add react-native-mmkv meilisearch react-native-url-polyfill socket.io-client

# API server (apps/api)
pnpm add fastify@~5.8 drizzle-orm@~0.41 postgres zod bullmq ioredis
pnpm add @fastify/cors @fastify/helmet @fastify/rate-limit fastify-socket.io
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner meilisearch
pnpm add -D drizzle-kit tsx @types/node typescript

# Shared packages
pnpm add -w zod date-fns
```

---

## Integration Risk Matrix

| Integration | Risk | Issue | Mitigation |
|-------------|------|-------|------------|
| WatermelonDB + Expo SDK 53 | HIGH | Community plugin, not official. WatermelonDB hasn't published in ~1 year. | Pin versions, test early, have expo-sqlite fallback plan |
| VisionCamera v4 + Skia + SDK 53 | HIGH | Reported frame processor crashes (issue #3606) | Wait for VisionCamera patch, defer VBT to later phase |
| Drizzle + TimescaleDB | LOW | No native support, but raw SQL works fine | Wrap TimescaleDB DDL in migration scripts, standard queries work through Drizzle |
| Clerk + Fastify | LOW | No official @clerk/fastify package | Verify JWT manually using Clerk JWKS endpoint — straightforward |
| Socket.io + Fastify | LOW | Well-supported via fastify-socket.io plugin | Standard pattern, many production examples |
| dnd-kit nested 6 levels | MEDIUM | No built-in support for deeply nested cross-container drag | Custom collision detection, extensive testing, possibly flatten to 4 levels for UX |
| BullMQ + Redis | LOW | Requires specific Redis config (noeviction) | Set maxmemory-policy in Redis config from day one |
| NativeWind + WatermelonDB | LOW | Styling and DB are independent layers | No known conflicts |
| Meilisearch + React Native | LOW | Requires URL polyfill | Single import at entry point, well-documented |

---

## Version Pinning Strategy

Pin major.minor, allow patch updates:
```json
{
  "next": "~15.5",
  "expo": "~53.0",
  "fastify": "~5.8",
  "drizzle-orm": "~0.41",
  "@nozbe/watermelondb": "~0.28",
  "bullmq": "~5.71",
  "socket.io": "~4.8",
  "meilisearch": "~0.44",
  "nativewind": "~4.1"
}
```

---

## Sources

- [Expo SDK 53 Release Notes](https://expo.dev/changelog/sdk-53) — HIGH confidence
- [Expo New Architecture Blog](https://expo.dev/blog/out-with-the-old-in-with-the-new-architecture) — HIGH confidence
- [Next.js 15 vs 16 Comparison](https://www.descope.com/blog/post/nextjs15-vs-nextjs16) — MEDIUM confidence
- [Fastify v5 Migration Guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/) — HIGH confidence
- [Fastify v5 Breaking Changes Analysis](https://encore.dev/blog/fastify-v5) — MEDIUM confidence
- [Drizzle ORM TimescaleDB Issue #2962](https://github.com/drizzle-team/drizzle-orm/issues/2962) — HIGH confidence
- [TimescaleDB Continuous Aggregates Docs](https://docs.timescale.com/use-timescale/latest/continuous-aggregates/) — HIGH confidence
- [TimescaleDB 2.23 Release (PG 16/17/18 support)](https://github.com/timescale/timescaledb/releases/tag/2.23.0) — HIGH confidence
- [WatermelonDB GitHub](https://github.com/Nozbe/WatermelonDB) — HIGH confidence
- [WatermelonDB Expo Plugin for SDK 52+](https://github.com/LovesWorking/watermelondb-expo-plugin-sdk-52-plus) — MEDIUM confidence
- [WatermelonDB Expo SDK 52 Dependency Issues](https://github.com/Nozbe/WatermelonDB/issues/1892) — HIGH confidence
- [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite) — MEDIUM confidence
- [VisionCamera v4 Frame Processors](https://react-native-vision-camera.com/docs/guides/frame-processors) — HIGH confidence
- [VisionCamera v4 + Skia Crash on SDK 53](https://github.com/mrousavy/react-native-vision-camera/issues/3606) — HIGH confidence
- [MoveNet Pose Detection README](https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/movenet/README.md) — HIGH confidence
- [Clerk Expo Quickstart](https://clerk.com/docs/expo/getting-started/quickstart) — HIGH confidence
- [Clerk Expo Native Components](https://clerk.com/docs/reference/expo/native-components/overview) — HIGH confidence
- [BullMQ Connections Guide](https://docs.bullmq.io/guide/connections) — HIGH confidence
- [BullMQ Production Guide](https://docs.bullmq.io/guide/going-to-production) — HIGH confidence
- [dnd-kit Documentation](https://dndkit.com/) — HIGH confidence
- [NativeWind Installation](https://www.nativewind.dev/docs/getting-started/installation) — HIGH confidence
- [Cloudflare R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) — HIGH confidence
- [Meilisearch React Native Integration](https://medium.com/@sisongqolosi/integrating-meilisearch-with-react-native-dfd28a1e9989) — MEDIUM confidence
