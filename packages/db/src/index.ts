import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema/index.js'

export const createDb = (connectionString: string) => {
  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
  return drizzle(pool, { schema })
}

export * from './schema/index.js'
export { eq, sql, and, or, desc, asc } from 'drizzle-orm'
export type { TierCapabilities } from '@repo/shared'
