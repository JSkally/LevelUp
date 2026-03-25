import { relations } from 'drizzle-orm'
import { users } from './users.js'
import { subscriptionTiers } from './tiers.js'

export const usersRelations = relations(users, ({ one }) => ({
  tier: one(subscriptionTiers, { fields: [users.tierId], references: [subscriptionTiers.id] }),
}))

export * from './tiers.js'
export * from './users.js'
