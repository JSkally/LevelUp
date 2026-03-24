# Roadmap: Level

## Overview

Level ships in seven phases, ordered by dependency chains and risk isolation. Foundation (monorepo, auth, tiers) enables everything. The coach web portal (exercise library, program builder, teams) ships next because trainers must build programs before athletes can use them. Athlete mobile with offline sync follows as its own phase to isolate WatermelonDB risk. VBT gets a dedicated phase because it carries the highest integration risk (VisionCamera + TFLite + Expo SDK 53). Analytics and autoregulation come after workout data exists. Messaging and social are engagement features that require both coach and athlete sides. Assessments, wearables, injuries, and admin round out the platform.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Auth** - Monorepo, Clerk auth, role system, subscription tiers, CI/CD, database schema
- [ ] **Phase 2: Coach Portal** - Exercise library with search/video, program builder with drag-and-drop, team management
- [ ] **Phase 3: Athlete Mobile & Offline Sync** - Workout logging, offline-first with WatermelonDB, post-session feedback, multi-modality logging
- [ ] **Phase 4: VBT & 1RM Engine** - On-device bar tracking via computer vision, velocity display, 1RM estimation
- [ ] **Phase 5: Analytics & Autoregulation** - Dashboards, readiness scoring, dynamic program adjustments, TimescaleDB aggregates
- [ ] **Phase 6: Messaging & Social** - Real-time messaging, notice board, leaderboards, PR celebrations
- [ ] **Phase 7: Assessments, Wearables & Admin** - Sport-specific tests, injury tracking, Apple/Google Health, admin dashboard, QoL features

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: A working monorepo where a user can register, log in on web and mobile, receive a role, and hit a tier-gated API endpoint -- proving the entire auth and infrastructure pipeline end-to-end.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, TIER-01, TIER-02, TIER-03, TIER-04, TIER-05, TIER-06
**Success Criteria** (what must be TRUE):
  1. User can register on the web portal and mobile app via Clerk and land on a role-appropriate home screen
  2. User can log in, stay logged in across sessions, and reset a forgotten password on both web and mobile
  3. Admin can assign and change user roles (Athlete, Trainer, Admin, Assistant Coach) and the role is enforced at the API
  4. A tier-gated API endpoint returns 403 with upgrade context for unauthorized tiers, and the UI shows a locked state with upgrade prompt
  5. CI pipeline runs lint, type-check, test, and build on every push; mobile builds via EAS
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Turborepo + pnpm monorepo scaffold, CI/CD pipeline, Docker dev environment, Wave 0 test stubs
- [ ] 01-02-PLAN.md — Clerk auth on web + mobile + Fastify API, role assignment webhook, JWT role enforcement
- [ ] 01-03-PLAN.md — JSONB subscription tier system, tier gate middleware, TierGate UI component, Caribbean currency display

### Phase 2: Coach Portal
**Goal**: A trainer can build a complete program using the exercise library, organize athletes into teams, and assign programs -- the full coach web experience before any mobile athlete work.
**Depends on**: Phase 1
**Requirements**: EXLIB-01, EXLIB-02, EXLIB-03, EXLIB-04, EXLIB-05, EXLIB-06, EXLIB-07, EXLIB-08, EXLIB-09, EXLIB-10, EXLIB-11, PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, PROG-06, PROG-07, PROG-08, PROG-09, PROG-10, PROG-11, PROG-12, PROG-13, PROG-14, PROG-15, PROG-16, TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05
**Success Criteria** (what must be TRUE):
  1. Trainer can search the 500+ exercise library with instant results, filter by muscle/equipment/pattern, view demo videos with slow-motion playback, and create custom exercises
  2. Trainer can build a full program hierarchy (Program > Macrocycle > Week > Day > Exercise > Sets) using drag-and-drop on web, configure any load parameter combination in under 3 seconds per set, and save programs as reusable templates
  3. Trainer can create teams, add/remove athletes, assign programs to teams or individuals, and assign assistant coaches to teams
  4. Program changes made on web appear on mobile in real-time via WebSocket
  5. Starter program templates (20+) are available for cloning into new programs
**Plans**: TBD

Plans:
- [ ] 02-01: Exercise library and Meilisearch integration
- [ ] 02-02: Program builder (web drag-and-drop + mobile CRUD)
- [ ] 02-03: Teams, assignments, and program templates

### Phase 3: Athlete Mobile & Offline Sync
**Goal**: An athlete can open today's workout, log every set with zero friction, complete full sessions offline, sync when connectivity returns, and provide post-session feedback -- the core mobile training experience.
**Depends on**: Phase 2
**Requirements**: LOG-01, LOG-02, LOG-03, LOG-04, LOG-05, LOG-06, LOG-07, LOG-08, SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, FEED-01, FEED-02, FEED-03, MODAL-01, MODAL-02, MODAL-03, MODAL-04, MODAL-05, MODAL-06, MODAL-07, MODAL-08
**Success Criteria** (what must be TRUE):
  1. Athlete opens the app and sees today's assigned exercises with prescribed parameters; can log sets with pre-filled values, auto-advancing rest timer, plate calculator, and previous performance overlay
  2. Athlete can complete an entire workout session with airplane mode on, then sync all data when connectivity returns with no data loss
  3. After completing a session, athlete is prompted for sRPE, pump quality, joint pain map, and per-exercise feedback; persistent joint pain triggers a push notification to the trainer
  4. Athlete can log non-strength sessions (running, swimming, cycling, sport practice, conditioning, flexibility, custom) with modality-specific fields that contribute to unified weekly training load and ACWR
  5. Sync conflict log is available for trainer review; exercise demo videos can be pre-cached for offline viewing
**Plans**: TBD

Plans:
- [ ] 03-01: WatermelonDB offline sync infrastructure
- [ ] 03-02: Workout logger and session execution
- [ ] 03-03: Post-session feedback and multi-modality logging

### Phase 4: VBT & 1RM Engine
**Goal**: An athlete can point their phone camera at a barbell, see real-time velocity feedback during a set, receive fatigue alerts, and have their load-velocity profile and 1RM estimates automatically updated.
**Depends on**: Phase 3
**Requirements**: VBT-01, VBT-02, VBT-03, VBT-04, VBT-05, VBT-06, VBT-07, VBT-08, VBT-09, VBT-10, VBT-11, VBT-12, VBT-13, ONERM-01, ONERM-02, ONERM-03, ONERM-04, ONERM-05, ONERM-06
**Success Criteria** (what must be TRUE):
  1. Athlete can start camera-based bar tracking during a set and see live velocity display with colour-coded feedback (green/yellow/red) and optional audio callout
  2. After a VBT set, athlete sees mean concentric velocity, peak velocity, bar path deviation score, and range of motion; velocity cutoff alert fires when velocity drops below prescribed threshold
  3. 1RM is estimated via both Epley formula and velocity regression; load-velocity profiles are recalculated asynchronously after each VBT session with a displayed confidence score
  4. Set videos with velocity overlay are saved locally and optionally uploaded for trainer review; trainer can request specific set videos via messaging
  5. Full-body pose estimation works for jump height, ground contact time, and running gait analysis
**Plans**: TBD

Plans:
- [ ] 04-01: VisionCamera + TFLite pipeline and bar tracking
- [ ] 04-02: Velocity metrics, fatigue detection, and video management
- [ ] 04-03: 1RM estimation engine and load-velocity profiles

### Phase 5: Analytics & Autoregulation
**Goal**: Trainers and athletes see rich data visualizations of training history, athletes complete daily readiness checklists that produce composite scores, and the autoregulation engine proposes daily program adjustments that trainers can review and athletes can accept or reject per-exercise.
**Depends on**: Phase 4
**Requirements**: VIZ-01, VIZ-02, VIZ-03, VIZ-04, VIZ-05, VIZ-06, VIZ-07, VIZ-08, VIZ-09, VIZ-10, VIZ-11, VIZ-12, READ-01, READ-02, READ-03, READ-04, READ-05, READ-06, READ-07, AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05, AUTO-06, AUTO-07, AUTO-08, AUTO-09, AUTO-10, AUTO-11, AUTO-12, AUTO-13
**Success Criteria** (what must be TRUE):
  1. Athlete and trainer can view volume charts, 1RM trends, load-velocity scatter plots, ACWR gauge, training heatmaps, and muscle balance radar charts with data at day/week/mesocycle granularity
  2. Athlete can complete a daily readiness checklist in under 60 seconds and see a composite readiness score (0-100) that accounts for subjective metrics, objective metrics, body region soreness map, and wearable data when available
  3. Autoregulation engine proposes daily program modifications based on readiness score, soreness map, post-session feedback, and ACWR; athlete sees a side-by-side comparison UI with per-exercise accept/reject
  4. Trainer can lock exercises from autoregulation, set minimum intensity floors, create custom adjustment rules, and review all clients' readiness scores and adjustment patterns from a dashboard
  5. Red-severity adjustments trigger push notification to trainer; active injuries factor into adjustment proposals
**Plans**: TBD

Plans:
- [ ] 05-01: TimescaleDB aggregates and analytics dashboards
- [ ] 05-02: Readiness checklist and composite scoring
- [ ] 05-03: Autoregulation engine and adjustment UI

### Phase 6: Messaging & Social
**Goal**: Trainers and athletes can communicate in real-time via rich messaging, trainers can publish announcements to the notice board, and athletes can compete on leaderboards and celebrate PRs.
**Depends on**: Phase 5
**Requirements**: MSG-01, MSG-02, MSG-03, MSG-04, MSG-05, MSG-06, MSG-07, MSG-08, MSG-09, BOARD-01, BOARD-02, BOARD-03, BOARD-04, BOARD-05, BOARD-06, BOARD-07, SOCIAL-01, SOCIAL-02, SOCIAL-03
**Success Criteria** (what must be TRUE):
  1. Trainer and athlete can exchange real-time messages with rich media (images, video, voice notes, PDFs), read receipts, typing indicators, and full-text search; messaging is tier-gated with locked UI for ineligible tiers
  2. Trainer can send group messages to all athletes on a team; can pin important messages within conversations
  3. Trainer can publish rich-text announcements to the notice board with tier targeting, pinning, read tracking, and acknowledgement requirements; push notifications fire respecting tier targeting
  4. Leaderboards display per team or globally (volume, compliance, streak, PR count) with trainer toggle and athlete opt-out; PRs are auto-detected with shareable branded graphic cards
  5. Push notifications work on both iOS (APNs) and Android (FCM) for messages and notice board posts; messaging handles mobile background/foreground lifecycle
**Plans**: TBD

Plans:
- [ ] 06-01: Real-time messaging system
- [ ] 06-02: Notice board
- [ ] 06-03: Leaderboards, PRs, and social features

### Phase 7: Assessments, Wearables & Admin
**Goal**: Trainers can run standardised sport-specific assessments with normative comparisons, athletes sync wearable data, injuries are tracked with return-to-play protocols, admins manage the platform, and quality-of-life features round out the user experience.
**Depends on**: Phase 6
**Requirements**: ASSESS-01, ASSESS-02, ASSESS-03, ASSESS-04, ASSESS-05, ASSESS-06, ASSESS-07, ASSESS-08, INJ-01, INJ-02, INJ-03, INJ-04, INJ-05, WEAR-01, WEAR-02, WEAR-03, WEAR-04, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, QOL-01, QOL-02, QOL-03, QOL-04, QOL-05
**Success Criteria** (what must be TRUE):
  1. Trainer can administer built-in sport-specific test protocols (jump, sprint, agility, endurance, body comp, flexibility), view results against normative tables with percentile scores, and receive weak-area detection reports with actionable recommendations
  2. Athlete can log injuries with body region, severity, and mechanism; active injuries show warning icons on affected exercises in the program builder and workout logger; trainer can set graduated return-to-play load rules
  3. Athlete's Apple Health or Google Health Connect data (HR, sleep, steps, energy, workouts) syncs into the platform and auto-populates readiness checklist fields
  4. Admin can view platform-wide analytics, manage subscriptions and billing, manage users and roles, moderate the notice board, curate the exercise library, and manage normative tables
  5. Users can toggle kg/lb units, switch between dark/light/system themes, export training history as CSV/JSON/PDF, and complete a role-specific onboarding tutorial on first login

**Plans**: TBD

Plans:
- [ ] 07-01: Sport-specific assessments and normative engine
- [ ] 07-02: Injury tracking, wearables, and health data sync
- [ ] 07-03: Admin dashboard and quality-of-life features

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6 > 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 0/3 | Not started | - |
| 2. Coach Portal | 0/3 | Not started | - |
| 3. Athlete Mobile & Offline Sync | 0/3 | Not started | - |
| 4. VBT & 1RM Engine | 0/3 | Not started | - |
| 5. Analytics & Autoregulation | 0/3 | Not started | - |
| 6. Messaging & Social | 0/3 | Not started | - |
| 7. Assessments, Wearables & Admin | 0/3 | Not started | - |
