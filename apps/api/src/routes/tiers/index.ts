import type { FastifyPluginAsync } from 'fastify'
import { eq, subscriptionTiers } from '@repo/db'
import { TierCapabilitiesSchema } from '@repo/shared'

const tiersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/tiers — public, returns all tiers with name + capabilities
  fastify.get('/tiers', async (_request, _reply) => {
    const tiers = await fastify.db
      .select({ id: subscriptionTiers.id, name: subscriptionTiers.name, capabilities: subscriptionTiers.capabilities })
      .from(subscriptionTiers)
    return tiers
  })

  // PUT /api/tiers/:id — admin only, updates capabilities JSONB without schema migration
  fastify.put<{ Params: { id: string }; Body: unknown }>(
    '/tiers/:id',
    { preHandler: [fastify.authenticate, fastify.requireRole(['admin'])] },
    async (request, reply) => {
      const parsed = TierCapabilitiesSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Invalid capabilities', details: parsed.error.issues })
      }

      const updated = await fastify.db
        .update(subscriptionTiers)
        .set({ capabilities: parsed.data, updatedAt: new Date() })
        .where(eq(subscriptionTiers.id, request.params.id))
        .returning()

      if (updated.length === 0) {
        return reply.status(404).send({ error: 'Tier not found' })
      }

      return updated[0]
    },
  )
}

export default tiersRoutes
