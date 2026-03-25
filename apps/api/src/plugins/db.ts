import fp from 'fastify-plugin'
import { createDb } from '@repo/db'
import type { FastifyPluginAsync } from 'fastify'

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const db = createDb(databaseUrl)
  fastify.decorate('db', db)
}

export default fp(dbPlugin, {
  name: 'db',
})

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDb>
  }
}
