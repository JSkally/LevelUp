import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'

const grafanaPlugin: FastifyPluginAsync = async (fastify) => {
  const lokiUrl = process.env.GRAFANA_LOKI_URL
  const lokiUser = process.env.GRAFANA_LOKI_USER
  const lokiPassword = process.env.GRAFANA_LOKI_PASSWORD

  // Skip silently in development or when credentials are not configured
  if (!lokiUrl || !lokiUser || !lokiPassword) {
    fastify.log.info('Grafana Loki not configured — skipping (set GRAFANA_LOKI_URL, GRAFANA_LOKI_USER, GRAFANA_LOKI_PASSWORD)')
    return
  }

  // pino-loki transport is configured at the Fastify logger level via transport
  // This plugin validates credentials and logs the integration status at startup
  fastify.log.info({ lokiUrl }, 'Grafana Loki transport active')
}

export default fp(grafanaPlugin, { name: 'grafana' })
