import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'

// Mock @clerk/fastify before importing anything that uses it
vi.mock('@clerk/fastify', () => ({
  clerkPlugin: vi.fn(async (_fastify: any) => {
    // No-op mock plugin
  }),
  getAuth: vi.fn(),
  clerkClient: {
    users: {
      updateUser: vi.fn(),
      getUserList: vi.fn(),
    },
  },
}))

const { getAuth, clerkClient } = await import('@clerk/fastify')

async function buildAdminTestServer() {
  const fastify = Fastify({ logger: false })
  const { default: clerkAuthPlugin } = await import('../../plugins/clerk.js')
  await fastify.register(clerkAuthPlugin)

  const { default: adminUsersRoutes } = await import('./users.js')
  await fastify.register(adminUsersRoutes, { prefix: '/api' })

  await fastify.ready()
  return fastify
}

describe('PUT /api/admin/users/:id/role', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 and calls clerkClient.users.updateUser for admin user', async () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: 'admin_user_123',
      sessionClaims: { metadata: { role: 'admin' } },
    } as any)
    vi.mocked(clerkClient.users.updateUser).mockResolvedValue({} as any)

    const fastify = await buildAdminTestServer()
    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/admin/users/target_user_456/role',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ role: 'trainer' }),
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      success: true,
      userId: 'target_user_456',
      role: 'trainer',
    })
    expect(clerkClient.users.updateUser).toHaveBeenCalledWith('target_user_456', {
      publicMetadata: { role: 'trainer' },
    })
    await fastify.close()
  })

  it('returns 403 for non-admin user', async () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: 'trainer_user_789',
      sessionClaims: { metadata: { role: 'trainer' } },
    } as any)

    const fastify = await buildAdminTestServer()
    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/admin/users/target_user_456/role',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ role: 'athlete' }),
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ error: 'Forbidden' })
    await fastify.close()
  })

  it('returns 400 for invalid role value', async () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: 'admin_user_123',
      sessionClaims: { metadata: { role: 'admin' } },
    } as any)

    const fastify = await buildAdminTestServer()
    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/admin/users/target_user_456/role',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ role: 'superuser' }),
    })

    expect(response.statusCode).toBe(400)
    await fastify.close()
  })

  it('returns 401 for unauthenticated request', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: null } as any)

    const fastify = await buildAdminTestServer()
    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/admin/users/target_user_456/role',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ role: 'athlete' }),
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({ error: 'Unauthorized' })
    await fastify.close()
  })
})
