import { getAuth } from '@clerk/fastify'
import { eq, users, subscriptionTiers } from '@repo/db'
import type { TierCapabilities } from '@repo/shared'
import type { FastifyRequest, FastifyReply } from 'fastify'

type UserWithTier = {
  id: string
  clerkId: string
  role: string
  tierId: string | null
  tier: typeof subscriptionTiers.$inferSelect | null
}

export const requireTierCapability = (capability: keyof TierCapabilities) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = getAuth(request)
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' })

    const user = (await request.server.db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      with: { tier: true },
    })) as UserWithTier | undefined

    const caps = user?.tier?.capabilities as TierCapabilities | null
    if (!caps?.[capability]) {
      return reply.status(403).send({
        error: 'TIER_GATE',
        requiredCapability: capability,
        currentTier: user?.tier?.name ?? 'none',
        upgradeUrl: '/upgrade',
      })
    }
  }
}
