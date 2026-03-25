import type { FastifyPluginAsync } from 'fastify'
import { Webhook } from 'svix'
import { clerkClient } from '@clerk/fastify'

const clerkWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  // Register raw body parser so svix can verify the signature
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req, body, done) => done(null, body),
  )

  fastify.post('/webhooks/clerk', async (request, reply) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      return reply.status(500).send({ error: 'Webhook secret not configured' })
    }

    const svixId = request.headers['svix-id'] as string
    const svixTimestamp = request.headers['svix-timestamp'] as string
    const svixSignature = request.headers['svix-signature'] as string

    const wh = new Webhook(webhookSecret)
    let event: { type: string; data: { id: string } }

    try {
      event = wh.verify(request.body as Buffer, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as { type: string; data: { id: string } }
    } catch (_err) {
      return reply.status(400).send({ error: 'Invalid signature' })
    }

    if (event.type === 'user.created') {
      await clerkClient.users.updateUser(event.data.id, {
        publicMetadata: { role: 'athlete' },
      })
    }

    return { received: true }
  })
}

export default clerkWebhookRoutes
