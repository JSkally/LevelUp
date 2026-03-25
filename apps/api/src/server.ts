import './instrument.js'

import Fastify from 'fastify'
import autoLoad from '@fastify/autoload'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const buildServer = async () => {
  const fastify = Fastify({ logger: true })

  // Register core plugins
  await fastify.register(import('./plugins/db.js'))
  await fastify.register(import('./plugins/redis.js'))

  // Auto-load routes with /api prefix
  await fastify.register(autoLoad, {
    dir: join(__dirname, 'routes'),
    options: { prefix: '/api' },
  })

  return fastify
}

const start = async () => {
  const server = await buildServer()
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('API server listening on http://0.0.0.0:3001')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
