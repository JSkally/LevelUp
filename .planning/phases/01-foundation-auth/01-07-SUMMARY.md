---
phase: 01-foundation-auth
plan: 07
subsystem: infra
tags: [ecs, fargate, ecr, cloudflare-pages, github-actions, docker, aws, oidc]

# Dependency graph
requires:
  - phase: 01-05
    provides: Docker build artifacts and Fastify API on port 3001

provides:
  - ECS Fargate task definition and service config for levelup-api
  - GitHub Actions deploy.yml two-job workflow (API to ECS, web to Cloudflare Pages)
  - Cloudflare Pages wrangler.toml for Next.js web app
  - AWS OIDC role-based deploy pattern (no long-lived keys)

affects:
  - All future phases deploying to production
  - Phase 2+ requiring production environment

# Tech tracking
tech-stack:
  added:
    - aws-actions/configure-aws-credentials@v4 (OIDC)
    - aws-actions/amazon-ecr-login@v2
    - aws-actions/amazon-ecs-render-task-definition@v1
    - aws-actions/amazon-ecs-deploy-task-definition@v1
    - cloudflare/pages-action@v1
  patterns:
    - AWS OIDC role assumption in GitHub Actions (no static IAM keys)
    - ECS Fargate secrets pulled from AWS Secrets Manager at runtime
    - Two-job deploy workflow with independent API and web deployment
    - Deployment circuit breaker with automatic rollback

key-files:
  created:
    - infra/ecs/task-definition.json
    - infra/ecs/service.json
    - infra/ecs/README.md
    - infra/cloudflare/wrangler.toml
    - infra/cloudflare/README.md
    - .github/workflows/deploy.yml
  modified:
    - .env.example

key-decisions:
  - "OIDC role assumption used for AWS auth in GitHub Actions — no long-lived AWS_ACCESS_KEY_ID/SECRET needed"
  - "ECS secrets pulled from AWS Secrets Manager via valueFrom ARNs — no plaintext env vars in task definition"
  - "deploy-web job has needs: [] — runs in parallel with deploy-api, not blocked by it"
  - "deploy.yml triggers on push to main only — no automatic deploys from feature branches"

patterns-established:
  - "Infra configs as code: all placeholders (ACCOUNT_ID, REGION) documented for developer substitution"
  - "Deployment circuit breaker enabled with rollback — zero-downtime deploys with auto-recovery"
  - "Docker image tagged with both git SHA (immutable) and :latest (convenience)"

requirements-completed: [INFRA-04, INFRA-05]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 1 Plan 7: Production Deploy Infrastructure Summary

**ECS Fargate task definition + GitHub Actions two-job deploy workflow (ECR/ECS + Cloudflare Pages) with OIDC AWS auth and Secrets Manager secret injection**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-26T23:45:32Z
- **Completed:** 2026-03-26T23:48:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- ECS Fargate task definition with all API env vars sourced from Secrets Manager (no plaintext secrets in config)
- GitHub Actions deploy workflow with OIDC role-based AWS auth, Docker ECR push, ECS service update, and Cloudflare Pages deploy
- Cloudflare Pages wrangler.toml wired to Next.js build output at apps/web/.next
- Developer setup README files for both ECS and Cloudflare with first-deploy CLI commands

## Task Commits

Each task was committed atomically:

1. **Task 1: ECS Fargate task definition and service config** - `45bd5f7` (feat)
2. **Task 2: Cloudflare CDN config + GitHub Actions deploy workflow** - `c894c56` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `infra/ecs/task-definition.json` - Fargate task definition: levelup-api container on port 3001 with Secrets Manager secret injection and CloudWatch log config
- `infra/ecs/service.json` - ECS service config: FARGATE launch type, deployment circuit breaker with rollback, ALB target group reference
- `infra/ecs/README.md` - First-deploy instructions: ECR auth, image push, task registration, service creation
- `infra/cloudflare/wrangler.toml` - Cloudflare Pages config pointing to apps/web/.next build output
- `infra/cloudflare/README.md` - Dashboard setup guide for Cloudflare Pages connection and env vars
- `.github/workflows/deploy.yml` - Two-job workflow: deploy-api (OIDC AWS auth -> ECR push -> ECS deploy) and deploy-web (build -> Cloudflare Pages) running in parallel on main push
- `.env.example` - Added AWS_DEPLOY_ROLE_ARN, AWS_REGION, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, SENTRY_AUTH_TOKEN placeholders

## Decisions Made

- OIDC role assumption for AWS GitHub Actions auth: no long-lived IAM access keys stored as secrets, tokens are ephemeral and scoped to the deploy job.
- ECS secrets via Secrets Manager valueFrom ARNs: secrets never appear in task definition JSON, ECR image layers, or GitHub Actions logs.
- deploy-web runs with `needs: []`: API and web deployments are independent and run in parallel, reducing total deploy time.
- Deployment circuit breaker with rollback enabled: ECS will auto-rollback if new tasks fail health checks, preventing bad deployments from staying up.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Before the deploy workflow can run successfully, the developer must:

1. Create AWS infrastructure: ECR repository (`levelup-api`), ECS cluster (`levelup-production`), VPC, subnets, security groups, ALB, and target group
2. Create AWS Secrets Manager secrets for each `valueFrom` ARN in `infra/ecs/task-definition.json`
3. Create IAM roles: `ecsTaskExecutionRole` (AmazonECSTaskExecutionRolePolicy + SecretsManagerReadWrite) and `ecsTaskRole`
4. Create AWS OIDC provider for GitHub Actions and create the `github-actions-deploy` IAM role
5. Replace all `ACCOUNT_ID`, `REGION`, `SUBNET_ID_*`, `SECURITY_GROUP_ID` placeholders in `infra/ecs/` files
6. Connect GitHub repo to Cloudflare Pages in the Cloudflare Dashboard
7. Set all GitHub Actions secrets: `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_API_URL`, Sentry secrets

See `infra/ecs/README.md` and `infra/cloudflare/README.md` for step-by-step setup.

## Next Phase Readiness

- INFRA-04 closed: CI now has a deploy step triggered on main push
- INFRA-05 closed: ECS Fargate + Cloudflare CDN infrastructure config exists as code
- Phase 1 foundation complete — auth, observability, tier gates, admin UI, EAS builds, and deploy pipeline all configured
- Phase 2 (program builder) can begin; production infrastructure activation deferred to first release milestone

---
*Phase: 01-foundation-auth*
*Completed: 2026-03-26*
