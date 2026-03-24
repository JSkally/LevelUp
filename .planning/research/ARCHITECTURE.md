# Architecture Patterns

**Domain:** Fitness coaching platform (offline-first mobile + real-time web portal)
**Researched:** 2026-03-24

## Recommended Architecture

**Pattern:** Modular monolith API with domain-bounded Fastify plugins, turborepo monorepo, offline-first mobile via WatermelonDB pull/push sync, real-time web via Socket.io + Redis Pub/Sub, async autoregulation via BullMQ workers, and TimescaleDB for time-series analytics.

### High-Level System Diagram

```
                        +------------------+
                        |   Cloudflare R2  |
                        |  (video/media)   |
                        +--------+---------+
                                 |
+-------------------+    +-------+--------+    +-------------------+
|  Next.js 15 Web   |    |  Fastify v5    |    | React Native/Expo |
|  (Coach Portal)   +--->+  Modular API   +<---+  (Athlete App)    |
|  Socket.io client |    |                |    |  WatermelonDB     |
+-------------------+    +--+---+---+--+--+    | TensorFlow.js     |
                            |   |   |  |       +-------------------+
                 +----------+   |   |  +----------+
                 |              |   |              |
          +------v-----+ +-----v---v---+ +--------v-------+
          | PostgreSQL  | |   Redis     | | Meilisearch    |
          | 16 +        | | Pub/Sub +   | | (exercise      |
          | TimescaleDB | | BullMQ      | |  search)       |
          +-------------+ +------+------+ +----------------+
                                 |
                          +------v------+
                          | BullMQ      |
                          | Workers     |
                          | (autoregul, |
                          |  notifs,    |
                          |  analytics) |
                          +-------------+
```

### Data Flow Summary

1. **Coach builds program** on web portal -> Fastify API -> PostgreSQL
2. **Athlete opens app** -> WatermelonDB pulls changes from API (programs, exercises, team assignments)
3. **Athlete logs workout** offline -> WatermelonDB stores locally -> pushes to API when connected
4. **Post-session feedback** submitted -> API enqueues BullMQ job -> autoregulation worker computes readiness + adjustments
5. **Adjustments ready** -> stored in PostgreSQL -> Socket.io pushes to coach portal in real-time; athlete pulls on next sync
6. **Analytics** -> workout data written to TimescaleDB hypertable -> continuous aggregates pre-compute ACWR, volume rollups -> API serves pre-computed data
7. **VBT during set** -> camera feed -> TensorFlow.js MoveNet on-device -> velocity computed locally -> results stored in WatermelonDB -> synced post-session

---

## Monorepo Structure

Use **Turborepo + pnpm workspaces**. This is the established pattern for Next.js + React Native/Expo monorepos with shared code.

```
level/
+-- turbo.json
+-- pnpm-workspace.yaml
+-- package.json
+-- apps/
|   +-- web/                    # Next.js 15 App Router (coach portal)
|   |   +-- src/
|   |   |   +-- app/            # App Router pages
|   |   |   +-- components/     # Web-only components
|   |   |   +-- hooks/          # Web-only hooks
|   |   |   +-- lib/            # Socket.io client, etc.
|   |   +-- next.config.ts
|   |   +-- package.json
|   |
|   +-- mobile/                 # React Native / Expo SDK 52+
|   |   +-- src/
|   |   |   +-- screens/
|   |   |   +-- components/     # Mobile-only components
|   |   |   +-- db/             # WatermelonDB models + sync
|   |   |   +-- vbt/            # TensorFlow.js VBT module
|   |   |   +-- hooks/
|   |   +-- app.json
|   |   +-- package.json
|   |
|   +-- api/                    # Fastify v5 modular monolith
|       +-- src/
|       |   +-- modules/        # Bounded context plugins
|       |   |   +-- auth/       # Clerk integration
|       |   |   +-- programs/   # Program builder CRUD
|       |   |   +-- workouts/   # Workout logging + sync
|       |   |   +-- athletes/   # Athlete profiles + teams
|       |   |   +-- analytics/  # TimescaleDB queries
|       |   |   +-- autoregulation/ # Readiness + adjustments
|       |   |   +-- messaging/  # Socket.io + chat
|       |   |   +-- billing/    # Subscription + tiers
|       |   |   +-- exercises/  # Exercise library + search
|       |   |   +-- notifications/ # Push notifications
|       |   |   +-- sync/       # WatermelonDB sync endpoints
|       |   +-- plugins/        # Cross-cutting Fastify plugins
|       |   |   +-- db.ts       # Drizzle + connection pool
|       |   |   +-- redis.ts    # Redis client
|       |   |   +-- auth.ts     # Clerk middleware
|       |   |   +-- tier-gate.ts # Subscription enforcement
|       |   |   +-- socket.ts   # Socket.io server setup
|       |   |   +-- queue.ts    # BullMQ connection
|       |   +-- workers/        # BullMQ worker processes
|       |   |   +-- autoregulation.worker.ts
|       |   |   +-- analytics.worker.ts
|       |   |   +-- notification.worker.ts
|       |   +-- server.ts
|       +-- drizzle/            # Migrations
|       +-- package.json
|
+-- packages/
    +-- db/                     # Drizzle ORM schemas (single source of truth)
    |   +-- src/
    |   |   +-- schema/         # All table definitions
    |   |   |   +-- users.ts
    |   |   |   +-- programs.ts
    |   |   |   +-- workouts.ts
    |   |   |   +-- exercises.ts
    |   |   |   +-- analytics.ts  # TimescaleDB hypertables
    |   |   |   +-- messaging.ts
    |   |   |   +-- subscriptions.ts
    |   |   +-- index.ts        # Re-exports
    |   +-- drizzle.config.ts
    |   +-- package.json
    |
    +-- shared/                 # Shared types, validators, constants
    |   +-- src/
    |   |   +-- types/          # TypeScript interfaces
    |   |   +-- validators/     # Zod schemas (API contracts)
    |   |   +-- constants/      # Tier definitions, readiness thresholds
    |   |   +-- utils/          # Pure functions (load calculations, ACWR formulas)
    |   +-- package.json
    |
    +-- ui/                     # Shared UI primitives (limited scope)
    |   +-- src/                # Only truly shared components
    |   +-- package.json
    |
    +-- config/                 # Shared tooling config
        +-- eslint/
        +-- tsconfig/
        +-- prettier/
```

**Key decisions:**

- **`packages/db`** holds all Drizzle schemas. The API imports them directly. The web app imports types only (not runtime schema). Mobile never imports this package -- it has its own WatermelonDB models.
- **`packages/shared`** is the critical bridge: Zod validators define API request/response shapes consumed by both web and mobile. Utility functions like ACWR calculation live here so the same formula runs on both client analytics views and server-side workers.
- **`packages/ui`** is deliberately thin. Web uses Next.js components; mobile uses React Native components. Only share truly universal primitives (e.g., color tokens, spacing scales, icon names). Do NOT try to share React components across web and mobile -- this is a common trap.
- **Workers run in the same `apps/api` package** but as separate processes. They share the same Drizzle schemas and module code but are started independently via `node workers/autoregulation.worker.ts`.

---

## Component Boundaries

| Component | Responsibility | Communicates With | Protocol |
|-----------|---------------|-------------------|----------|
| **Web Portal** (Next.js) | Coach UI: program builder, athlete management, analytics dashboards, messaging | API (HTTP + Socket.io) | REST + WebSocket |
| **Mobile App** (Expo) | Athlete UI: workout logging, VBT tracking, feedback, readiness checklist | API (HTTP for sync), local DB (WatermelonDB) | REST (sync endpoints) |
| **API Server** (Fastify) | Business logic, auth, sync, real-time events, job dispatch | PostgreSQL, Redis, Meilisearch, R2 | SQL, Redis protocol, HTTP |
| **BullMQ Workers** | Async processing: autoregulation, analytics aggregation, notifications | PostgreSQL (read/write), Redis (queue) | BullMQ protocol |
| **PostgreSQL + TimescaleDB** | Relational data + time-series analytics | API, Workers | SQL |
| **Redis** | Pub/Sub for Socket.io, BullMQ queue backend, session cache | API, Workers | Redis protocol |
| **Meilisearch** | Exercise library full-text search | API | HTTP |
| **Cloudflare R2** | Video demos, media storage | API (pre-signed URLs), clients (direct upload/download) | S3-compatible HTTP |
| **WatermelonDB** (on-device) | Offline data store, sync state tracking | Mobile app (local), API (sync) | SQLite (local), HTTP (sync) |
| **TensorFlow.js** (on-device) | Pose estimation for VBT bar tracking | Mobile app camera, local computation | In-process |

---

## Sync Architecture (WatermelonDB + API)

This is the most architecturally significant pattern in the system. Get it right early.

### Protocol

WatermelonDB uses a two-phase pull-then-push sync:

**Phase 1 -- Pull (GET /sync/pull)**

```
Request:  { lastPulledAt: timestamp | null, schemaVersion: number, migration: object | null }
Response: { changes: { [table]: { created: [], updated: [], deleted: [] } }, timestamp: number }
```

- If `lastPulledAt` is null, return ALL records the athlete has access to (first sync / full reset).
- Query: `SELECT * FROM [table] WHERE last_modified > $lastPulledAt AND athlete_id = $athleteId`
- The response `timestamp` is the server's `NOW()` at query start. Client stores this for next pull.
- All queries in a single pull MUST be consistent (use a transaction or read lock).

**Phase 2 -- Push (POST /sync/push)**

```
Request:  { changes: { [table]: { created: [], updated: [], deleted: [] } }, lastPulledAt: timestamp }
Response: 200 OK (or error with conflict details)
```

- Server applies changes inside a single transaction.
- Conflict detection: if a record's `last_modified > lastPulledAt`, reject the entire push and force a re-pull.
- WatermelonDB uses per-column conflict resolution: in conflict, server version wins EXCEPT for columns the client changed since last sync.

### Server-Side Sync Implementation

```typescript
// Simplified sync handler structure in apps/api/src/modules/sync/

// Every synced table needs:
// 1. A `last_modified` column (timestamptz, auto-updated via trigger)
// 2. A `deleted_at` column (soft deletes -- WatermelonDB needs to know about deletions)
// 3. A PostgreSQL trigger: UPDATE last_modified = NOW() on any row change

// Pull handler (Fastify route):
async function pullChanges(athleteId: string, lastPulledAt: number | null) {
  return db.transaction(async (tx) => {
    const timestamp = await tx.execute(sql`SELECT extract(epoch from NOW()) * 1000`);
    const since = lastPulledAt ? new Date(lastPulledAt) : new Date(0);

    // Query each synced table for changes since lastPulledAt
    // Scope to athlete's accessible data (their workouts, assigned programs, team data)
    const workouts = await getChanges(tx, 'workouts', since, athleteId);
    const sets = await getChanges(tx, 'workout_sets', since, athleteId);
    const programs = await getChanges(tx, 'programs', since, athleteId);
    // ... more tables

    return { changes: { workouts, sets, programs }, timestamp };
  });
}
```

### Which Tables Sync?

Not everything syncs to mobile. Only athlete-relevant data:

| Syncs to Mobile | Does NOT Sync |
|-----------------|---------------|
| Assigned programs + structure | All programs (only assigned ones) |
| Own workout logs + sets | Other athletes' data |
| Exercise library (read-only) | Admin data |
| Own readiness data | Billing / subscription internals |
| Own feedback submissions | Platform analytics |
| Adjustment proposals (read-only) | Message history (use pagination, not full sync) |
| Team roster (names only) | Full coach dashboard data |

### Sync Timing

- **On app launch:** Pull, then push
- **After workout completion:** Push immediately (background if app is backgrounded)
- **Periodic:** Every 5 minutes when app is foregrounded and connected
- **On demand:** Pull-to-refresh gesture
- **After reconnection:** Automatic sync when connectivity restored

---

## Real-Time Architecture (Socket.io + Redis Pub/Sub)

Real-time is for the **web portal only**. Mobile uses sync, not sockets.

### Why This Split

- Athletes train in gyms with spotty connectivity. WebSockets are unreliable there.
- WatermelonDB sync is designed for intermittent connectivity. Socket.io is not.
- The coach portal runs on stable connections (office/home WiFi). Real-time makes sense there.
- This avoids maintaining Socket.io connections on mobile, which drains battery and is fragile on cellular.

### Socket.io Architecture

```
Web Client (Coach Portal)
    |
    | Socket.io connection (namespace: /coach)
    v
Fastify + Socket.io Server
    |
    | Redis Pub/Sub adapter (@socket.io/redis-adapter)
    v
Redis
    ^
    | Publish events
    |
BullMQ Workers (when jobs complete)
API Routes (when data changes)
```

**Events the coach portal receives in real-time:**

| Event | Trigger | Payload |
|-------|---------|---------|
| `athlete:workout-completed` | Push sync from athlete | Summary stats |
| `athlete:readiness-submitted` | Push sync | Readiness score |
| `adjustment:ready` | Autoregulation worker completes | Proposed changes |
| `message:new` | Another user sends message | Message content |
| `athlete:vbt-session` | Push sync with VBT data | Velocity summary |

**Events the coach portal sends:**

| Event | Action | Effect |
|-------|--------|--------|
| `adjustment:approve` | Coach accepts proposed changes | Writes to DB, available on athlete's next sync |
| `message:send` | Coach sends message | Stored in DB, pushed to recipient if online |

### Room Structure

```
/coach namespace:
  room: team:{teamId}        -- coach + all athletes on team
  room: athlete:{athleteId}  -- direct coach-athlete channel
  room: coach:{coachId}      -- all of a coach's notifications
```

---

## Autoregulation Engine (BullMQ Async Jobs)

The autoregulation engine is the core differentiator. It must be async because it involves multi-table reads, statistical calculations, and potentially slow operations.

### Job Architecture

```
Trigger (API)                    Queue                      Worker
-----------                    -------                    --------
POST workout_complete     -->  readiness.compute     -->  ReadinessWorker
  (after push sync)                                         |
                                                            v
                                                    readiness score saved
                                                            |
                                                            v
                              adjustment.propose   -->  AdjustmentWorker
                                                         |
                                                         v
                                                   proposed changes saved
                                                         |
                                                         v
                                                   Socket.io event to coach
```

### Queue Design

Use **named queues** with dedicated workers per domain concern:

| Queue | Jobs | Concurrency | Priority |
|-------|------|-------------|----------|
| `readiness` | `compute-score`, `aggregate-weekly` | 5 | High |
| `adjustment` | `propose-changes`, `apply-approved` | 3 | High |
| `analytics` | `refresh-acwr`, `volume-rollup`, `1rm-update` | 10 | Medium |
| `notifications` | `push-notify`, `email-digest` | 20 | Low |
| `search` | `index-exercise`, `reindex-library` | 2 | Low |

### Readiness Scoring Job

```typescript
// workers/autoregulation.worker.ts (conceptual structure)

interface ReadinessInput {
  athleteId: string;
  workoutId: string;
  sessionDate: string;
}

async function computeReadiness(job: Job<ReadinessInput>) {
  const { athleteId, workoutId, sessionDate } = job.data;

  // 1. Fetch subjective data (pre-training checklist: sleep, stress, soreness, motivation)
  const subjective = await getSubjectiveReadiness(athleteId, sessionDate);

  // 2. Fetch objective data (ACWR from continuous aggregates, recent training load)
  const acwr = await getACWR(athleteId, sessionDate);       // From TimescaleDB
  const monotony = await getMonotony(athleteId, sessionDate);
  const strain = await getStrain(athleteId, sessionDate);

  // 3. Fetch post-session feedback from last workout (sRPE, pump quality, joint pain)
  const feedback = await getSessionFeedback(athleteId, workoutId);

  // 4. Compute composite score (0-100) using trainer-configured weights
  const trainerConfig = await getTrainerWeights(athleteId);
  const score = computeCompositeScore(subjective, acwr, monotony, strain, feedback, trainerConfig);

  // 5. Determine zone: Green (80-100), Gray (60-79), Yellow (40-59), Red (0-39)
  const zone = determineZone(score, trainerConfig.thresholds);

  // 6. Save readiness record
  await saveReadinessScore(athleteId, sessionDate, score, zone, components);

  // 7. If not Green, enqueue adjustment job
  if (zone !== 'green') {
    await adjustmentQueue.add('propose-changes', {
      athleteId,
      readinessScore: score,
      zone,
      targetDate: nextTrainingDate(athleteId),
    });
  }

  return { score, zone };
}
```

### Adjustment Proposal Job

```typescript
async function proposeAdjustments(job: Job<AdjustmentInput>) {
  const { athleteId, zone, targetDate } = job.data;

  // 1. Load the scheduled workout for targetDate
  const scheduledWorkout = await getScheduledWorkout(athleteId, targetDate);

  // 2. Apply graduated thresholds per zone
  const rules = {
    gray:   { volumeReduction: 0.10, intensityReduction: 0.00, message: 'Slight volume reduction' },
    yellow: { volumeReduction: 0.25, intensityReduction: 0.05, message: 'Moderate reduction' },
    red:    { volumeReduction: 0.50, intensityReduction: 0.15, message: 'Significant deload' },
  };

  // 3. Check trainer custom rules (overrides)
  const customRules = await getTrainerRules(athleteId);

  // 4. Generate per-exercise adjustments
  const adjustments = scheduledWorkout.exercises.map(exercise => ({
    exerciseId: exercise.id,
    originalSets: exercise.sets,
    proposedSets: applyAdjustment(exercise.sets, rules[zone], customRules),
    reason: rules[zone].message,
  }));

  // 5. Save as pending proposals (coach must approve/reject each)
  await saveProposals(athleteId, targetDate, adjustments, zone);

  // 6. Notify coach in real-time
  await redis.publish(`coach:${coachId}:adjustments`, JSON.stringify({
    type: 'adjustment:ready',
    athleteId,
    zone,
    exerciseCount: adjustments.length,
  }));
}
```

### Job Reliability

- **Retry policy:** 3 attempts with exponential backoff (1s, 4s, 16s)
- **Dead letter queue:** Failed jobs after all retries move to DLQ for manual inspection
- **Idempotency:** Each job checks if result already exists before computing (dedup on `athleteId + date`)
- **Stale job cleanup:** Jobs older than 24 hours are auto-removed from completed/failed sets

---

## TimescaleDB Analytics Architecture

### Hypertable Design

The `workout_sets` table is the primary time-series table. Convert it to a hypertable partitioned by `completed_at`:

```sql
-- Core time-series table
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES users(id),
  workout_id UUID NOT NULL REFERENCES workouts(id),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  completed_at TIMESTAMPTZ NOT NULL,
  load_params JSONB NOT NULL,  -- { weight, reps, rpe, rir, velocity, tempo }
  computed_volume NUMERIC GENERATED ALWAYS AS ((load_params->>'weight')::numeric * (load_params->>'reps')::numeric) STORED,
  computed_intensity NUMERIC,  -- estimated 1RM percentage
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT create_hypertable('workout_sets', 'completed_at');
```

### Continuous Aggregates

```sql
-- Daily volume per athlete per exercise (auto-refreshed)
CREATE MATERIALIZED VIEW daily_volume
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', completed_at) AS day,
  athlete_id,
  exercise_id,
  SUM(computed_volume) AS total_volume,
  COUNT(*) AS total_sets,
  AVG((load_params->>'rpe')::numeric) AS avg_rpe
FROM workout_sets
GROUP BY day, athlete_id, exercise_id;

-- Weekly rollup (hierarchical aggregate on top of daily)
CREATE MATERIALIZED VIEW weekly_volume
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('7 days', day) AS week,
  athlete_id,
  SUM(total_volume) AS weekly_volume,
  SUM(total_sets) AS weekly_sets,
  AVG(avg_rpe) AS avg_rpe
FROM daily_volume
GROUP BY week, athlete_id;

-- ACWR view (acute = 7-day sum, chronic = 28-day rolling average of weekly)
-- This is computed by the analytics worker, not a continuous aggregate,
-- because it requires windowing over the weekly aggregate.
```

### Refresh Policy

```sql
-- Refresh daily aggregates every 30 minutes, up to 2 hours ago
SELECT add_continuous_aggregate_policy('daily_volume',
  start_offset => INTERVAL '7 days',
  end_offset => INTERVAL '2 hours',
  schedule_interval => INTERVAL '30 minutes');

-- Refresh weekly aggregates every 6 hours
SELECT add_continuous_aggregate_policy('weekly_volume',
  start_offset => INTERVAL '28 days',
  end_offset => INTERVAL '1 day',
  schedule_interval => INTERVAL '6 hours');
```

**ACWR computation** runs as a BullMQ analytics job (not a continuous aggregate) because it requires rolling window calculations across the weekly aggregates. The job reads from `weekly_volume`, computes acute:chronic ratios, and writes results to a `readiness_metrics` table.

---

## VBT (Velocity-Based Training) On-Device Architecture

All VBT computation happens on-device. Zero server round-trips during a set.

### Pipeline

```
Camera Frame (30fps)
    |
    v
TensorFlow.js + MoveNet (SinglePose.Lightning)
    |
    v
17 Keypoint Detection (wrists, elbows, shoulders, hips)
    |
    v
Bar Position Estimation (midpoint of wrist keypoints)
    |
    v
Kalman Filter (smooth noisy position data)
    |
    v
Velocity Calculation (displacement / time between frames)
    |
    v
Rep Detection (local min/max of bar position = rep boundaries)
    |
    v
Per-Rep Metrics: peak velocity, mean velocity, ROM
    |
    v
Real-Time Display + Fatigue Detection (velocity drop > threshold)
    |
    v
Store in WatermelonDB -> Sync to server post-session
```

### Model Choice

Use **MoveNet SinglePose.Lightning** (not Thunder). Lightning runs at 30+ FPS on mid-range Android (Samsung A-series), which is a hard requirement. Thunder is more accurate but too slow for real-time on target devices.

### Architecture in Mobile App

```
mobile/src/vbt/
+-- VBTCamera.tsx          # Camera component with TF.js overlay
+-- usePoseDetection.ts    # Hook: camera frame -> keypoints
+-- useBarTracking.ts      # Hook: keypoints -> bar position + velocity
+-- kalmanFilter.ts        # Noise reduction for position data
+-- repDetector.ts         # State machine: detect rep start/end
+-- velocityCalculator.ts  # Frame-to-frame displacement -> velocity
+-- fatigueDetector.ts     # Velocity drop percentage across reps
+-- types.ts               # VBT-specific types
```

**Critical constraint:** The VBT module must be fully self-contained with no network dependencies during operation. It reads exercise-specific settings (velocity targets, fatigue thresholds) from WatermelonDB at set start and writes results back to WatermelonDB at set completion.

---

## Subscription Tier Enforcement (Dual Layer)

### API Middleware Layer (Fastify Plugin)

```typescript
// plugins/tier-gate.ts
// Registered as a Fastify plugin with encapsulation

const tierGate = (requiredCapability: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;  // From Clerk auth
    const capabilities = user.subscription.capabilities;  // JSONB from DB

    if (!capabilities[requiredCapability]) {
      reply.code(403).send({
        error: 'upgrade_required',
        requiredTier: getMinimumTier(requiredCapability),
        currentTier: user.subscription.tier,
      });
    }
  };
};

// Usage in route:
fastify.get('/analytics/advanced', {
  preHandler: [authenticate, tierGate('advanced_analytics')],
  handler: advancedAnalyticsHandler,
});
```

### UI Layer (Feature Flags)

```typescript
// packages/shared/src/constants/tiers.ts
export const TIER_CAPABILITIES = {
  base: {
    max_athletes: 5,
    program_builder: true,
    basic_analytics: true,
    advanced_analytics: false,
    vbt_tracking: false,
    autoregulation: false,
    custom_rules: false,
    api_export: false,
  },
  pro: {
    max_athletes: 25,
    program_builder: true,
    basic_analytics: true,
    advanced_analytics: true,
    vbt_tracking: true,
    autoregulation: true,
    custom_rules: false,
    api_export: false,
  },
  elite: {
    max_athletes: -1,  // unlimited
    program_builder: true,
    basic_analytics: true,
    advanced_analytics: true,
    vbt_tracking: true,
    autoregulation: true,
    custom_rules: true,
    api_export: true,
  },
} as const;
```

The JSONB capability map lives in the database per-user, defaulting to the tier's base capabilities. This allows per-user overrides without schema changes. Both the API middleware and the UI `useCapability()` hook read from the same source of truth (`packages/shared`).

---

## Patterns to Follow

### Pattern 1: Fastify Bounded Context Plugins

Each domain module is a self-contained Fastify plugin with its own routes, services, and validation schemas. Plugins communicate via the Fastify instance (dependency injection through decorators), not direct imports between modules.

```typescript
// modules/programs/index.ts
import { FastifyPluginAsync } from 'fastify';
import { programRoutes } from './routes';
import { ProgramService } from './service';

const programsModule: FastifyPluginAsync = async (fastify) => {
  // Register service as decorator (available only within this plugin's scope)
  const service = new ProgramService(fastify.db, fastify.redis);
  fastify.decorate('programService', service);

  // Register routes
  await fastify.register(programRoutes, { prefix: '/programs' });
};

export default programsModule;
```

**Why:** Fastify's encapsulation model means plugins cannot access each other's decorators by default. This enforces boundaries. When modules need to communicate, they do so through explicit interfaces (events or shared services registered at the parent scope).

### Pattern 2: Event-Driven Inter-Module Communication

Modules that need to react to other modules' actions use an internal event bus (not Socket.io -- that is for external clients only).

```typescript
// When a workout is pushed via sync:
fastify.eventBus.emit('workout:completed', { athleteId, workoutId });

// Autoregulation module listens:
fastify.eventBus.on('workout:completed', async ({ athleteId, workoutId }) => {
  await readinessQueue.add('compute-score', { athleteId, workoutId });
});

// Analytics module also listens:
fastify.eventBus.on('workout:completed', async ({ athleteId, workoutId }) => {
  await analyticsQueue.add('refresh-acwr', { athleteId });
});
```

**Implementation:** Use Node.js `EventEmitter` or a lightweight typed event bus. Keep it in-process -- no need for external event streaming at this scale.

### Pattern 3: Sync Endpoint as Gateway

The sync module is the single entry point for all mobile data exchange. It translates between WatermelonDB's table-based change format and the internal module services.

```
POST /sync/push
  -> Parse changes by table
  -> Route to appropriate module service (workouts, feedback, readiness)
  -> Each module validates and persists in its own transaction
  -> Emit domain events for completed operations
  -> Return 200

GET /sync/pull
  -> Query each module for changes since lastPulledAt
  -> Scope to requesting athlete's data
  -> Combine into WatermelonDB response format
  -> Return with server timestamp
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Sharing React Components Between Web and Mobile

**What:** Creating a universal component library that works on both React DOM and React Native.
**Why bad:** React Native components are fundamentally different from DOM components. Abstractions like `react-native-web` add complexity and compromise both platforms. NativeWind/Tamagui help but create maintenance burden.
**Instead:** Share types, validators, utility functions, and constants. Build platform-specific components that are native to each platform's idioms.

### Anti-Pattern 2: Socket.io on Mobile

**What:** Maintaining persistent WebSocket connections from the React Native app.
**Why bad:** Drains battery, unreliable on cellular (especially Caribbean mobile networks), conflicts with WatermelonDB's sync model, requires background socket management.
**Instead:** Mobile uses pull/push sync. Push notifications (FCM/APNs) alert the athlete to open the app and sync.

### Anti-Pattern 3: Computing Analytics on Read

**What:** Running ACWR or volume calculations when the coach views the dashboard.
**Why bad:** Multi-week window aggregations over growing dataset become slow. Coach sees loading spinners instead of data.
**Instead:** Pre-compute via TimescaleDB continuous aggregates and BullMQ analytics workers. Dashboard reads pre-computed results.

### Anti-Pattern 4: Sync Everything

**What:** Syncing the entire database to mobile.
**Why bad:** First sync takes forever. Storage fills up on mid-range devices. Most data is irrelevant to the athlete.
**Instead:** Sync only athlete-scoped data. Messages use pagination (not sync). Exercise library syncs on first launch, then incrementally.

### Anti-Pattern 5: Monolithic BullMQ Worker

**What:** One worker process handling all job types.
**Why bad:** A slow analytics job blocks time-sensitive readiness computation. Cannot scale job types independently.
**Instead:** Separate worker processes per queue. Scale notification workers to 20 concurrency; keep readiness workers at 5 with higher priority.

---

## Suggested Build Order

Build order is driven by data flow dependencies. You cannot build downstream features without upstream foundations.

```
Phase 1: Foundation
  +-- Monorepo setup (Turborepo + pnpm)
  +-- Database schemas (Drizzle + PostgreSQL + TimescaleDB)
  +-- Fastify server skeleton with plugin architecture
  +-- Clerk auth integration
  +-- Basic user/role management

Phase 2: Core Data Model
  +-- Exercise library (schema + Meilisearch indexing + CRUD)
  +-- Program builder data model (Program -> Macrocycle -> Week -> Day -> Exercise -> Sets)
  +-- Program CRUD API
  +-- Web portal: Program builder UI

Phase 3: Athlete + Sync
  +-- WatermelonDB mobile models (mirror server schemas)
  +-- Sync endpoints (pull + push)
  +-- Mobile app: workout logging (offline-capable)
  +-- Team management (assignment of programs to athletes)

Phase 4: Feedback Loop
  +-- Post-session feedback (sRPE, pump, joint pain)
  +-- Readiness checklist (pre-training)
  +-- BullMQ infrastructure + readiness worker
  +-- Readiness scoring computation

Phase 5: Autoregulation
  +-- Adjustment proposal engine
  +-- Coach approval UI (web portal, real-time via Socket.io)
  +-- Trainer custom rule builder
  +-- Socket.io real-time infrastructure

Phase 6: Analytics + VBT
  +-- TimescaleDB continuous aggregates
  +-- Analytics dashboard (web portal)
  +-- TensorFlow.js VBT module (mobile)
  +-- 1RM estimation engine

Phase 7: Engagement + Billing
  +-- Messaging (Socket.io web, async mobile)
  +-- Push notifications (FCM/APNs)
  +-- Subscription tiers + billing integration
  +-- Feature flag enforcement
  +-- Leaderboards, PR celebrations

Phase 8: Polish
  +-- Wearable data pipeline (Apple Health / Google Health Connect)
  +-- Data export (CSV/JSON/PDF)
  +-- Onboarding tutorials
  +-- Performance optimization
  +-- Dark/light mode
```

**Why this order:**
- Phases 1-2 establish the data foundation. Everything else depends on having exercises and programs in the database.
- Phase 3 (sync) must come before any mobile feature. The sync protocol is the backbone of the mobile experience.
- Phase 4 (feedback) must precede Phase 5 (autoregulation) because the autoregulation engine consumes feedback data.
- Phase 6 (analytics + VBT) can partially parallelize with Phase 5 since they share the time-series data model but are otherwise independent.
- Phase 7 (billing) is deliberately late -- build value before gating it. Billing is also complex and benefits from a stable data model.

---

## Scalability Considerations

| Concern | At 100 athletes | At 10K athletes | At 100K athletes |
|---------|-----------------|-----------------|-------------------|
| **Database** | Single PostgreSQL instance | Read replicas for analytics queries | Shard by team/organization |
| **Sync** | Single API instance handles all | Rate-limit sync frequency; batch pull queries | Dedicated sync service, CDN for exercise library |
| **BullMQ** | Single worker process per queue | Scale worker replicas horizontally | Separate Redis instances per queue domain |
| **Socket.io** | Single server, no Redis adapter needed | Redis adapter for multi-instance | Dedicated Socket.io cluster behind sticky LB |
| **TimescaleDB** | Negligible overhead | Continuous aggregates critical | Compression policies for old data, distributed hypertables |
| **Meilisearch** | Single instance | Still single instance (exercise library is bounded) | Still single instance |
| **VBT** | N/A (on-device) | N/A (on-device) | N/A (on-device) |

---

## Sources

### Official Documentation (HIGH confidence)
- [WatermelonDB Sync Backend](https://watermelondb.dev/docs/Sync/Backend)
- [WatermelonDB Sync Frontend](https://watermelondb.dev/docs/Sync/Frontend)
- [WatermelonDB Sync Implementation](https://watermelondb.dev/docs/Implementation/SyncImpl)
- [Socket.IO Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [Fastify Plugins Guide](https://fastify.dev/docs/latest/Guides/Plugins-Guide/)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)
- [TimescaleDB Continuous Aggregates](https://docs.timescale.com/use-timescale/latest/continuous-aggregates/about-continuous-aggregates/)
- [TensorFlow.js React Native](https://www.tensorflow.org/js/tutorials/applications/react_native)
- [MoveNet Pose Detection](https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/src/movenet/README.md)
- [BullMQ Documentation](https://docs.bullmq.io/)

### Community Sources (MEDIUM confidence)
- [Turborepo Monorepo 2025: Next.js + React Native](https://medium.com/@MissLucina/turborepo-monorepo-in-2025-next-js-react-native-shared-ui-type-safe-api-%EF%B8%8F-5f79ad6b8095)
- [Building a Modular Monolith with Fastify (Matteo Collina)](https://gitnation.com/contents/building-a-modular-monolith-with-fastify)
- [Fuelstack Monorepo Starter (Turborepo + Fastify + Drizzle)](https://github.com/riipandi/fuelstack)
- [Shared Database Schema with Drizzle ORM and Turborepo](https://pliszko.com/blog/post/2023-08-31-shared-database-schema-with-drizzleorm-and-turborepo)
- [Offline-First with Expo, WatermelonDB, and Supabase](https://supabase.com/blog/react-native-offline-first-watermelon-db)
- [AI Workout Form Corrector with React Native + TensorFlow.js](https://www.wellally.tech/blog/build-ai-workout-form-corrector-react-native-tensorflow)
