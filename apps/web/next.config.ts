import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/shared', '@repo/db'],
  webpack(config) {
    // Resolve TypeScript ESM imports (.js -> .ts) for transpiled workspace packages
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    }
    return config
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
  automaticVercelMonitors: false,
})
