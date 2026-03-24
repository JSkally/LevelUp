# Pitfalls Research

**Domain:** Fitness coaching platform with VBT, offline sync, autoregulation
**Researched:** 2026-03-24
**Confidence:** HIGH (most pitfalls verified across official docs and multiple community sources)

## Critical Pitfalls

### Pitfall 1: WatermelonDB Sync Loop After Push Failure

**What goes wrong:**
When a push fails due to a server-side conflict (the record changed remotely between pull and push), the sync enters a failure state. Naive retry logic without a fresh pull creates an infinite loop: push fails, retry push, push fails again. Worse, on the next successful sync, every record that was just pushed gets pulled back down redundantly because WatermelonDB has no mechanism to exclude just-pushed changes from the subsequent pull.

**Why it happens:**
WatermelonDB uses a pull-then-push model. If a record changes on the server between your pull and push, the push rejects but does not tell you which records conflicted. Developers assume retrying the push will work, but without a fresh pull to get the updated server state, the conflict persists.

**How to avoid:**
- Wrap `synchronize()` in a "retry once" block: if sync fails, pull again then push. This is explicitly recommended by WatermelonDB docs.
- Set a maximum retry count (2-3) with exponential backoff to prevent battery drain on Caribbean mobile networks.
- Use `experimentalRejectedIds` in the push response to handle partial rejections gracefully -- accept what succeeds, queue failures for next sync.
- Implement a sync health monitor that tracks consecutive failures and falls back to `experimentalStrategy: 'replacement'` (full re-sync) after N failures.

**Warning signs:**
- Sync duration increasing over time without data growth.
- Battery complaints from users on intermittent connections.
- Server logs showing repeated identical push payloads.
- `lastPulledAt` timestamp not advancing.

**Phase to address:**
Phase 1 (Foundation) -- sync architecture must be correct from day one. Retrofitting sync logic after users have divergent local databases is a nightmare.

---

### Pitfall 2: WatermelonDB Multi-User Session Contamination

**What goes wrong:**
When a trainer logs out and an athlete logs in on the same device (common in gym settings), the `lastPulledAt` timestamp persists from the previous user's session. The new user's sync skips records created before that timestamp, resulting in a partial or empty local database. The athlete sees no programs, no history.

**Why it happens:**
WatermelonDB tracks sync state per-database, not per-user. Without a full database reset on logout, the sync cursor belongs to the wrong user.

**How to avoid:**
- Call `database.unsafeResetDatabase()` on logout. This is the only safe approach.
- Store `lastPulledAt` keyed by user ID, not globally. Verify this in the sync adapter.
- Add a post-login verification step that checks record counts against a server-side summary endpoint before presenting the UI.

**Warning signs:**
- QA reports of "missing data" that resolve after app reinstall.
- Inconsistent record counts between mobile and web for the same user.

**Phase to address:**
Phase 1 (Foundation) -- must be part of the auth flow from the start.

---

### Pitfall 3: TensorFlow.js Bridge Serialization Killing VBT Frame Rate

**What goes wrong:**
Using `cameraWithTensors` from `@tensorflow/tfjs-react-native` to pipe camera frames to MoveNet creates a serialization bottleneck between the native camera thread and the JS thread. On mid-range Android devices (Samsung A-series, the Caribbean target), frame rates drop to 5-10 FPS, making real-time velocity tracking useless. The barbell appears to teleport between frames rather than showing smooth movement, and velocity calculations become wildly inaccurate.

**Why it happens:**
React Native's bridge (or even the new architecture's JSI) incurs a cost for transferring large binary payloads (camera frames are ~1MB+ per frame at reasonable resolution). TensorFlow.js running in the JS thread then competes with UI rendering for the single JS thread.

**How to avoid:**
- Use `react-native-fast-tflite` with `react-native-vision-camera` instead of `@tensorflow/tfjs-react-native`. This runs TFLite inference natively via a frame processor plugin, completely bypassing the JS bridge for the heavy compute path.
- Use MoveNet Lightning (not Thunder) -- it is specifically designed for latency-critical mobile applications.
- Quantize the model to uint8/int8 instead of float32 for 2-4x faster inference on mobile.
- Enable NNAPI delegate on Android 12+ devices for hardware acceleration.
- Implement adaptive quality: detect device capability at startup, reduce input resolution on slower devices (e.g., 192x192 instead of 256x256).
- Only send keypoint coordinates (tiny payload) back to JS for velocity calculation -- never send frame data across the bridge.

**Warning signs:**
- Frame rate below 15 FPS during development on a physical mid-range device.
- Visible lag between actual barbell movement and on-screen overlay.
- Device overheating during sets (thermal throttling will make it worse over time).
- Memory warnings in Android logcat during VBT sessions.

**Phase to address:**
Phase 3 or 4 (VBT implementation) -- but the architectural decision (fast-tflite vs tfjs-react-native) must be made in Phase 1 stack selection, because it affects camera library choice and native module setup.

---

### Pitfall 4: TensorFlow.js Memory Leaks During Long Workout Sessions

**What goes wrong:**
Tensors allocated during pose estimation are not automatically garbage collected. During a workout session (potentially 60-90 minutes with VBT active), unreleased tensors accumulate, eventually causing OOM crashes on mid-range Android devices with 3-4GB RAM. The app crashes mid-set, losing the athlete's workout data.

**Why it happens:**
TensorFlow.js requires explicit `tensor.dispose()` calls. Every frame processed creates new tensors. Developers forget to dispose intermediate tensors, or error paths skip disposal. The JS garbage collector cannot reclaim GPU/native memory held by tensor references.

**How to avoid:**
- Use `tf.tidy()` to wrap all tensor operations -- it automatically disposes intermediates.
- Implement a tensor count monitor in development: `tf.memory().numTensors` should stay flat over time. Alert if it grows.
- Design VBT to activate only during sets (30-90 seconds), not continuously. Use a "recording" toggle. Between sets, fully release the camera pipeline and model.
- If using `react-native-fast-tflite`, memory management is simpler (native handles it), but still monitor native memory via Android profiler.
- Save workout state to WatermelonDB every set completion so crash recovery loses at most one set.

**Warning signs:**
- `tf.memory().numTensors` growing linearly during a session.
- App performance degrading after 15-20 minutes of VBT use.
- Android "low memory" warnings in logcat.

**Phase to address:**
Phase 3/4 (VBT implementation) -- requires explicit memory management strategy and load testing on target devices.

---

### Pitfall 5: TimescaleDB Continuous Aggregates Silently Serving Stale Data

**What goes wrong:**
Dashboards show volume, ACWR, and training load metrics that are hours or days behind reality. Trainers make autoregulation decisions based on yesterday's data. Worse, the staleness is invisible -- there is no indicator that the aggregate has not refreshed.

**Why it happens:**
Three interacting configuration errors:
1. **Materialized-only mode (default on older versions):** Only returns pre-computed data, silently ignoring recent inserts.
2. **Refresh policy misconfiguration:** If `schedule_interval` equals `start_offset`, no data gets written to the aggregate at all (confirmed TimescaleDB bug). If `end_offset` equals `schedule_interval`, data takes 2x the interval to appear.
3. **DST transitions:** Sub-hour refresh policies break after DST changes, producing inverted time windows that cause refresh failures (confirmed bug in TimescaleDB, reported October 2025).

**How to avoid:**
- Use `WITH (timescaledb.materialized_only = false)` to enable real-time aggregates that combine materialized data with fresh queries on unmaterialized ranges. Accept the small query overhead.
- Set `schedule_interval` to be shorter than `start_offset` (e.g., refresh every 30 minutes with a 1 hour lookback window).
- Always set explicit `start_offset` and `end_offset` -- never leave them as defaults (NULL means "refresh everything," which is extremely expensive).
- Use UTC timestamps throughout. Avoid timezone-aware intervals in refresh policies to sidestep DST bugs.
- Add a `last_refreshed_at` metadata query to dashboard endpoints. Display "Data as of: X minutes ago" in the UI.
- Write a health check that alerts if any continuous aggregate has not refreshed in 2x its expected interval.

**Warning signs:**
- Dashboard metrics do not change after a workout is logged.
- `SELECT * FROM timescaledb_information.continuous_aggregate_stats` shows `last_run_status = 'Failed'`.
- Volume totals disagree between real-time API queries and dashboard aggregates.

**Phase to address:**
Phase 2 (Data layer / Analytics foundation) -- continuous aggregates must be tested with realistic data volumes and time boundaries before building dashboard UIs on top of them.

---

### Pitfall 6: Socket.io Mobile Background/Foreground State Mismanagement

**What goes wrong:**
On iOS, the socket connection dies within seconds of the app going to background. On Android, Doze mode and App Standby buckets throttle and eventually kill the connection. When the app returns to foreground, three failure modes occur:
1. **Stale connection:** The client thinks it is connected but the server has already cleaned up the session. Messages are silently lost.
2. **Duplicate connections:** Rapid background/foreground cycling creates multiple socket instances, each receiving events. The chat UI shows duplicate messages.
3. **Missed messages:** Messages sent while the app was backgrounded are never delivered because Socket.io does not persist undelivered messages by default.

**Why it happens:**
Socket.io was designed for browsers, not mobile apps with aggressive OS-level connection management. The default reconnection logic does not account for iOS killing connections or Android Doze mode.

**How to avoid:**
- On `AppState.change` to 'background': explicitly disconnect the socket with a clean close.
- On `AppState.change` to 'active': reconnect with a fresh handshake, then request missed messages since last received timestamp.
- Server-side: store messages in Redis with a TTL (e.g., 24 hours). On reconnect, the client sends its last received message ID, server replays missed messages.
- Use exponential backoff for reconnection: start at 1 second, cap at 30 seconds. Do not use aggressive reconnection on mobile -- it drains battery and may trigger rate limiting.
- Enable sticky sessions in the load balancer (required for Socket.io with multiple server instances).
- Consider using the Socket.io `@socket.io/redis-streams-adapter` instead of basic Redis Pub/Sub for message persistence during disconnections.

**Warning signs:**
- Users report "ghost" online status (shown as online when app is backgrounded).
- Duplicate messages in chat history.
- Messages from trainers not appearing until athlete force-closes and reopens the app.
- High Socket.io connection churn in server metrics.

**Phase to address:**
Phase 5 (Messaging / Real-time features) -- but the message persistence architecture (Redis streams vs. database) must be decided in Phase 1.

---

### Pitfall 7: Subscription Tier Bypass via Client-Side-Only Enforcement

**What goes wrong:**
Features gated by subscription tier (e.g., VBT is Elite-only, advanced analytics is Pro+) are only checked in the UI. A determined user modifies the mobile app, calls the API directly, or exploits a race condition between tier downgrade and feature access to use features they have not paid for.

**Why it happens:**
The JSONB capability map is an elegant design, but developers often check it only at the UI layer (hiding buttons) and forget to enforce it in API middleware. Additionally, Clerk session JWTs contain metadata that is not refreshed immediately after a tier change -- there is a window where the old tier is still in the active JWT.

**How to avoid:**
- **Dual enforcement (mandatory):** Check tier in UI (for UX) AND in every API route handler (for security). Use Fastify middleware/hooks that read the capability map from the database, not from the JWT.
- **JWT staleness window:** After a tier change, invalidate the user's active sessions or set a short JWT expiry (5 minutes) and use refresh tokens. Alternatively, maintain a server-side tier cache in Redis that is updated synchronously on tier change, and check this cache in middleware instead of JWT claims.
- **Race condition on downgrade:** When a subscription is downgraded, immediately update the Redis cache. Do not wait for webhook processing. Use a database transaction that atomically updates the tier and revokes active capabilities.
- **Audit logging:** Log all tier-gated API calls with the tier that was checked. This lets you detect bypass attempts retroactively.

**Warning signs:**
- API logs showing tier-gated endpoint access from users on lower tiers.
- Discrepancy between Clerk session metadata and database tier records.
- Revenue not matching expected usage patterns (users accessing Pro features on Base tier).

**Phase to address:**
Phase 2 (Auth and subscription system) -- the middleware enforcement pattern must be established before any tier-gated features are built. Every subsequent phase inherits this pattern.

---

### Pitfall 8: JSONB Schema Sprawl Making Queries Unindexable

**What goes wrong:**
The JSONB columns for load parameters, session data, and tier capabilities grow organically. Developers add nested keys freely because "it's just JSON." Eventually, critical queries (e.g., "find all sets where velocity < 0.5 m/s for this exercise") require deep JSONB path traversals that GIN indexes cannot accelerate. Query times go from 10ms to 2+ seconds as data grows. The query planner makes poor join decisions because PostgreSQL stores no statistics for JSONB key distributions.

**Why it happens:**
JSONB provides a false sense of schema-freedom. Developers treat it like a document database but expect relational query performance. The performance cliff is not linear -- what works at 10K rows collapses at 500K rows, often a 1000x degradation.

**How to avoid:**
- **Hybrid column strategy:** If a JSONB key is queried in WHERE clauses or JOINs, promote it to a real column. Use JSONB only for truly variable data (e.g., the specific load parameters differ per exercise type, but `target_velocity` is queried frequently enough to be a column).
- **Expression B-tree indexes** for the 1-3 keys you query most: `CREATE INDEX idx_sets_velocity ON sets ((data->>'target_velocity')::numeric)`. These are small and fast.
- **GIN index with jsonb_path_ops** (not default `jsonb_ops`) for containment queries. It is 2-3x smaller and faster for `@>` operations.
- **Type consistency:** JSONB `"100"` (string) and `100` (number) are different values. One inconsistent serialization and your containment queries silently miss rows. Enforce types in the API layer with Zod schemas.
- **JSONB column size limit:** Set a maximum document size in application code (e.g., 10KB). Unbounded JSONB blobs cause TOAST overhead and vacuum issues.

**Warning signs:**
- Queries involving JSONB columns showing sequential scans in `EXPLAIN ANALYZE`.
- Increasing query times as data grows, especially on analytics endpoints.
- Developers adding new JSONB keys without updating indexes.
- GIN index size exceeding the table size.

**Phase to address:**
Phase 1 (Schema design) -- define the JSONB schema contract and indexing strategy upfront. Document which keys are "promoted" vs. "flexible." Review every phase that adds new JSONB keys.

---

### Pitfall 9: BullMQ Autoregulation Jobs Failing Without Idempotency

**What goes wrong:**
The autoregulation engine processes a readiness score and adjusts the day's program. The BullMQ job partially completes (e.g., adjusts 3 of 6 exercises) then fails due to a transient database error. On retry, it adjusts all 6 exercises again, double-adjusting the first 3. The athlete sees nonsensical load prescriptions (e.g., weight reduced twice, from 100kg to 80kg to 64kg).

**Why it happens:**
BullMQ does not enforce idempotency. Jobs retry from the beginning on failure. If the job performs multiple side effects (database writes, notifications, analytics updates), partial completion followed by full retry produces corrupted state. BullMQ also lacks native fan-out -- developers hack it with event listeners that fire on every instance in a horizontally scaled deployment.

**How to avoid:**
- **Decompose into flows:** Use BullMQ's Flow pattern. One parent job ("adjust-daily-program") spawns child jobs per exercise ("adjust-exercise-{id}"). Each child is independently retryable and idempotent.
- **Idempotency keys:** Use `jobId` set to a deterministic key like `adjust-{userId}-{date}-{readinessScoreId}`. BullMQ deduplicates by job ID -- adding a job with an existing ID is silently ignored.
- **Transaction-per-exercise:** Each child job wraps its database writes in a transaction. Either the exercise is fully adjusted or not at all.
- **Status tracking:** Store adjustment status in the database (`pending`, `adjusted`, `skipped`). On retry, skip exercises already in `adjusted` state.
- **Fan-out via explicit job creation:** Do not use queue event listeners for fan-out. Instead, have the parent job explicitly add child jobs to the queue. This is predictable across horizontal scaling.

**Warning signs:**
- Athletes reporting unexpected load values after autoregulation runs.
- Job retry counts > 0 in BullMQ dashboard.
- Database showing duplicate adjustment records for the same exercise/date.
- Different server instances processing the same logical adjustment.

**Phase to address:**
Phase 4 (Autoregulation engine) -- but the BullMQ flow pattern should be established in Phase 1 as a standard for all async work.

---

### Pitfall 10: Monorepo Dependency Hell Between Next.js and Expo

**What goes wrong:**
Next.js and React Native require different versions of React, different bundlers (webpack/turbopack vs. Metro), and have conflicting expectations about module resolution. Native modules installed for Expo get hoisted to the monorepo root, where Next.js tries to resolve them and fails. Shared TypeScript packages import platform-specific code, causing build failures on the other platform. Build times balloon as both apps rebuild shared packages on every change.

**Why it happens:**
npm/yarn/pnpm workspace hoisting puts all dependencies at the root `node_modules`. Native modules that should only exist in the mobile app become visible to the web app. Metro (React Native bundler) and webpack/turbopack (Next.js) resolve modules differently. Shared packages that import from `react-native` break Next.js, and shared packages that use `"use client"` directives break React Native.

**How to avoid:**
- **Use pnpm workspaces** with `hoist: false` for native module packages. This prevents Expo native modules from polluting the Next.js resolution scope.
- **Strict platform-agnostic shared packages:** The shared `@level/core` package must have ZERO platform-specific imports. No `react-native`, no `next/*`, no `expo-*`. Only pure TypeScript types, validation schemas (Zod), and business logic.
- **Platform extension files:** For UI components that must differ, use `.web.tsx` and `.native.tsx` extensions. Both bundlers respect these conventions.
- **Separate TypeScript configs:** Each app and shared package gets its own `tsconfig.json` with explicit `paths` and `references`. Do not use a single root tsconfig.
- **Turborepo for build orchestration:** Cache build artifacts per-package. Shared packages only rebuild when their source changes, not on every app build.
- **Pin React version:** Use pnpm `overrides` (or yarn `resolutions`) to force a single React version across the entire monorepo. Multiple React versions cause the "Invalid Hook Call" error that is extremely confusing to debug.

**Warning signs:**
- "Module not found" errors that reference a native module in the Next.js build.
- TypeScript errors in shared packages that only appear in one platform's build.
- Build times exceeding 60 seconds for incremental changes.
- `npm ls react` showing multiple React versions.

**Phase to address:**
Phase 1 (Project scaffolding) -- the monorepo structure is foundational. Getting it wrong means pain in every subsequent phase. Use an established template (e.g., `create-expo-app` monorepo template or `t3-turbo`).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip offline sync testing on slow networks | Faster dev cycles | Sync bugs only surface in Caribbean field conditions (3G, packet loss) | Never -- use network link conditioner from Phase 1 |
| Store all load params in one JSONB blob | No migrations needed | Unindexable queries, type inconsistencies, 1000x performance cliff | MVP only if you document the promotion plan for frequently-queried keys |
| Use `cameraWithTensors` instead of native TFLite | Simpler JS-only setup | Unusable frame rates on mid-range Android | Never for real-time VBT |
| Single BullMQ job for full autoregulation pass | Simpler job design | Non-idempotent retries corrupt athlete programs | Never -- use flows from the start |
| Skip sticky sessions for Socket.io | Simpler LB config | Reconnection loops, lost messages, ghost sessions | Only acceptable with single-server deployment (Phase 1 dev) |
| JWT-only tier enforcement | Fast to implement | Bypass vulnerability during JWT staleness window | Never for paid features -- always pair with server-side check |
| Shared package imports platform code | Quick code sharing | Build failures on one platform, runtime crashes | Never -- enforce with ESLint rule |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Clerk + Fastify | Trusting JWT `publicMetadata` for tier checks without server-side verification | Read tier from Redis cache (updated on webhook) in Fastify `onRequest` hook. JWT is supplementary, not authoritative. |
| WatermelonDB + Drizzle ORM | Trying to share Drizzle schema types with WatermelonDB models | WatermelonDB has its own schema DSL. Maintain a shared TypeScript interface layer (`@level/types`) that both schemas conform to, but do not try to generate one from the other. |
| TimescaleDB + Drizzle | Drizzle has no native TimescaleDB support (no hypertable creation, no continuous aggregate DDL) | Use raw SQL migrations for TimescaleDB-specific DDL. Use Drizzle for standard CRUD. Do not fight the ORM. |
| Expo + react-native-vision-camera | VisionCamera requires native build (no Expo Go) | Use Expo Dev Client from day one. Do not develop with Expo Go if VBT is in scope -- the switch later is painful. |
| Meilisearch + Exercise Library | Indexing 500+ exercises with video URLs, expecting instant search | Index only searchable fields (name, muscle groups, equipment, tags). Store video URLs in PostgreSQL. Meilisearch is for search, not a document store. |
| Cloudflare R2 + Video Demos | Serving video directly from R2 without CDN caching | Use R2 with a Cloudflare Worker or R2 public bucket with Cache-Control headers. Direct R2 access without caching is slow and expensive at scale. |
| Apple Health / Google Health Connect | Requesting all health permissions upfront | Request permissions incrementally, only when the feature that needs them is first used. Blanket permission requests trigger user suspicion and rejection. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unscoped WatermelonDB queries on mobile | UI freezes during list rendering, especially workout history | Always use `.observe()` with `.extend()` for pagination. Never load full tables. | 500+ workout sessions per athlete |
| TimescaleDB continuous aggregate full-window rescan | Refresh jobs taking 10+ seconds, DB CPU spikes | Always set `start_offset` and `end_offset` in refresh policies. Use `timescaledb.materialized_only = false` for real-time reads. | 100K+ time-series rows per athlete |
| GIN index bloat on JSONB columns | Write latency increasing, disk usage growing faster than data | Use `jsonb_path_ops` operator class (2-3x smaller). Schedule regular `REINDEX CONCURRENTLY`. | 1M+ rows with varied JSONB structures |
| Socket.io broadcasting to all connections | Message delivery latency increasing, Redis Pub/Sub bandwidth saturating | Use rooms/namespaces. Only broadcast to relevant users (e.g., team room, not global). Use sharded Redis Pub/Sub adapter (Redis 7.0+). | 1K+ concurrent connections |
| MoveNet inference without adaptive quality | Consistent 5-8 FPS on Samsung A14/A15, device overheating | Detect device tier at startup. Reduce input resolution (192x192) and target 15 FPS minimum on low-end. Skip frames if needed. | Any mid-range Android device |
| Uncompressed sync payloads over Caribbean 3G | Sync taking 30+ seconds, timeouts, partial syncs | gzip all sync payloads. Implement delta sync (only changed fields, not full records). Set aggressive timeouts with retry. | Any user on 3G or spotty WiFi |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Tier capability map readable via API without authentication | Competitors see your pricing gates; users discover hidden features | Serve capability map only for the authenticated user's own tier. Never expose the full capability matrix. |
| Trainer can access any athlete's data by guessing UUID | Full data breach across organizational boundaries | Every API endpoint must verify `athlete.trainerId === currentUser.id` or team membership. Use Clerk organization membership, not just authentication. |
| Workout data sent over unencrypted sync | HIPAA-adjacent health data exposed on public WiFi | Enforce HTTPS for all sync. Pin certificates in the mobile app. WatermelonDB sync goes over HTTP -- your sync endpoint must be HTTPS-only. |
| BullMQ admin dashboard exposed without auth | Attacker can view, retry, or delete jobs (including autoregulation adjustments) | Put BullMQ Board behind authentication. Do not expose on a public port. Use Fastify route guards. |
| VBT camera feed processed server-side | Privacy violation -- athlete video leaves device | All pose estimation must happen on-device. Never send camera frames to the server. Only send extracted keypoint coordinates if needed for analytics. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring manual weight/rep entry for every set | 40% higher abandonment. Athletes in the middle of a set do not want to type. | Pre-fill from program prescription. One-tap confirm for "as prescribed." Only require input for deviations. Swipe-to-complete. |
| Daily readiness questionnaire with 10+ questions | Form fatigue within 2 weeks. Athletes skip it, breaking the autoregulation loop. | Maximum 4-5 questions. Use sliders not text input. Rotate non-critical questions (show 3 of 8 on any given day). Show "2 min" time estimate. Make it optional but incentivize with "streak" gamification. |
| Push notifications for every team message, PR, and system event | Notification fatigue leads to disabling all notifications, including critical ones (program updates, injury flags). | Default to minimal notifications (program changes, direct messages only). Let users granularly control categories. Batch social notifications into a daily digest. Never wake the device for non-urgent events. |
| Showing all analytics on one screen | Information overload. Trainers cannot find what matters. Athletes feel overwhelmed. | Progressive disclosure: summary card first, tap to expand. Role-specific defaults (trainers see team overview, athletes see personal trends). Limit initial view to 3 key metrics. |
| VBT setup requiring calibration before every session | Athletes skip VBT entirely because setup friction exceeds perceived value. | Auto-calibrate using the first warm-up set. No separate calibration step. Store camera position preferences per athlete. One-tap "Start VBT" that remembers last configuration. |
| Autoregulation adjustments presented as a wall of changes | Trainer cognitive overload. They approve everything without reviewing, defeating the purpose. | Group adjustments by severity (Red = must review, Green = auto-approved). Show only the delta, not the full program. Default to "accept all Green" with one-tap. Force review only for Red/Yellow. |
| Rest timer that blocks the entire screen | Athletes cannot review next set, check form notes, or message trainer during rest. | Floating/minimized rest timer. Full-screen only when <10 seconds remain. Allow navigation during rest with timer persisting in header. |
| Caribbean connectivity not tested until deployment | Sync failures, timeouts, incomplete uploads in real usage conditions | Use iOS Network Link Conditioner and Android network throttling during development. Test with 300kbps / 500ms latency / 5% packet loss profiles from Phase 1. |

## "Looks Done But Isn't" Checklist

- [ ] **Offline sync:** Works online, but test with airplane mode mid-sync. Does partial sync recover? Does the UI show sync status? Does the app remain usable during sync?
- [ ] **VBT tracking:** Works on developer's iPhone 15, but test on Samsung A14 with case on. Does it maintain 15+ FPS? Does it work in gym lighting (fluorescent, dim)?
- [ ] **Autoregulation:** Adjustments calculate correctly, but test the full loop: readiness -> adjustment -> trainer review -> athlete sees updated program. Does the trainer get notified? Can they override? Does the athlete see the override?
- [ ] **Subscription enforcement:** Pro features hidden in UI for Base users, but call the API endpoint directly with a Base user's token. Does it reject? Test during a downgrade -- is there a window of unauthorized access?
- [ ] **Chat messaging:** Messages send and receive, but test with 3G throttling, app backgrounding, and reconnection. Are messages delivered in order? Are read receipts accurate after reconnection?
- [ ] **Continuous aggregates:** Dashboard shows correct totals, but insert a workout and check the dashboard. How stale is the data? Is there a staleness indicator? Does it work across DST transitions?
- [ ] **Monorepo builds:** Both apps build, but modify a shared type. Do both apps pick up the change without manual rebuilds? Does the CI pipeline cache correctly?
- [ ] **Exercise search:** Meilisearch returns results, but test with Caribbean English spelling variations, partial words, and muscle group synonyms ("chest" vs "pectoral" vs "pecs").

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sync loop / corrupted local DB | LOW | Use `experimentalStrategy: 'replacement'` to do a full re-sync from server. User loses unsynced local data. |
| VBT memory leak crash mid-workout | MEDIUM | Auto-save to WatermelonDB every set completion. On app restart, detect incomplete session and offer "Resume Workout." Lost data limited to current set. |
| Stale continuous aggregates | LOW | Manual `CALL refresh_continuous_aggregate()` to force refresh. Add monitoring to prevent recurrence. |
| Double-applied autoregulation | HIGH | Requires manual review of affected programs. Add database audit log of all adjustments with before/after values to enable rollback. Build "undo adjustment" capability. |
| Subscription tier bypass | MEDIUM | Add server-side enforcement retroactively. Audit logs to identify affected accounts. No data loss, but potential revenue loss. |
| JSONB query performance cliff | HIGH | Requires schema migration to promote hot keys to columns. May need to rewrite queries and update application code. Plan this from Phase 1 to avoid it entirely. |
| Socket.io duplicate messages | LOW | Deduplicate on client by message ID. Add unique constraint on `(conversation_id, message_id)` in database. |
| Monorepo native module conflicts | MEDIUM | Isolate native modules with `pnpm` hoisting rules. May require restructuring `node_modules` and clearing caches. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Sync loop / multi-user contamination | Phase 1 (Foundation) | Automated test: sync with simulated conflict, verify resolution. Test logout/login cycle with different users. |
| TFLite bridge serialization | Phase 1 (Stack selection) | Benchmark frame rate on Samsung A14 before writing any VBT logic. Must hit 15+ FPS. |
| TensorFlow memory leaks | Phase 3/4 (VBT) | 60-minute soak test on mid-range device monitoring `tf.memory().numTensors` and native memory. |
| Continuous aggregate staleness | Phase 2 (Data layer) | Insert test data, verify aggregate refreshes within expected window. Test across mock DST transition. |
| Socket.io mobile state management | Phase 5 (Messaging) | Automated test: background app for 30s, send message, foreground app, verify delivery within 3s. |
| Subscription tier bypass | Phase 2 (Auth/Subscriptions) | Penetration test: call every tier-gated endpoint with each tier level. Verify 403 for unauthorized tiers. |
| JSONB query performance | Phase 1 (Schema design) | Load test with 500K rows, verify all JSONB queries use indexes via `EXPLAIN ANALYZE`. |
| BullMQ non-idempotent jobs | Phase 4 (Autoregulation) | Chaos test: kill worker mid-job, verify retry produces identical result. Check for duplicate database records. |
| Monorepo dependency conflicts | Phase 1 (Scaffolding) | CI check: both apps build from clean state. `pnpm ls react` shows single version. |
| UX: workout logging friction | Phase 3 (Workout logger) | User test: athlete logs a 5-exercise workout in under 3 minutes. Measure tap count per set. Target: 1-2 taps for "as prescribed." |
| UX: readiness form fatigue | Phase 4 (Readiness/Autoregulation) | Track completion rate over 2-week internal test. Must stay above 80%. |
| UX: notification overload | Phase 5 (Notifications) | Default notification config delivers <5 notifications/day for a typical athlete. |
| Caribbean connectivity | All Phases | Every feature tested with network link conditioner at 300kbps/500ms latency/5% packet loss. |

## Sources

- [WatermelonDB Sync Implementation](https://watermelondb.dev/docs/Implementation/SyncImpl) -- official sync architecture docs
- [WatermelonDB Sync Limitations](https://watermelondb.dev/docs/Sync/Limitations) -- official known limitations
- [WatermelonDB Sync FAQ](https://watermelondb.dev/docs/Sync/FAQ) -- UUID collision probability, replacement sync
- [WatermelonDB Issue #1309](https://github.com/Nozbe/WatermelonDB/issues/1309) -- "Cannot update a record with pending changes"
- [WatermelonDB Discussion #1542](https://github.com/Nozbe/WatermelonDB/discussions/1542) -- multi-user sync issues
- [react-native-fast-tflite](https://github.com/mrousavy/react-native-fast-tflite) -- native TFLite for React Native
- [Marc Rousavy: Pose Detection with VisionCamera V3 + TFLite](https://mrousavy.com/blog/VisionCamera-Pose-Detection-TFLite) -- recommended architecture for on-device pose estimation
- [MoveNet on TensorFlow Hub](https://www.tensorflow.org/hub/tutorials/movenet) -- Lightning vs Thunder tradeoffs
- [TimescaleDB Issue #6562](https://github.com/timescale/timescaledb/issues/6562) -- refresh policy writes no data when start_offset equals schedule_interval
- [TimescaleDB Issue #8898](https://github.com/timescale/timescaledb/issues/8898) -- DST refresh failure bug
- [TimescaleDB Continuous Aggregates: Real-Time vs Materialized-Only](https://dev.to/philip_mcclarence_2ef9475/timescaledb-continuous-aggregates-real-time-vs-materialized-only-4k75)
- [Scaling Socket.IO: Real-world challenges](https://ably.com/topic/scaling-socketio) -- comprehensive scaling pitfalls
- [Socket.IO Redis Adapter docs](https://socket.io/docs/v4/redis-adapter/) -- sharded Pub/Sub recommendation
- [BullMQ Idempotent Jobs](https://docs.bullmq.io/patterns/idempotent-jobs) -- official idempotency patterns
- [BullMQ Flows](https://docs.bullmq.io/patterns/flows) -- fan-out via parent/child jobs
- [PostgreSQL JSONB Index Pitfalls](https://vsevolod.net/postgresql-jsonb-index/) -- GIN index behavior and query planner issues
- [Avoiding JSONB Performance Bottlenecks](https://www.metisdata.io/blog/how-to-avoid-performance-bottlenecks-when-using-jsonb-in-postgresql) -- non-linear performance scaling
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/) -- official monorepo setup with autolinking
- [Fitness App UX Best Practices](https://www.zfort.com/blog/How-to-Design-a-Fitness-App-UX-UI-Best-Practices-for-Engagement-and-Retention) -- logging friction, retention patterns
- [From Download to Delete: Why Fitness Apps Fail](https://www.consagous.co/blog/from-download-to-delete-the-real-reasons-fitness-apps-fail-users) -- 97% churn statistic

---
*Pitfalls research for: Level -- fitness coaching platform with VBT, offline sync, and autoregulation*
*Researched: 2026-03-24*
