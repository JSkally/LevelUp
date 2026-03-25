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

async function buildTierTestServer() {
  const fastify = Fastify({ logger: false })

  // Mock db decorator with configurable findFirst
  const mockFindFirst = vi.fn()
  fastify.decorate('db', {
    query: {
      users: {
        findFirst: mockFindFirst,
      },
    },
  } as any)

  const { default: clerkAuthPlugin } = await import('../plugins/clerk.js')
  await fastify.register(clerkAuthPlugin)

  const { requireTierCapability } = await import('../plugins/tierGate.js')

  // Register a test route that uses the tier gate
  fastify.get(
    '/api/test/messaging',
    { preHandler: [requireTierCapability('messaging')] },
    async () => ({ ok: true }),
  )

  fastify.get(
    '/api/test/vbt',
    { preHandler: [requireTierCapability('vbt')] },
    async () => ({ ok: true }),
  )

  await fastify.ready()
  return { fastify, mockFindFirst }
}

describe('tier gate middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 403 with TIER_GATE error and requiredCapability when capability missing', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_base' } as any)

    const { fastify, mockFindFirst } = await buildTierTestServer()
    mockFindFirst.mockResolvedValue({
      id: 'db-user-1',
      clerkId: 'user_base',
      tier: {
        name: 'base',
        capabilities: {
          messaging: false,
          vbt: false,
          analyticsDepth: 'basic',
          programTemplates: false,
          readinessEngine: false,
          multiModalityTracking: false,
          sportSpecificAssessments: false,
          maxAthletes: 5,
        },
      },
    })

    const response = await fastify.inject({ method: 'GET', url: '/api/test/messaging' })

    expect(response.statusCode).toBe(403)
    const body = response.json()
    expect(body.error).toBe('TIER_GATE')
    expect(body.requiredCapability).toBe('messaging')
    await fastify.close()
  })

  it('allows request when user tier has capability', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_pro' } as any)

    const { fastify, mockFindFirst } = await buildTierTestServer()
    mockFindFirst.mockResolvedValue({
      id: 'db-user-2',
      clerkId: 'user_pro',
      tier: {
        name: 'pro',
        capabilities: {
          messaging: true,
          vbt: false,
          analyticsDepth: 'advanced',
          programTemplates: true,
          readinessEngine: true,
          multiModalityTracking: true,
          sportSpecificAssessments: false,
          maxAthletes: 50,
        },
      },
    })

    const response = await fastify.inject({ method: 'GET', url: '/api/test/messaging' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ ok: true })
    await fastify.close()
  })

  it('403 response includes currentTier and upgradeUrl', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_base' } as any)

    const { fastify, mockFindFirst } = await buildTierTestServer()
    mockFindFirst.mockResolvedValue({
      id: 'db-user-1',
      clerkId: 'user_base',
      tier: {
        name: 'base',
        capabilities: {
          messaging: false,
          vbt: false,
          analyticsDepth: 'basic',
          programTemplates: false,
          readinessEngine: false,
          multiModalityTracking: false,
          sportSpecificAssessments: false,
          maxAthletes: 5,
        },
      },
    })

    const response = await fastify.inject({ method: 'GET', url: '/api/test/messaging' })

    expect(response.statusCode).toBe(403)
    const body = response.json()
    expect(body.currentTier).toBe('base')
    expect(body.upgradeUrl).toBe('/upgrade')
    await fastify.close()
  })

  it('elite user can access vbt capability', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_elite' } as any)

    const { fastify, mockFindFirst } = await buildTierTestServer()
    mockFindFirst.mockResolvedValue({
      id: 'db-user-3',
      clerkId: 'user_elite',
      tier: {
        name: 'elite',
        capabilities: {
          messaging: true,
          vbt: true,
          analyticsDepth: 'full',
          programTemplates: true,
          readinessEngine: true,
          multiModalityTracking: true,
          sportSpecificAssessments: true,
          maxAthletes: -1,
        },
      },
    })

    const response = await fastify.inject({ method: 'GET', url: '/api/test/vbt' })

    expect(response.statusCode).toBe(200)
    await fastify.close()
  })

  it('pro user cannot access vbt (elite-only)', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_pro' } as any)

    const { fastify, mockFindFirst } = await buildTierTestServer()
    mockFindFirst.mockResolvedValue({
      id: 'db-user-2',
      clerkId: 'user_pro',
      tier: {
        name: 'pro',
        capabilities: {
          messaging: true,
          vbt: false,
          analyticsDepth: 'advanced',
          programTemplates: true,
          readinessEngine: true,
          multiModalityTracking: true,
          sportSpecificAssessments: false,
          maxAthletes: 50,
        },
      },
    })

    const response = await fastify.inject({ method: 'GET', url: '/api/test/vbt' })

    expect(response.statusCode).toBe(403)
    const body = response.json()
    expect(body.currentTier).toBe('pro')
    expect(body.requiredCapability).toBe('vbt')
    await fastify.close()
  })

  it('returns 401 for unauthenticated request to tier-gated route', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: null } as any)

    const { fastify } = await buildTierTestServer()

    const response = await fastify.inject({ method: 'GET', url: '/api/test/messaging' })

    expect(response.statusCode).toBe(401)
    await fastify.close()
  })

  it('returns 403 with currentTier none when user has no tier assigned', async () => {
    vi.mocked(getAuth).mockReturnValue({ userId: 'user_notier' } as any)

    const { fastify, mockFindFirst } = await buildTierTestServer()
    mockFindFirst.mockResolvedValue({
      id: 'db-user-4',
      clerkId: 'user_notier',
      tier: null,
    })

    const response = await fastify.inject({ method: 'GET', url: '/api/test/messaging' })

    expect(response.statusCode).toBe(403)
    const body = response.json()
    expect(body.currentTier).toBe('none')
    await fastify.close()
  })
})
