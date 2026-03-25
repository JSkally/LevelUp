import { describe, it } from 'vitest'

describe('auth middleware', () => {
  it.todo('returns 401 when no auth token provided')
  it.todo('returns user role from JWT sessionClaims.metadata.role')
  it.todo('assistant_coach cannot access program create endpoint')
})
