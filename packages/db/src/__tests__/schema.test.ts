import { describe, it, expect } from 'vitest'
import { users, subscriptionTiers } from '../schema/index.js'

describe('schema', () => {
  it('users table has required columns', () => {
    expect(users).toBeDefined()
    expect(Object.keys(users)).toContain('clerkId')
  })
  it('subscriptionTiers table has capabilities jsonb column', () => {
    expect(subscriptionTiers).toBeDefined()
    expect(Object.keys(subscriptionTiers)).toContain('capabilities')
  })
})
