import type { FastifyPluginAsync } from 'fastify'
import { getAuth } from '@clerk/fastify'

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Public health check
  fastify.get('/health', async (_request, _reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Protected health check — demonstrates auth + role extraction
  fastify.get(
    '/health/protected',
    { preHandler: [fastify.authenticate] },
    async (request, _reply) => {
      const { userId, sessionClaims } = getAuth(request)
      const role = (sessionClaims as any)?.metadata?.role
      return { userId, role }
    },
  )
}

export default healthRoutes
