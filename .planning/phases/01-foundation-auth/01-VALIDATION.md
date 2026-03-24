---
phase: 1
slug: foundation-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (packages + API) + Playwright (web E2E) |
| **Config file** | None yet — Wave 0 installs |
| **Quick run command** | `pnpm turbo run typecheck lint` |
| **Full suite command** | `pnpm turbo run test typecheck lint build` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm turbo run typecheck lint`
- **After every plan wave:** Run `pnpm turbo run test typecheck lint build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-xx | 01 | 0 | INFRA-01 | integration | `pnpm turbo run typecheck` | ❌ W0 | ⬜ pending |
| 1-01-xx | 01 | 0 | INFRA-02 | integration | `pnpm turbo run typecheck` | ❌ W0 | ⬜ pending |
| 1-01-xx | 01 | 0 | INFRA-03 | unit | `pnpm test --filter=@repo/shared` | ❌ W0 | ⬜ pending |
| 1-01-xx | 01 | 1 | INFRA-04 | smoke | GitHub Actions run | ❌ W0 | ⬜ pending |
| 1-01-xx | 01 | 1 | INFRA-05 | smoke | `docker compose up -d && docker compose ps` | ❌ W0 | ⬜ pending |
| 1-01-xx | 01 | 1 | INFRA-06 | manual | Trigger test error, verify in Sentry dashboard | manual-only | ⬜ pending |
| 1-01-xx | 01 | 1 | INFRA-07 | smoke | `eas build --non-interactive` | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-01 | e2e | Playwright: sign-up flow | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-02 | e2e | Playwright: login + page refresh | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-03 | manual | Clerk Dashboard: verify reset email sent | manual-only | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-04 | unit | `pnpm test --filter=@repo/api -- auth` | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-05 | integration | Webhook handler unit test | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-06 | integration | Clerk API mock + handler test | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 1 | AUTH-07 | unit | Permission check unit test | ❌ W0 | ⬜ pending |
| 1-03-xx | 03 | 2 | TIER-01 | integration | DB seed + query test | ❌ W0 | ⬜ pending |
| 1-03-xx | 03 | 2 | TIER-02 | unit | `pnpm test --filter=@repo/api -- tier` | ❌ W0 | ⬜ pending |
| 1-03-xx | 03 | 2 | TIER-03 | e2e | Playwright: access gated feature | ❌ W0 | ⬜ pending |
| 1-03-xx | 03 | 2 | TIER-04 | integration | DB update + verify JSON | ❌ W0 | ⬜ pending |
| 1-03-xx | 03 | 2 | TIER-05 | unit | `pnpm test --filter=@repo/shared` | ❌ W0 | ⬜ pending |
| 1-03-xx | 03 | 2 | TIER-06 | unit | Intl.NumberFormat unit test | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — monorepo root shared test config
- [ ] `pnpm add -D vitest @vitest/coverage-v8 --filter=@repo/api` — install Vitest in API
- [ ] `pnpm add -D @playwright/test --filter=@repo/web` — install Playwright in web
- [ ] `packages/shared/src/__tests__/tiers.test.ts` — stubs for INFRA-03, TIER-05
- [ ] `packages/shared/src/__tests__/user.test.ts` — stubs for INFRA-03
- [ ] `apps/api/src/__tests__/auth.test.ts` — stubs for AUTH-04, AUTH-07
- [ ] `apps/api/src/__tests__/tier-gate.test.ts` — stubs for TIER-02
- [ ] `apps/api/src/__tests__/webhooks.test.ts` — stubs for AUTH-05
- [ ] `packages/db/src/__tests__/schema.test.ts` — stubs for INFRA-02, TIER-01
- [ ] `apps/web/playwright.config.ts` — Playwright config for AUTH-01, AUTH-02, TIER-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sentry captures test error | INFRA-06 | Requires live Sentry project + network call | 1. Deploy app, 2. Trigger `Sentry.captureException(new Error("test"))`, 3. Verify event appears in Sentry dashboard |
| Password reset email sent | AUTH-03 | Requires real email delivery via Clerk | 1. Click "Forgot password", 2. Enter test email, 3. Verify email received with reset link |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
