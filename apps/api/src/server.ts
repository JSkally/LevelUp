import './instrument.js'

import Fastify from 'fastify'
import autoLoad from '@fastify/autoload'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const buildServer = async () => {
  const lokiUrl = process.env.GRAFANA_LOKI_URL
  const transport = lokiUrl
    ? {
        targets: [
          { target: 'pino/file', options: { destination: 1 } }, // stdout
          {
            target: 'pino-loki',
            options: {
              host: lokiUrl,
              basicAuth: {
                username: process.env.GRAFANA_LOKI_USER ?? '',
                password: process.env.GRAFANA_LOKI_PASSWORD ?? '',
              },
              labels: { app: 'levelup-api', env: process.env.NODE_ENV ?? 'development' },
            },
          },
        ],
      }
    : undefined

  const fastify = Fastify({ logger: { transport } })

  // Register core plugins
  await fastify.register(import('./plugins/db.js'))
  await fastify.register(import('./plugins/redis.js'))
  await fastify.register(import('./plugins/grafana.js'))

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
