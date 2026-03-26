# Requirements: Level

**Version:** v1.0 (MVP → Full Platform)
**Status:** Active
**Source:** Master Build Prompt v1.0 + Domain Research

---

## v1 Requirements

### Foundation & Infrastructure

- [x] **INFRA-01**: Monorepo configured with Turborepo + pnpm workspaces (`apps/web`, `apps/mobile`, `apps/api`, `packages/db`, `packages/shared`) — 01-01
- [x] **INFRA-02**: Shared Drizzle ORM schema in `packages/db` consumed by both API and type-safe clients — 01-01
- [x] **INFRA-03**: Shared Zod validators and TypeScript types in `packages/shared` — 01-01
- [x] **INFRA-04**: CI/CD pipeline via GitHub Actions (lint, type-check, test, build, deploy) — 01-01 (workflow created; deploy step in 01-02+)
- [x] **INFRA-05**: Docker + AWS ECS Fargate deployment with Cloudflare CDN
- [x] **INFRA-06**: Sentry error monitoring + Grafana Cloud observability
- [x] **INFRA-07**: Expo EAS (Build + Update) for mobile deployment

### Authentication & User Management

- [x] **AUTH-01**: User can register with email/password via Clerk
- [x] **AUTH-02**: User can log in and maintain authenticated session across web and mobile
- [x] **AUTH-03**: User can reset password via email link
- [x] **AUTH-04**: JWT tokens validated at API middleware with role claims embedded
- [x] **AUTH-05**: Role assigned at registration or by admin: Athlete, Trainer, Admin, Assistant Coach
- [x] **AUTH-06**: Admin can promote/demote user roles from management dashboard
- [x] **AUTH-07**: Assistant Coach sub-role can view and log on behalf of assigned athletes but cannot create programs or modify tiers

### Subscription Tiers

- [x] **TIER-01**: Subscription tiers stored as JSONB capability map in `subscription_tiers` table (Base, Pro, Elite defaults)
- [x] **TIER-02**: Feature gating enforced at API middleware (hard 403 with machine-readable upgrade context)
- [x] **TIER-03**: Feature gating enforced at UI layer (soft gate showing locked state with upgrade prompt)
- [x] **TIER-04**: Admin can configure tier capabilities via visual tier editor without schema migrations
- [x] **TIER-05**: Tier-gated features include: messaging, VBT, analytics depth, program templates, readiness engine, multi-modality tracking, sport-specific assessments
- [x] **TIER-06**: Caribbean currency display in subscription management (JMD, TTD, BBD, GYD, BSD, XCD with USD as base)

### Teams & Organisation

- [ ] **TEAM-01**: Trainer can create named Teams with description
- [ ] **TEAM-02**: Trainer can add/remove athletes from teams; athletes can belong to multiple teams
- [ ] **TEAM-03**: Programs can be assigned to a Team, automatically enrolling all current members
- [ ] **TEAM-04**: Team-level analytics aggregations: average readiness, total volume, compliance rate
- [ ] **TEAM-05**: Assistant Coaches can be assigned to specific teams

### Exercise Library

- [ ] **EXLIB-01**: Exercise database seeded with 500+ exercises across all equipment categories (barbell, dumbbell, kettlebell, machine, cable, bodyweight, band, specialty)
- [ ] **EXLIB-02**: Each exercise stores: name, slug, coaching cues, primary/secondary muscles, equipment, movement pattern, chain classification, category, sport tags, difficulty, is_custom, created_by
- [ ] **EXLIB-03**: Full-text search via Meilisearch with typo tolerance, synonym support, and <50ms results
- [ ] **EXLIB-04**: Faceted filtering by muscle group, equipment, movement pattern, chain, category, sport, difficulty, custom tags
- [ ] **EXLIB-05**: "Similar exercises" suggestions based on shared muscle group and movement pattern
- [ ] **EXLIB-06**: Trainer can create custom exercises scoped to their account
- [ ] **EXLIB-07**: Custom exercises can be submitted for global library inclusion (admin-approved workflow)
- [ ] **EXLIB-08**: Every exercise has at least one demo video stored on Cloudflare R2 with adaptive streaming (360p/720p/1080p)
- [ ] **EXLIB-09**: Video thumbnails auto-generated from midpoint of clip
- [ ] **EXLIB-10**: Video player supports slow-motion playback (0.25x, 0.5x)
- [ ] **EXLIB-11**: Trainer can upload custom demo videos or override default videos for custom exercises

### Program Builder

- [ ] **PROG-01**: Trainer can create, edit, and manage programs from both web portal and mobile app
- [ ] **PROG-02**: Web builder has drag-and-drop reordering (dnd-kit) at all hierarchy levels with keyboard shortcuts and bulk operations
- [ ] **PROG-03**: Mobile builder provides full CRUD via bottom-sheet modals, swipe gestures, and contextual menus
- [ ] **PROG-04**: Program hierarchy: Program → Macrocycle/Phase → Week → Day → Exercise → Sets (each level has name, description, sort order, annotations)
- [ ] **PROG-05**: Macrocycles have a `goal_description` field for periodisation context
- [ ] **PROG-06**: Weeks have a `deload` boolean flag (visual tag + triggers automatic volume reduction rules)
- [ ] **PROG-07**: Days support superset grouping (superset, triset, giant set) via shared `superset_group` integer
- [ ] **PROG-08**: Load parameters per set stored as JSONB — Intensity (weight_kg, weight_lb, weight_pct_1rm, weight_range, rpe, rir), Volume (reps, rep_range, time_seconds, distance_meters), Velocity (velocity_target_ms, velocity_range, velocity_cutoff_ms), Execution (tempo, partial_reps, eccentric_only, concentric_only), Advanced (drop_set_config, pyramid_config, cluster_set_config, myo_reps, amrap), Recovery (rest_seconds, rest_range), Extensibility (custom_metrics)
- [ ] **PROG-09**: Set type enum: working, warmup, backoff, drop, amrap, cluster, myo_rep, top_set, feeder
- [ ] **PROG-10**: Load parameter UI shows common params by default (weight, reps, RPE, rest); advanced params behind "Advanced" toggle; trainer can configure a standard set in <3 seconds
- [ ] **PROG-11**: Trainer can save any program as a reusable template
- [ ] **PROG-12**: Templates can be cloned into new programs and assigned to different clients
- [ ] **PROG-13**: 20+ professionally-designed starter program templates ship with the platform (beginner general fitness, intermediate hypertrophy, powerlifting peaking, Olympic weightlifting, sport-specific S&C, corporate wellness)
- [ ] **PROG-14**: Program model includes `is_marketplace`, `price_usd`, `preview_description` fields (marketplace UI deferred; data model required)
- [ ] **PROG-15**: Program changes sync in real-time via WebSocket between web and mobile
- [ ] **PROG-16**: Trainer can assign a program to individual clients or to a Team

### Workout Logging & Session Execution

- [ ] **LOG-01**: Athlete opens today's assigned day and sees all exercises with prescribed parameters
- [ ] **LOG-02**: Frictionless set logging: UI pre-fills prescribed values; athlete changes only what differs; auto-advances to next set on confirmation
- [ ] **LOG-03**: Built-in rest timer starts automatically after set completion with configurable default per exercise; visual countdown with haptic/audio alert
- [ ] **LOG-04**: Plate calculator: given target weight and bar weight, shows plates per side for both kg and lb with configurable plate inventory
- [ ] **LOG-05**: Previous performance overlay: slide-up panel showing last session's values for same exercise (weight, reps, RPE, velocity if available) without navigating away
- [ ] **LOG-06**: Warm-up calculator: auto-generates warm-up ramp from working weight following standard protocols (configurable)
- [ ] **LOG-07**: In-session notes: voice-to-text or typed notes per exercise or per set
- [ ] **LOG-08**: Athlete can log workouts with full functionality with zero internet connectivity (offline-first)

### Offline Sync

- [ ] **SYNC-01**: Mobile app uses WatermelonDB for local storage with pull-then-push sync protocol
- [ ] **SYNC-02**: Conflict resolution uses last-write-wins with client-generated UUIDs
- [ ] **SYNC-03**: Conflict log available for trainer review in case of sync disputes
- [ ] **SYNC-04**: Exercise demo videos are pre-cacheable for offline viewing (athlete selects programs to download)
- [ ] **SYNC-05**: Sync handles intermittent Caribbean mobile connectivity gracefully (retry without re-pulling, session isolation on logout)

### Post-Session Feedback

- [ ] **FEED-01**: After session, athlete is prompted with: session RPE (1-10), pump quality per muscle group (1-5), joint/connective tissue feedback (selectable body map with severity), per-exercise thumbs up/down on prescribed load, free-text notes
- [ ] **FEED-02**: Persistent joint pain reports trigger automatic push notification to trainer
- [ ] **FEED-03**: Post-session feedback stored and consumed by autoregulation engine (consistent thumbs-down flags for trainer + proposes 1RM recalibration; persistent soreness flags volume for review)

### Multi-Modality Training

- [ ] **MODAL-01**: Athlete can log non-strength training sessions: Running/Sprinting, Swimming, Cycling, Sport Practice, Conditioning/Cardio, Flexibility/Mobility/Recovery, Custom Modality
- [ ] **MODAL-02**: Each modality has its own logging schema with appropriate fields (distance, pace, stroke type, sport type, intensity, heart rate, etc.)
- [ ] **MODAL-03**: Custom modality supports name, duration, intensity, free-text description, and custom metric fields
- [ ] **MODAL-04**: All modalities contribute to unified weekly Internal Training Load (ITL = duration × session RPE)
- [ ] **MODAL-05**: Acute:Chronic Workload Ratio (ACWR) calculated as rolling 7-day / rolling 28-day load per modality AND combined total
- [ ] **MODAL-06**: ACWR sweet spot 0.8–1.3; values >1.5 trigger overtraining alert; values <0.6 trigger detraining warning
- [ ] **MODAL-07**: Strength-specific volume tracked separately: total, anterior chain, posterior chain, squat, bench, deadlift, snatch, clean & jerk, custom groupings
- [ ] **MODAL-08**: Training monotony and strain calculated; high monotony (>2.0) with high strain flagged as injury risk

### Wearable & External Data Integration

- [ ] **WEAR-01**: Apple Health sync: import heart rate, sleep data (duration, stages), step count, active energy, workout sessions
- [ ] **WEAR-02**: Google Health Connect sync: same data fields as Apple Health
- [ ] **WEAR-03**: External sleep data auto-populates readiness checklist sleep fields
- [ ] **WEAR-04**: `external_data_sources` table and normalised data schema in place to support future Garmin/Whoop/Oura/Polar integrations

### VBT & Computer Vision

- [ ] **VBT-01**: Mobile app captures video via device camera (VisionCamera v4 + react-native-fast-tflite) during a set
- [ ] **VBT-02**: On-device MoveNet pipeline detects barbell endpoints, extracts bar path coordinates frame-by-frame
- [ ] **VBT-03**: Calculates per-set: mean concentric velocity, peak concentric velocity, mean propulsive velocity, eccentric velocity, eccentric tempo, range of motion, bar path deviation
- [ ] **VBT-04**: Bar path quality scoring compares against ideal path template per exercise, deviations scored and visualised
- [ ] **VBT-05**: Live velocity display during set with colour coding (green = above target, yellow = near, red = below)
- [ ] **VBT-06**: Optional audio velocity callout per rep in real-time
- [ ] **VBT-07**: Velocity cutoff alert (visual + haptic) when velocity drops below prescribed `velocity_cutoff_ms`; recommendation not forced stop
- [ ] **VBT-08**: Fatigue detection: velocity decay rate compared against athlete's historical baseline for that exercise/load; warning displayed if exceeded
- [ ] **VBT-09**: Full-body pose estimation for jump height (hip displacement), ground contact time, reactive strength index
- [ ] **VBT-10**: Running gait analysis: stride length, stride frequency, ground contact time, estimated velocity
- [ ] **VBT-11**: VBT-captured set videos saved locally with velocity overlay; optional upload to Cloudflare R2 for trainer review
- [ ] **VBT-12**: Trainer can request video of specific sets from athlete via messaging
- [ ] **VBT-13**: Video clips tagged with exercise, date, load, velocity data for searchable retrieval

### 1RM Estimation Engine

- [ ] **ONERM-01**: Epley formula auto-applied to every working set ≤10 reps with recorded weight; highest estimate per session stored as session 1RM
- [ ] **ONERM-02**: Velocity-based 1RM: linear regression fitted to athlete's historical (load, mean_velocity) pairs per exercise; 1RM estimated at MVT intersection
- [ ] **ONERM-03**: Default MVTs configurable per exercise (squat 0.17, bench 0.15, deadlift 0.12, OHP 0.18, clean 0.52, snatch 0.68 m/s)
- [ ] **ONERM-04**: Velocity regression confidence score reflects R² value
- [ ] **ONERM-05**: Living load-velocity profile recalculated after every VBT session via async BullMQ job
- [ ] **ONERM-06**: Daily load prescription informed by today's velocity at warm-up weight vs baseline

### Analytics & Data Visualisation

- [ ] **VIZ-01**: Simple numeric mode: dashboard cards for total volume, estimated 1RMs, readiness score, session count, ACWR
- [ ] **VIZ-02**: Volume tracking: stacked area charts, filterable by chain/lift type, at day/week/mesocycle/macrocycle granularity
- [ ] **VIZ-03**: 1RM trends: dual-line chart comparing Epley vs. velocity estimates over time per exercise
- [ ] **VIZ-04**: Load-velocity scatter plots: interactive with regression line, MVT intersection, confidence band, session-over-session comparison
- [ ] **VIZ-05**: Readiness trends: line chart of composite score over time with session load markers
- [ ] **VIZ-06**: ACWR gauge: visual gauge with colour zones (under-training, optimal, danger)
- [ ] **VIZ-07**: Internal training load distribution: pie/donut chart by modality
- [ ] **VIZ-08**: Fatigue indicators: velocity decay rate trends per exercise, monotony and strain charts
- [ ] **VIZ-09**: Progress heatmaps: calendar heatmap showing training density and intensity over months
- [ ] **VIZ-10**: Muscle group volume balance: radar/spider chart showing weekly volume per muscle group, highlighting imbalances
- [ ] **VIZ-11**: TimescaleDB continuous aggregates for volume rollups (daily, weekly, mesocycle, macrocycle); `materialized_only = false` to prevent stale dashboards
- [ ] **VIZ-12**: Materialised views for chain-specific volume, lift-specific volume, modality-specific load, ACWR; refresh hourly for active users

### Readiness Checklist

- [ ] **READ-01**: Daily pre-training readiness form completes in <60 seconds
- [ ] **READ-02**: Subjective metrics (1-5 slider): sleep quality, hydration, nutrition quality, muscle soreness, mental stress, motivation
- [ ] **READ-03**: Objective metrics: sleep hours (manual or Apple/Google Health), sleep stages (wearable), resting HR (wearable), HRV (wearable), jump test height, grip/squeeze test, body weight
- [ ] **READ-04**: Body region soreness map: interactive body diagram, athlete taps sore areas and rates severity 1-3
- [ ] **READ-05**: Composite readiness score 0-100 with configurable weights per trainer (defaults: sleep 25%, soreness 20%, stress 15%, nutrition 15%, hydration 10%, jump delta 10%, squeeze delta 5%)
- [ ] **READ-06**: 14-day baseline establishment period for personal baseline calculations (jump, squeeze, HR, HRV, sleep)
- [ ] **READ-07**: When wearable data available, HRV and resting HR contribute weight (redistributed from subjective metrics)

### Autoregulation Engine

- [ ] **AUTO-01**: Engine generates proposed program modifications based on: composite readiness score + body-region soreness map + post-session feedback + current ACWR
- [ ] **AUTO-02**: Graduated adjustment thresholds: 85-100 Green (no change), 70-84 Gray (minor tweaks), 50-69 Yellow (reduce sets, cap RPE), 0-49 Red (30-50% volume reduction or active recovery)
- [ ] **AUTO-03**: Exercise-specific adjustments from soreness map (e.g., lower back severity 3 + deadlift day → substitute or remove)
- [ ] **AUTO-04**: Cross-modality adjustments: ACWR >1.5 reduces volume regardless of readiness; high-sRPE running yesterday may reduce lower-body volume today
- [ ] **AUTO-05**: Active injury in body region → exercises loading that region flagged for modification/substitution
- [ ] **AUTO-06**: Side-by-side adjustment UI: original program (left) vs proposed changes (right) with colour-coded severity on each modification; strikethrough original values with new values
- [ ] **AUTO-07**: Per-exercise accept/reject plus "Accept All" / "Reject All" buttons
- [ ] **AUTO-08**: Accepted/rejected decisions logged in `readiness_adjustments` for trainer review and pattern analysis
- [ ] **AUTO-09**: Red-severity adjustment triggers push notification to trainer with summary; trainer can override from web portal
- [ ] **AUTO-10**: Trainer can lock specific exercises from autoregulation per client (e.g., competition squat during peaking)
- [ ] **AUTO-11**: Trainer can set minimum intensity floor per exercise or client
- [ ] **AUTO-12**: Trainer custom rule builder (e.g., "If readiness < 60 AND squat day, substitute pause squats")
- [ ] **AUTO-13**: Trainer dashboard shows all clients' readiness scores, adjustments, and patterns

### Sport-Specific Assessments

- [ ] **ASSESS-01**: Built-in test protocols: vertical jump (CMJ, squat jump, drop jump), broad jump, sprint tests (10m, 20m, 40m, 60m, 100m), agility tests (T-test, 5-10-5, Illinois), endurance tests (beep/Yo-Yo, Cooper, 1-mile/1.5-mile), body composition, flexibility/mobility
- [ ] **ASSESS-02**: Strength benchmarks auto-populated from 1RM estimation engine
- [ ] **ASSESS-03**: Trainer can define custom test protocols with name, description, unit, and scoring direction
- [ ] **ASSESS-04**: Test results compared against sport-specific normative tables (general population, track & field, powerlifting, Olympic weightlifting, team sports)
- [ ] **ASSESS-05**: Normative tables stored as reference data, expandable by admins
- [ ] **ASSESS-06**: Each test result scored as percentile relative to normative table
- [ ] **ASSESS-07**: Weak-area detection: when test results reveal outliers vs athlete's profile, system generates Weak Area Report with suggested training emphasis adjustments
- [ ] **ASSESS-08**: Trainer can accept/dismiss weak-area recommendations from client profile

### Injury & Pain Tracking

- [ ] **INJ-01**: Athlete can log injury/pain events: body region, description, severity (1-10), date of onset, mechanism (acute/overuse/unknown), diagnosis (optional), treatment, status (active/recovering/resolved)
- [ ] **INJ-02**: Active injuries visible on trainer's client overview with severity colour coding
- [ ] **INJ-03**: When athlete has active injury in body region, any exercise loading that region shows warning icon in program builder and workout logger
- [ ] **INJ-04**: Autoregulation engine factors active injuries into adjustment proposals
- [ ] **INJ-05**: Return-to-play tracking: trainer sets graduated load rules (e.g., Week 1: 50%, Week 2: 70%, etc.); program builder enforces limits

### Messaging

- [ ] **MSG-01**: In-app real-time 1:1 messaging between trainers and clients (Socket.io + Redis Pub/Sub), gated by subscription tier
- [ ] **MSG-02**: Rich media support: text, images, video clips, GIFs, emoji, voice notes, PDF attachments
- [ ] **MSG-03**: Read receipts and typing indicators
- [ ] **MSG-04**: Full-text message search with index
- [ ] **MSG-05**: Clients without messaging tier see locked UI with upgrade prompt (not hidden feature)
- [ ] **MSG-06**: Trainer can pin important messages within a conversation
- [ ] **MSG-07**: Group messaging: trainer can message all athletes on a team simultaneously
- [ ] **MSG-08**: Push notifications for new messages (FCM Android, APNs iOS)
- [ ] **MSG-09**: Message persistence layer handles mobile background/foreground lifecycle (iOS connection kill, Android Doze)

### Notice Board

- [ ] **BOARD-01**: Central paginated feed for company-wide updates, announcements, promotions
- [ ] **BOARD-02**: Posts created by trainers/admins via TipTap rich-text editor (formatted text, embedded images, links, video embeds)
- [ ] **BOARD-03**: Tier-targeted publishing: posts scoped to specific tiers via `target_tiers` array; empty = all
- [ ] **BOARD-04**: Pinned posts remain at top of feed
- [ ] **BOARD-05**: Read status tracking per user for badge counts and engagement analytics
- [ ] **BOARD-06**: Push notification on publish respecting tier targeting
- [ ] **BOARD-07**: "Require Acknowledgement" flag on critical posts; tracks which users have confirmed reading

### Social & Accountability

- [ ] **SOCIAL-01**: Configurable leaderboards per team or globally: total volume, compliance rate, streak, readiness average, PR count; toggleable per team by trainer; athlete can opt out
- [ ] **SOCIAL-02**: Automatic PR detection and notification (1RM, volume PR, velocity PR); shareable branded graphic cards
- [ ] **SOCIAL-03**: Workout sharing: athletes can share completed session summaries to team feed or externally (Instagram Stories, WhatsApp via share sheet)

### Admin Dashboard

- [ ] **ADMIN-01**: Platform-wide analytics: active users, session volume, retention, compliance rates
- [ ] **ADMIN-02**: Subscription management: view/edit user tiers, revenue reporting, billing
- [ ] **ADMIN-03**: User management: create, suspend, modify roles
- [ ] **ADMIN-04**: Notice board moderation
- [ ] **ADMIN-05**: Exercise library curation: review and approve community-submitted exercises
- [ ] **ADMIN-06**: Normative table management: add/edit sport-specific normative databases

### Quality of Life

- [ ] **QOL-01**: Global kg/lb unit toggle with per-exercise override and automatic conversion
- [ ] **QOL-02**: Dark mode (default), light mode, and system-auto option
- [ ] **QOL-03**: Data export: full training history as CSV/JSON; individual workout logs printable as PDF
- [ ] **QOL-04**: Timezone-aware scheduling for athletes and trainers in different time zones
- [ ] **QOL-05**: In-app onboarding tutorial with interactive walkthrough, role-specific (athlete vs trainer flows)

---

## v2 Requirements (Deferred Post-MVP)

- **Apple Watch / WearOS companion app** — minimal watch app (current exercise, set count, rest timer, tap-to-complete)
- **Program marketplace** — sell/buy program templates; data model ships in v1, UI deferred
- **Garmin Connect, Whoop, Oura, Polar Flow integrations** — external data source schema ships in v1, live integrations deferred
- **Timing gate system integration** — sprint test timing via connected gates (manual entry for MVP)
- **AI-generated program suggestions** — out of scope; Level is coach-directed, not AI-directed
- **Nutrition tracking** — out of scope; MyFitnessPal's domain, would dilute focus

---

## Out of Scope

- **AI-generated programs** — Level's differentiator is coach-directed + algorithmic adjustment, not AI authorship
- **Nutrition tracking & meal planning** — explicitly out of scope; dilutes focus and competes with entrenched incumbents
- **Social feed (Instagram-style)** — not a social media platform; team/coach communication only
- **Video calling / live coaching sessions** — out of scope for v1
- **Gamification / badges / achievements** — anti-feature; serious athletes find this patronising
- **Public athlete profiles** — privacy-first; athlete data is coach-visible only

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| TIER-01 | Phase 1 | Complete |
| TIER-02 | Phase 1 | Complete |
| TIER-03 | Phase 1 | Complete |
| TIER-04 | Phase 1 | Complete |
| TIER-05 | Phase 1 | Complete |
| TIER-06 | Phase 1 | Complete |
| EXLIB-01 | Phase 2 | Pending |
| EXLIB-02 | Phase 2 | Pending |
| EXLIB-03 | Phase 2 | Pending |
| EXLIB-04 | Phase 2 | Pending |
| EXLIB-05 | Phase 2 | Pending |
| EXLIB-06 | Phase 2 | Pending |
| EXLIB-07 | Phase 2 | Pending |
| EXLIB-08 | Phase 2 | Pending |
| EXLIB-09 | Phase 2 | Pending |
| EXLIB-10 | Phase 2 | Pending |
| EXLIB-11 | Phase 2 | Pending |
| PROG-01 | Phase 2 | Pending |
| PROG-02 | Phase 2 | Pending |
| PROG-03 | Phase 2 | Pending |
| PROG-04 | Phase 2 | Pending |
| PROG-05 | Phase 2 | Pending |
| PROG-06 | Phase 2 | Pending |
| PROG-07 | Phase 2 | Pending |
| PROG-08 | Phase 2 | Pending |
| PROG-09 | Phase 2 | Pending |
| PROG-10 | Phase 2 | Pending |
| PROG-11 | Phase 2 | Pending |
| PROG-12 | Phase 2 | Pending |
| PROG-13 | Phase 2 | Pending |
| PROG-14 | Phase 2 | Pending |
| PROG-15 | Phase 2 | Pending |
| PROG-16 | Phase 2 | Pending |
| TEAM-01 | Phase 2 | Pending |
| TEAM-02 | Phase 2 | Pending |
| TEAM-03 | Phase 2 | Pending |
| TEAM-04 | Phase 2 | Pending |
| TEAM-05 | Phase 2 | Pending |
| LOG-01 | Phase 3 | Pending |
| LOG-02 | Phase 3 | Pending |
| LOG-03 | Phase 3 | Pending |
| LOG-04 | Phase 3 | Pending |
| LOG-05 | Phase 3 | Pending |
| LOG-06 | Phase 3 | Pending |
| LOG-07 | Phase 3 | Pending |
| LOG-08 | Phase 3 | Pending |
| SYNC-01 | Phase 3 | Pending |
| SYNC-02 | Phase 3 | Pending |
| SYNC-03 | Phase 3 | Pending |
| SYNC-04 | Phase 3 | Pending |
| SYNC-05 | Phase 3 | Pending |
| FEED-01 | Phase 3 | Pending |
| FEED-02 | Phase 3 | Pending |
| FEED-03 | Phase 3 | Pending |
| MODAL-01 | Phase 3 | Pending |
| MODAL-02 | Phase 3 | Pending |
| MODAL-03 | Phase 3 | Pending |
| MODAL-04 | Phase 3 | Pending |
| MODAL-05 | Phase 3 | Pending |
| MODAL-06 | Phase 3 | Pending |
| MODAL-07 | Phase 3 | Pending |
| MODAL-08 | Phase 3 | Pending |
| VBT-01 | Phase 4 | Pending |
| VBT-02 | Phase 4 | Pending |
| VBT-03 | Phase 4 | Pending |
| VBT-04 | Phase 4 | Pending |
| VBT-05 | Phase 4 | Pending |
| VBT-06 | Phase 4 | Pending |
| VBT-07 | Phase 4 | Pending |
| VBT-08 | Phase 4 | Pending |
| VBT-09 | Phase 4 | Pending |
| VBT-10 | Phase 4 | Pending |
| VBT-11 | Phase 4 | Pending |
| VBT-12 | Phase 4 | Pending |
| VBT-13 | Phase 4 | Pending |
| ONERM-01 | Phase 4 | Pending |
| ONERM-02 | Phase 4 | Pending |
| ONERM-03 | Phase 4 | Pending |
| ONERM-04 | Phase 4 | Pending |
| ONERM-05 | Phase 4 | Pending |
| ONERM-06 | Phase 4 | Pending |
| VIZ-01 | Phase 5 | Pending |
| VIZ-02 | Phase 5 | Pending |
| VIZ-03 | Phase 5 | Pending |
| VIZ-04 | Phase 5 | Pending |
| VIZ-05 | Phase 5 | Pending |
| VIZ-06 | Phase 5 | Pending |
| VIZ-07 | Phase 5 | Pending |
| VIZ-08 | Phase 5 | Pending |
| VIZ-09 | Phase 5 | Pending |
| VIZ-10 | Phase 5 | Pending |
| VIZ-11 | Phase 5 | Pending |
| VIZ-12 | Phase 5 | Pending |
| READ-01 | Phase 5 | Pending |
| READ-02 | Phase 5 | Pending |
| READ-03 | Phase 5 | Pending |
| READ-04 | Phase 5 | Pending |
| READ-05 | Phase 5 | Pending |
| READ-06 | Phase 5 | Pending |
| READ-07 | Phase 5 | Pending |
| AUTO-01 | Phase 5 | Pending |
| AUTO-02 | Phase 5 | Pending |
| AUTO-03 | Phase 5 | Pending |
| AUTO-04 | Phase 5 | Pending |
| AUTO-05 | Phase 5 | Pending |
| AUTO-06 | Phase 5 | Pending |
| AUTO-07 | Phase 5 | Pending |
| AUTO-08 | Phase 5 | Pending |
| AUTO-09 | Phase 5 | Pending |
| AUTO-10 | Phase 5 | Pending |
| AUTO-11 | Phase 5 | Pending |
| AUTO-12 | Phase 5 | Pending |
| AUTO-13 | Phase 5 | Pending |
| MSG-01 | Phase 6 | Pending |
| MSG-02 | Phase 6 | Pending |
| MSG-03 | Phase 6 | Pending |
| MSG-04 | Phase 6 | Pending |
| MSG-05 | Phase 6 | Pending |
| MSG-06 | Phase 6 | Pending |
| MSG-07 | Phase 6 | Pending |
| MSG-08 | Phase 6 | Pending |
| MSG-09 | Phase 6 | Pending |
| BOARD-01 | Phase 6 | Pending |
| BOARD-02 | Phase 6 | Pending |
| BOARD-03 | Phase 6 | Pending |
| BOARD-04 | Phase 6 | Pending |
| BOARD-05 | Phase 6 | Pending |
| BOARD-06 | Phase 6 | Pending |
| BOARD-07 | Phase 6 | Pending |
| SOCIAL-01 | Phase 6 | Pending |
| SOCIAL-02 | Phase 6 | Pending |
| SOCIAL-03 | Phase 6 | Pending |
| ASSESS-01 | Phase 7 | Pending |
| ASSESS-02 | Phase 7 | Pending |
| ASSESS-03 | Phase 7 | Pending |
| ASSESS-04 | Phase 7 | Pending |
| ASSESS-05 | Phase 7 | Pending |
| ASSESS-06 | Phase 7 | Pending |
| ASSESS-07 | Phase 7 | Pending |
| ASSESS-08 | Phase 7 | Pending |
| INJ-01 | Phase 7 | Pending |
| INJ-02 | Phase 7 | Pending |
| INJ-03 | Phase 7 | Pending |
| INJ-04 | Phase 7 | Pending |
| INJ-05 | Phase 7 | Pending |
| WEAR-01 | Phase 7 | Pending |
| WEAR-02 | Phase 7 | Pending |
| WEAR-03 | Phase 7 | Pending |
| WEAR-04 | Phase 7 | Pending |
| ADMIN-01 | Phase 7 | Pending |
| ADMIN-02 | Phase 7 | Pending |
| ADMIN-03 | Phase 7 | Pending |
| ADMIN-04 | Phase 7 | Pending |
| ADMIN-05 | Phase 7 | Pending |
| ADMIN-06 | Phase 7 | Pending |
| QOL-01 | Phase 7 | Pending |
| QOL-02 | Phase 7 | Pending |
| QOL-03 | Phase 7 | Pending |
| QOL-04 | Phase 7 | Pending |
| QOL-05 | Phase 7 | Pending |

---

*Requirements defined: 2026-03-24*
*Source: Level Master Build Prompt v1.0 + domain research*
