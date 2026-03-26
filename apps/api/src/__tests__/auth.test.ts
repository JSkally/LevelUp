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
    },
  },
}))

const { getAuth } = await import('@clerk/fastify')

async function buildTestServer() {
  const fastify = Fastify({ logger: false })
  const { default: clerkAuthPlugin } = await import('../plugins/clerk.js')
  await fastify.register(clerkAuthPlugin)

  const { default: healthRoutes } = await import('../routes/health/index.js')
  await fastify.register(healthRoutes, { prefix: '/api' })

  await fastify.ready()
  return fastify
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no auth token provided', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: null } as any)

    const fastify = await buildTestServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/health/protected',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ error: 'Unauthorized' })
    await fastify.close()
  })

  it('returns user role from JWT sessionClaims.metadata.role', async () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: 'user_123',
      sessionClaims: { metadata: { role: 'admin' } },
    } as any)

    const fastify = await buildTestServer()
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/health/protected',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.userId).toBe('user_123')
    expect(body.role).toBe('admin')
    await fastify.close()
  })

  it('assistant_coach cannot access program create endpoint', async () => {
    vi.mocked(getAuth).mockReturnValue({
      userId: 'user_456',
      sessionClaims: { metadata: { role: 'assistant_coach' } },
    } as any)

    // Build a server with a programs route requiring trainer/admin role
    const fastify = Fastify({ logger: false })
    const { default: clerkAuthPlugin } = await import('../plugins/clerk.js')
    await fastify.register(clerkAuthPlugin)

    const { default: healthRoutes } = await import('../routes/health/index.js')
    await fastify.register(healthRoutes, { prefix: '/api' })

    // Register programs route before ready()
    fastify.post(
      '/api/programs',
      { preHandler: [fastify.requireRole(['trainer', 'admin'])] },
      async () => ({ ok: true }),
    )

    await fastify.ready()

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/programs',
    })

    expect(response.statusCode).toBe(403)
    expect(response.json()).toMatchObject({ error: 'Forbidden' })
    await fastify.close()
  })
})
