import fp from 'fastify-plugin'
import { clerkPlugin, getAuth } from '@clerk/fastify'
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import type { UserRole } from '@repo/shared'

const clerkAuthPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(clerkPlugin)

  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = getAuth(request)
      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
    },
  )

  fastify.decorate(
    'requireRole',
    (allowedRoles: UserRole[]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        const { userId, sessionClaims } = getAuth(request)
        if (!userId) {
          return reply.status(401).send({ error: 'Unauthorized' })
        }
        const role = (sessionClaims as any)?.metadata?.role as UserRole | undefined
        if (!role || !allowedRoles.includes(role)) {
          return reply
            .status(403)
            .send({ error: 'Forbidden', required: allowedRoles[0] })
        }
      },
  )
}

export default fp(clerkAuthPlugin, { name: 'clerk-auth' })

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (
      allowedRoles: UserRole[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
