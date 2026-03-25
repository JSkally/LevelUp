import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core'
import type { TierCapabilities } from '@repo/shared'

export const subscriptionTiers = pgTable(
  'subscription_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull().unique(),
    capabilities: jsonb('capabilities').$type<TierCapabilities>().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('capabilities_gin_idx').using('gin', table.capabilities),
  ],
)
