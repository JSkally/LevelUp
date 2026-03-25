import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { subscriptionTiers } from './tiers.js'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  role: text('role').notNull().default('athlete'),
  tierId: uuid('tier_id').references(() => subscriptionTiers.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
