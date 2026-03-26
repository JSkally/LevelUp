---
phase: 01-foundation-auth
plan: 06
subsystem: infra
tags: [expo, eas, expo-updates, ota, mobile, ci, github-actions]

# Dependency graph
requires:
  - phase: 01-foundation-auth
    provides: EAS Build workflow already configured in .github/workflows/eas-build.yml
provides:
  - EAS Update OTA channel configuration in eas.json (development/preview/production)
  - expo-updates dependency in apps/mobile for runtime OTA support
  - runtimeVersion policy in app.json (appVersion strategy)
  - CI step publishing OTA updates to production channel on every main push
affects:
  - mobile deployment
  - app store submission frequency (reduced by OTA)

# Tech tracking
tech-stack:
  added: [expo-updates ~0.26.0]
  patterns:
    - EAS channel-per-environment (development/preview/production)
    - runtimeVersion policy appVersion for OTA compatibility gating

key-files:
  created:
    - apps/mobile/eas.json
  modified:
    - apps/mobile/package.json
    - apps/mobile/app.json
    - .github/workflows/eas-build.yml

key-decisions:
  - "expo-updates pinned to ~0.26.0 for Expo SDK 52 compatibility (pnpm resolved ^55 by default which is SDK 53+)"
  - "runtimeVersion policy set to appVersion — ties OTA update eligibility to native app version, preventing incompatible JS from loading"
  - "update.url placeholder used in eas.json and app.json — developer must run eas init to get real Expo project ID"

patterns-established:
  - "Pattern 1: OTA update channel mirrors build profile names (development/preview/production)"
  - "Pattern 2: CI publishes OTA update after successful build on main, enabling immediate JS-only deploys"

requirements-completed: [INFRA-07]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 1 Plan 06: EAS Update OTA Configuration Summary

**EAS Update OTA pipeline configured with expo-updates ~0.26.0, eas.json build profiles with channels, and GitHub Actions publish step after every main branch build**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-26T23:29:22Z
- **Completed:** 2026-03-26T23:31:38Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `eas.json` with development, preview, and production build profiles each mapped to OTA channels
- Added `expo-updates ~0.26.0` (Expo SDK 52 compatible) to mobile dependencies and configured `runtimeVersion` policy in `app.json`
- Extended the EAS Build CI workflow to publish OTA updates to the production channel after every successful build on main

## Task Commits

Each task was committed atomically:

1. **Task 1: Add expo-updates and create eas.json** - `76387d6` (feat)
2. **Task 2: Add EAS Update step to CI workflow** - `936dd01` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/mobile/eas.json` - EAS build profiles (development/preview/production) with OTA channel mappings and placeholder project URL
- `apps/mobile/package.json` - Added expo-updates ~0.26.0 dependency
- `apps/mobile/app.json` - Added runtimeVersion (policy: appVersion) and updates.url config for expo-updates
- `.github/workflows/eas-build.yml` - Added named Build app and Publish OTA update steps; OTA publishes to production channel after build

## Decisions Made
- `expo-updates` pinned to `~0.26.0` for Expo SDK 52 compatibility. pnpm resolved `^55.0.15` by default (SDK 53+), which would be incompatible.
- `runtimeVersion` policy set to `appVersion` — ties OTA update eligibility to native binary version, preventing incompatible JS bundles from loading on older native apps.
- `update.url` uses placeholder `https://u.expo.dev/your-project-id` — developer must run `eas init` in `apps/mobile` against their Expo account to get the real project ID, then update both `eas.json` and `app.json`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pinned expo-updates to correct Expo SDK 52 compatible version**
- **Found during:** Task 1 (Add expo-updates and create eas.json)
- **Issue:** `pnpm add expo-updates` resolved to `^55.0.15` (Expo SDK 53+ series), incompatible with SDK 52
- **Fix:** Manually set version in package.json to `~0.26.0` as specified in the plan, re-ran `pnpm install`
- **Files modified:** `apps/mobile/package.json`
- **Verification:** `pnpm --filter @repo/mobile typecheck` passed
- **Committed in:** `76387d6` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (version pin correction)
**Impact on plan:** Necessary for SDK compatibility. No scope creep.

## Issues Encountered
- pnpm resolved `expo-updates` to the wrong major version (^55 SDK 53 series vs ~0.26.0 SDK 52). The plan specified the correct pin — applied manually.

## User Setup Required
Before the EAS Update step will succeed in CI, the developer must:

1. Run `eas init` in `apps/mobile` while authenticated to their Expo account
2. Copy the project ID from the Expo dashboard
3. Update `update.url` in `apps/mobile/eas.json` (replace `your-project-id`)
4. Update `updates.url` in `apps/mobile/app.json` (replace `your-project-id`)
5. Ensure `EXPO_TOKEN` secret is set in GitHub repository settings

The `eas build` and `eas update` commands will fail in CI until steps 1-5 are complete.

## Next Phase Readiness
- INFRA-07 closed: EAS Build + EAS Update both configured
- OTA pipeline ready for production use once developer completes Expo project ID setup
- Mobile CI workflow handles both native builds and JS-only OTA deploys from a single push to main

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-26*
