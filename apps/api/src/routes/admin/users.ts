import type { FastifyPluginAsync } from 'fastify'
import { clerkClient } from '@clerk/fastify'
import type { UserRole } from '@repo/shared'

const VALID_ROLES: UserRole[] = ['athlete', 'trainer', 'admin', 'assistant_coach']

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && (VALID_ROLES as string[]).includes(role)
}

const adminUsersRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /admin/users — list all users (admin only)
  fastify.get(
    '/admin/users',
    { preHandler: [fastify.requireRole(['admin'])] },
    async (_request, _reply) => {
      const userList = await clerkClient.users.getUserList({ limit: 100 })
      return userList.data.map((user) => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? '',
        role: (user.publicMetadata?.role as UserRole | undefined) ?? null,
      }))
    },
  )

  // PUT /admin/users/:id/role — update user role (admin only)
  fastify.put(
    '/admin/users/:id/role',
    { preHandler: [fastify.requireRole(['admin'])] },
    async (request, reply) => {
      const { id } = request.params as { id: string }

      const roleInput = (request.body as { role?: unknown })?.role
      if (!isValidRole(roleInput)) {
        return reply.status(400).send({
          error: 'Invalid role',
          message: 'Role must be one of: athlete, trainer, admin, assistant_coach',
        })
      }

      const role = roleInput

      await clerkClient.users.updateUser(id, {
        publicMetadata: { role },
      })

      return { success: true, userId: id, role }
    },
  )
}

export default adminUsersRoutes
