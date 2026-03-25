import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://level:level_dev@localhost:5432/level_dev',
  },
} satisfies Config
