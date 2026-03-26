# Cloudflare Pages (CDN for Next.js web app)

Cloudflare Pages deploys the Next.js web app with global CDN distribution.

## Setup

1. Connect the GitHub repo to Cloudflare Pages (Cloudflare Dashboard -> Pages -> Create application -> Connect to Git)
2. Build settings:
   - Build command: `pnpm --filter @repo/web build`
   - Build output directory: `apps/web/.next`
   - Framework preset: Next.js
3. Add environment variables in Cloudflare Pages dashboard (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, etc.)
4. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as GitHub secrets for CI deployment

Alternatively, use the deploy.yml workflow with wrangler pages deploy (requires CLOUDFLARE_API_TOKEN secret).
