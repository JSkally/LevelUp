# Feature Landscape

**Domain:** Fitness coaching / strength & conditioning / VBT platform
**Researched:** 2026-03-24
**Competitors analyzed:** TrainHeroic, TrueCoach, Trainerize, RP Hypertrophy, Fitbod, Vitruve, GymAware, PUSH Band, Metric VBT, Whoop, TeamBuildr

---

## Table Stakes

Features users expect. Missing any of these and coaches/athletes will leave for a competitor.

### Coach Web Portal

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Program builder with copy/paste/template | TrainHeroic, TrueCoach all have this. Coaches refuse to retype programs. | High | Drag-and-drop on web; must support Program > Week > Day > Exercise > Set hierarchy. Copy-paste sessions/weeks is critical time-saver. |
| Exercise library with video demos | Every competitor has 500-1200+ exercise videos. Coaches expect searchable library with muscle group filters. | Medium | Must support coach-uploaded custom exercises with video. Meilisearch handles search. Cloudflare R2 for video storage. |
| Client/athlete roster management | Basic CRUD: invite athletes, view profiles, assign to teams/groups, see last-active status | Medium | Must support bulk invite (CSV import or link-based). Team assignment is table stakes for S&C coaches with 20+ athletes. |
| Calendar/schedule view | TrainHeroic Master Calendar is the gold standard. Coaches need to see which programs are assigned to which teams across a timeline. | Medium | Block-level calendar showing program assignment across teams. Not a booking calendar -- a programming calendar. |
| Compliance/adherence dashboard | Coaches need at-a-glance view of who completed workouts, who skipped, who is falling behind | Medium | TrainHeroic surfaces this prominently. Red/yellow/green per athlete per week. |
| Basic analytics (volume, 1RM trends) | Every platform shows volume over time and estimated 1RM progression. Not having this is disqualifying. | Medium | Line charts for e1RM trends, bar charts for weekly volume by muscle group or movement pattern. |
| In-app messaging (coach-to-athlete) | TH Chat, TrueCoach messaging, Trainerize all have it. Coaches will not switch to WhatsApp/iMessage. | High | Direct messages + team/group announcements. Must support images and short video for form checks. |
| Push notifications | Athletes expect workout reminders, coach messages, PR celebrations | Low | FCM + APNs. Standard implementation. |

### Athlete Mobile App

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Frictionless workout logging | 10-15 seconds per set or athletes abandon the app. Pre-populated from program, tap to log. | High | Previous performance overlay (what you did last time) is expected. Quick-entry for weight/reps. Must feel faster than a notebook. |
| Rest timer with notification | Every serious lifting app has this. Timer starts on set completion, notification when rest period ends. | Low | Auto-start from prescribed rest period. Allow manual override. Notification even when app is backgrounded. |
| Plate calculator | Eliminates mental math. Expected by powerlifters, Olympic lifters, and serious trainees. | Low | Input target weight, shows plate breakdown per side. Account for bar weight (20kg/45lb). |
| Exercise video demos | Athletes need to see how to perform assigned exercises, especially for newer lifters | Low | Inline video playback from exercise library. Coach can attach custom video notes per exercise. |
| Previous performance overlay | "What did I do last time?" is the single most common question during a workout. Every good logger shows it. | Medium | Show last session's weight/reps/RPE next to current set inputs. Show trend arrow (up/down/same). |
| Progress tracking & history | View workout history, search past sessions, see personal records | Medium | Filterable by exercise, date range, program. PR detection and display. |
| Offline capability | Gyms have terrible cell service. Non-negotiable for workout logging. | High | Full workout logging offline with sync when connectivity returns. WatermelonDB handles this. |
| Apple Health / Google Health Connect sync | Expected integration point. Athletes want steps, sleep, HR data in one place. | Medium | Bidirectional: push workout data out, pull health metrics in. |
| Dark mode | Default in gym environments. Bright screens are annoying between sets. | Low | Dark mode default, light mode option, system-auto. |

### Communication

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Direct messaging (1:1 coach-athlete) | Table stakes per TrainHeroic, TrueCoach. Text + images + short video. | High | Read receipts expected. Rich media (images, GIFs, video up to 60s for form checks). |
| Group/team announcements | Coaches post updates to all athletes or specific teams | Medium | TrainHeroic distinguishes DMs from team announcements. Tier-targeted publishing is a Level differentiator (see below). |
| Session comments/notes | Athletes can leave notes on completed workouts; coaches can comment back | Low | Per-session feedback thread. Common pattern across all platforms. |

---

## Differentiators

Features that set Level apart. Not universally expected, but provide competitive advantage.

### Closed-Loop Autoregulation (Level's Core Differentiator)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Pre-training readiness checklist | Subjective (sleep, stress, motivation, soreness) + objective (HRV if available) + body map for pain localization. Whoop does recovery scoring but has zero connection to programming. TrainHeroic has basic wellness checks but no program adjustment. | Medium | Composite score 0-100. Configurable weights per trainer (some care more about sleep, others about soreness). This is the INPUT to autoregulation. |
| Composite readiness scoring (0-100) | Single actionable number. Whoop has recovery %, but it is disconnected from training. Level connects the score to program modification. | Medium | Green (80-100) / Gray (60-79) / Yellow (40-59) / Red (0-39) thresholds. Trainer-configurable. |
| Dynamic program adjustment algorithm | THE differentiator. No competitor does this. RP Hypertrophy adjusts volume based on feedback but only for their own generated programs. Fitbod adapts but has no coach involvement. Level lets the coach set the program AND the system auto-adjusts daily based on readiness. | Very High | Graduated thresholds: Green = as programmed, Gray = minor volume reduction, Yellow = significant deload, Red = active recovery substitution. Must be transparent (athlete sees WHY adjustments were made). |
| Side-by-side adjustment UI (accept/reject) | Coach and athlete can both see proposed vs. original workout. Accept all, reject specific changes, or override. No competitor offers this level of transparency. | High | Split-pane on web, swipeable cards on mobile. Per-exercise accept/reject granularity. |
| Post-session feedback loop | sRPE, pump quality, joint pain map, exercise thumbs up/down. RP Hypertrophy collects some of this but only for their own algorithm. Level feeds it back to the coach AND the autoregulation engine. | Medium | This closes the loop. Session feedback informs NEXT session's readiness baseline and adjustment calibration. |
| Trainer override + custom rule builder | Coach can create rules: "If readiness < 50 AND it is a heavy squat day, substitute front squat at 70% load." No competitor has this. | High | Rule engine with conditions and actions. Start simple (if/then), expand later. Coaches who invest in rules get better autoregulation. |

### VBT (Velocity-Based Training)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| On-device camera-based bar tracking | No external hardware needed. Metric VBT proved camera-based tracking is viable (2-3% accuracy of LPT devices). Level does this with TensorFlow.js MoveNet. Eliminates $350-$3000 hardware barrier. | Very High | This is the accessibility play. Vitruve/GymAware/PUSH all require purchased hardware. Level democratizes VBT. Caribbean market especially cannot afford $350+ devices. |
| Real-time velocity display during sets | Vitruve and GymAware show this. Expected if you claim VBT support. Mean velocity, peak velocity per rep. | High | Must render in real-time as rep is being performed. Audio/haptic feedback for velocity zones (too slow = audible warning). |
| Velocity-based fatigue detection | When velocity drops below threshold (e.g., >20% velocity loss), alert to stop the set. GymAware and Vitruve both do this. | Medium | Configurable velocity loss cutoff per exercise. Visual indicator (progress bar turning red). Auto-stop recommendation. |
| Load-velocity profiling | Build individualized load-velocity curves per exercise per athlete. GymAware Cloud's core feature. | Medium | Scatter plot with regression line. Updates continuously as more data is logged. Foundation for velocity-based 1RM estimation. |
| Velocity-based 1RM estimation | Estimate 1RM from submaximal loads using velocity data. More accurate than Epley alone. GymAware and Vitruve both offer this. | Medium | Dual estimation: Epley (reps-based) + velocity regression. Show both, highlight confidence interval. "Living" profile that improves with more data. |
| Velocity zones / targets per set | Prescribe training by velocity (e.g., "move at 0.5-0.7 m/s") rather than percentage. The modern S&C approach. | Low | Color-coded zones in the workout logger. Coach assigns velocity targets in program builder. |

### Analytics & Data Visualization

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| ACWR (Acute:Chronic Workload Ratio) gauge | Standard sports science metric. TeamBuildr does this. Most coaching platforms do NOT, leaving coaches to calculate in spreadsheets. | Medium | Gauge visualization with danger zones (>1.5 = injury risk). TimescaleDB continuous aggregates make this computationally cheap. |
| Training load monotony & strain | Banister model metrics. Coaches who understand periodization expect these. Most platforms ignore them. | Medium | Weekly monotony (SD of daily load), strain (weekly load x monotony). Flag when strain exceeds threshold. |
| Muscle group heatmap | Visual representation of which muscles are getting trained and how much. Fitbod does this well. | Medium | Body silhouette with color-coded volume overlay. Highlights imbalances (anterior vs posterior chain). |
| Radar chart for athletic profile | Compare athlete across multiple performance dimensions (speed, strength, power, endurance, agility). No coaching platform does this well. | Low | Spider/radar chart with normative data overlay. Highlights weak areas for targeted programming. |
| Normative comparison engine | How does this athlete compare to age/gender/sport norms? Assessment-driven. | Medium | Requires standardized assessment library. Percentile rankings. Weak-area detection reports. |

### Advanced Coach Features

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multi-modality training logs | Track running, swimming, cycling, sport practice, conditioning -- not just lifting. TrainHeroic is lifting-focused. TrueCoach is better here but still basic. | Medium | Unified training load model across modalities. Internal Training Load calculation for non-lifting activities. |
| Sport-specific assessments | Standardized testing: vertical jump, 40-yard dash, agility tests, endurance benchmarks. TeamBuildr does this. | Medium | Testing protocols with normative tables. Progress tracking over time. Auto-populate athletic profile radar chart. |
| Injury log + return-to-play tracking | Track injuries, flag affected exercises, monitor rehabilitation milestones. TeamBuildr and SportsWare do this but are separate platforms. | Medium | Body map for injury localization. Automatic exercise flagging (e.g., "shoulder injury" flags overhead pressing). Return-to-play checklists with milestone gates. |
| Program templates + marketplace (data model) | TrainHeroic has a program marketplace. Level should have the data model for it from day one even if the marketplace UI is deferred. | Low | Template library with 20+ starter programs. Sharing/selling infrastructure deferred but schema supports it. |
| Notice board with tier targeting | Coach posts announcements visible to specific subscription tiers. No competitor does tier-targeted publishing. | Low | Rich-text editor, pinned posts, tier filtering. "Elite members: new VBT feature available." |
| Leaderboards + PR celebrations | TrainHeroic's leaderboard (including TV display mode) drives gym culture. Athletes love competition. | Medium | Per-exercise leaderboards within teams. PR detection with celebratory animations. Optional: fullscreen display mode for gym TVs. |

### Platform & Infrastructure

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Tiered subscription with JSONB capability map | Feature gating without schema migrations. Unique to Level's architecture. | Medium | Base/Pro/Elite tiers. JSONB map controls feature access. Dual enforcement (API + UI). |
| Wearable data pipeline | Schema supports Garmin, Whoop, Oura, Polar. MVP: Apple Health/Google Health Connect only. | Low (MVP) | Future-proofed schema. Actual API integrations deferred post-MVP except Apple/Google. |
| Caribbean currency support | JMD, TTD, BBD, GYD, BSD, XCD. No competitor targets Caribbean market specifically. | Low | Currency display formatting. Localization concern, not a feature per se. |
| Data export (CSV/JSON/PDF) | Compliance and portability expectation. | Low | Workout logs, assessment data, analytics reports. PDF for printable workout logs. |

---

## Anti-Features

Features to explicitly NOT build. These waste effort, bloat the product, or misalign with Level's identity.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| AI-generated programs (Fitbod style) | Level is coach-directed, not algorithm-directed. Auto-generating workouts undermines the coach's role and Level's value proposition. Fitbod and RP Hypertrophy own this space. | Autoregulation ADJUSTS coach-created programs. The coach is always the author. The system is an assistant, not a replacement. |
| Nutrition tracking / meal planning | MyFitnessPal, MacroFactor, RP Diet own this. Building a half-baked nutrition tracker dilutes focus and doubles scope. | Integrate with existing nutrition apps via Apple Health/Google Health Connect. Let specialized tools handle nutrition. |
| Social feed / Instagram-style sharing | Creates moderation burden, doesn't serve serious athletes, attracts vanity metrics culture. Trainerize tried this and it's their weakest feature. | Leaderboards + PR celebrations serve the competitive/social need without a feed. Team announcements handle communication. |
| Video call / telehealth | Zoom, Google Meet, FaceTime already exist. Building video calling is enormous scope for minimal differentiation. | Deep-link to video call platforms from messaging. Don't build the video infrastructure. |
| Apple Watch / WearOS companion app (MVP) | Enormous development effort for a secondary screen. Distraction from core mobile experience. | Defer to Phase 8+. Apple Health sync covers most wearable data needs for MVP. |
| Booking / scheduling system | MindBody, Calendly, Acuity own this. Coach scheduling is a separate business problem. | Focus on programming calendar, not appointment calendar. Integrate if needed later. |
| Marketplace UI (MVP) | TrainHeroic's marketplace took years to build critical mass. Premature for MVP. | Data model supports templates and sharing from day one. Marketplace UI deferred post-MVP. |
| Gamification / badges / streaks | Hollow engagement mechanics that annoy serious athletes. Whoop tried streaks and users mock them. | PR celebrations and leaderboards provide meaningful recognition. Skip arbitrary badge systems. |
| Built-in payment processing for coach services | Stripe integration for subscription billing is sufficient. Building a Venmo-for-coaches is out of scope. | Handle platform subscription billing. Coaches handle their own client billing externally. |

---

## Feature Dependencies

```
Exercise Library ──────────────────────┐
                                       v
Program Builder ──> Program Assignment ──> Workout Logger
       |                                       |
       v                                       v
Program Templates                    Post-Session Feedback
                                       |
Readiness Checklist ──> Readiness Score ──> Dynamic Adjustment Algorithm
                                       |
                            Side-by-Side Adjustment UI
                                       |
                            Trainer Override / Rule Builder

VBT Camera Tracking ──> Real-Time Velocity Display
       |                       |
       v                       v
Load-Velocity Profile    Velocity Fatigue Detection
       |
       v
Velocity-Based 1RM Estimation

Workout Logger ──> Volume/Load Data ──> Analytics Charts
       |                                      |
       v                                      v
Training Load Model ──> ACWR Gauge    Muscle Group Heatmap
       |
       v
Monotony & Strain Calculations

Client Roster ──> Team Management ──> Leaderboards
       |                                   |
       v                                   v
Messaging (1:1) ──> Group Messaging   PR Celebrations
       |
       v
Notice Board

Injury Log ──> Exercise Flagging (modifies Workout Logger)
       |
       v
Return-to-Play Tracking

Assessments ──> Normative Comparison ──> Radar Chart
```

---

## VBT Feature Comparison: Level vs. Dedicated VBT Tools

| Feature | GymAware | Vitruve | PUSH Band | Metric VBT | Level (Target) |
|---------|----------|---------|-----------|------------|----------------|
| **Hardware required** | Yes ($2500+) | Yes ($349) | Yes ($349) | No (camera) | No (camera) |
| **Velocity accuracy** | Gold standard (LPT) | High (LPT) | Good (accelerometer) | Good (2-3% of LPT) | Target: match Metric |
| **Real-time display** | Yes | Yes | Yes | Yes | Yes |
| **Velocity zones** | Yes | Yes | Yes | Yes | Yes |
| **Load-velocity profile** | Yes (excellent) | Yes | Limited | Basic | Yes |
| **1RM estimation** | Yes (velocity-based) | Yes | Yes | Yes | Yes (dual: Epley + velocity) |
| **Fatigue detection** | Yes (velocity loss) | Yes | Limited | Basic | Yes |
| **Coach dashboard** | Yes (Cloud Pro) | Yes (Builder) | Limited | No | Yes (integrated) |
| **Team monitoring** | Yes (leaderboards) | Yes (Coach Mode) | Limited | No | Yes |
| **Program builder** | No | Yes (basic) | No | No | Yes (full-featured) |
| **Readiness integration** | No | No | No | No | Yes (closed-loop) |
| **Autoregulation** | No | No | No | No | Yes (core differentiator) |
| **Workout logging** | No | Basic | No | Basic | Full-featured |
| **Offline support** | No | No | No | No | Yes |
| **Platform** | iOS, Android, Web | iOS, Android, Desktop | iOS, Android | iOS (Android 2026) | iOS, Android, Web |
| **Price model** | Hardware + $500+/yr | Hardware + subscription | Hardware + subscription | Free tier available | Subscription only (no hardware) |

**Key insight:** Dedicated VBT tools do velocity tracking well but are terrible at everything else (programming, logging, communication, analytics). Level's advantage is that VBT is integrated into a complete coaching platform rather than being a standalone measurement tool. The camera-based approach eliminates the hardware cost barrier, which is especially important for the Caribbean market.

**What Level must match:** Real-time velocity display, velocity zones, load-velocity profiling, 1RM estimation, fatigue detection. These are non-negotiable if claiming VBT support.

**Where Level beats all of them:** Closed-loop autoregulation connecting VBT data back to program adjustment. No VBT tool does this. They measure velocity but leave the coach to manually interpret and adjust. Level closes that loop automatically.

---

## MVP Recommendation

### Phase 1: Coach Web Portal (must ship first)

Prioritize:
1. **Exercise library** -- foundation for everything else
2. **Program builder** (full hierarchy) -- the coach's primary tool
3. **Client roster + team management** -- coaches need to assign programs
4. **Program assignment + calendar view** -- make programs actionable
5. **Basic analytics** (volume charts, 1RM trends) -- coaches need to see data
6. **Compliance dashboard** -- who is training, who is not

### Phase 2: Athlete Mobile App (core logging)

Prioritize:
1. **Workout logger** with previous performance overlay -- the daily tool
2. **Rest timer + plate calculator** -- friction reducers
3. **Exercise video demos** -- inline during workouts
4. **Offline-first capability** -- non-negotiable for Caribbean connectivity
5. **Push notifications** -- workout reminders, coach messages

### Phase 3: Communication

Prioritize:
1. **Direct messaging** (1:1 coach-athlete)
2. **Team announcements**
3. **Session comments** (per-workout feedback thread)
4. **Notice board** with tier targeting

### Phase 4: Autoregulation Engine (the differentiator)

Prioritize:
1. **Pre-training readiness checklist**
2. **Composite readiness scoring**
3. **Dynamic adjustment algorithm** (Green/Gray/Yellow/Red)
4. **Side-by-side adjustment UI**
5. **Post-session feedback loop** (sRPE, pump quality, joint pain map)
6. **Trainer override + rule builder** (can be simplified for initial release)

### Phase 5: VBT

Prioritize:
1. **Camera-based bar tracking** (TensorFlow.js MoveNet)
2. **Real-time velocity display**
3. **Velocity zones + targets in program builder**
4. **Load-velocity profiling**
5. **Velocity-based fatigue detection**
6. **Velocity-based 1RM estimation**

### Defer

- **Sport-specific assessments:** valuable but not critical for launch. Add after core loop is working.
- **Injury log + return-to-play:** important for professional S&C but not for initial user acquisition. Phase 6+.
- **Normative comparison engine:** requires assessment data to exist first. Phase 6+.
- **Wearable API integrations** (Garmin, Whoop, Oura, Polar): schema in place, live integrations post-MVP.
- **Program marketplace UI:** data model supports it, UI deferred.
- **Leaderboard TV display mode:** nice-to-have, not launch critical.
- **Advanced rule builder for autoregulation:** start with simple thresholds, expand based on coach feedback.

---

## Sources

- [TrainHeroic Coach Features](https://www.trainheroic.com/coach/)
- [TrainHeroic Program Builder](https://www.trainheroic.com/coach-playbook-create/)
- [TrainHeroic Analytics](https://support.trainheroic.com/hc/en-us/sections/17996111205645-Analytics-Reporting-and-Activity)
- [TrainHeroic Leaderboards](https://support.trainheroic.com/hc/en-us/articles/18170915515917-Programming-Leaderboards)
- [TrainHeroic Chat](https://www.trainheroic.com/blog/trainheroic-chat/)
- [TrueCoach vs Trainerize](https://truecoach.co/truecoach-vs-trainerize/)
- [TrueCoach Platform](https://truecoach.co/)
- [RP Hypertrophy App](https://rpstrength.com/pages/hypertrophy-app)
- [Fitbod Adaptive Algorithm](https://fitbod.me/blog/how-fitbod-personalizes-your-workout-plan-using-smart-training-algorithms/)
- [Vitruve VBT Platform](https://vitruve.fit/)
- [GymAware Cloud Features](https://gymaware.com/featuresmain/)
- [GymAware Team Data](https://gymaware.com/actionable-data-and-reports-for-teams-in-gymaware-cloud/)
- [PUSH Band Features](https://www.trainwithpush.com/band-features)
- [Metric VBT (Camera-Based)](https://www.metric.coach/)
- [VBT Devices Buyer's Guide 2025](https://www.vbtcoach.com/blog/velocity-based-training-devices-buyers-guide)
- [Camera-Based VBT Review](https://www.vbtcoach.com/blog/computer-vision-velocity-based-training-app)
- [Whoop Recovery Features](https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/)
- [Whoop 2025 Roadmap](https://www.whoop.com/us/en/thelocker/inside-look-whats-next-for-whoop-in-2025/)
- [TeamBuildr Platform](https://www.teambuildr.com/)
- [Injury Tracking Software](https://www.sprypt.com/blog/guide-to-injury-tracking-software-for-athletic-trainers)
- [Workout Logging UX Best Practices](https://setgraph.app/ai-blog/best-app-to-log-workout-tested-by-lifters)
