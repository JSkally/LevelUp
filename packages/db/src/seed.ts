import { execSync } from 'child_process'
import { sql } from 'drizzle-orm'
import { createDb } from './index.js'
import { subscriptionTiers } from './schema/index.js'
import { DEFAULT_TIERS } from '@repo/shared'

async function seed() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // Run migrations first
  execSync('pnpm drizzle-kit migrate', { cwd: 'packages/db', stdio: 'inherit' })

  const db = createDb(databaseUrl)

  const tierRows = Object.entries(DEFAULT_TIERS).map(([name, capabilities]) => ({
    name,
    capabilities,
  }))

  await db
    .insert(subscriptionTiers)
    .values(tierRows)
    .onConflictDoUpdate({
      target: subscriptionTiers.name,
      set: { capabilities: sql`excluded.capabilities` },
    })

  console.log('Seeded 3 subscription tiers: base, pro, elite')
}

seed().catch(console.error)
