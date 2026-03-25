import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/shared', '@repo/db'],
}

// withSentryConfig stub — Sentry will be fully wired in Plan 02
export default nextConfig
