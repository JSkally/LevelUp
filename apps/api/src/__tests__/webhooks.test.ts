import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fastify from 'fastify'

// Mock @clerk/fastify before any imports
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

// Mock svix Webhook
const mockVerify = vi.fn()
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({
    verify: mockVerify,
  })),
}))

const { clerkClient } = await import('@clerk/fastify')

async function buildWebhookTestServer() {
  const fastify = Fastify({ logger: false })
  const { default: clerkAuthPlugin } = await import('../plugins/clerk.js')
  await fastify.register(clerkAuthPlugin)

  const { default: webhookRoutes } = await import('../routes/webhooks/clerk.js')
  await fastify.register(webhookRoutes, { prefix: '/api' })

  await fastify.ready()
  return fastify
}

describe('Clerk webhook handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  it('assigns default role athlete on user.created event', async () => {
    const userId = 'user_abc123'
    const webhookPayload = {
      type: 'user.created',
      data: { id: userId },
    }

    mockVerify.mockReturnValue(webhookPayload)
    vi.mocked(clerkClient.users.updateUser).mockResolvedValue({} as any)

    const fastify = await buildWebhookTestServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/webhooks/clerk',
      headers: {
        'svix-id': 'msg_test123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,test_signature',
        'content-type': 'application/json',
      },
      payload: JSON.stringify(webhookPayload),
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ received: true })
    expect(clerkClient.users.updateUser).toHaveBeenCalledWith(userId, {
      publicMetadata: { role: 'athlete' },
    })
    await fastify.close()
  })

  it('rejects requests with invalid svix signature', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const fastify = await buildWebhookTestServer()
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/webhooks/clerk',
      headers: {
        'svix-id': 'msg_bad',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,bad_signature',
        'content-type': 'application/json',
      },
      payload: JSON.stringify({ type: 'user.created', data: { id: 'user_xyz' } }),
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: 'Invalid signature' })
    await fastify.close()
  })
})
