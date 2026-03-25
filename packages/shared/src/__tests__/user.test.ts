import { describe, it, expect } from 'vitest'
import { UserRoleSchema } from '../schemas/user.js'

describe('UserRoleSchema', () => {
  it('accepts valid roles', () => {
    expect(UserRoleSchema.parse('athlete')).toBe('athlete')
    expect(UserRoleSchema.parse('trainer')).toBe('trainer')
    expect(UserRoleSchema.parse('admin')).toBe('admin')
    expect(UserRoleSchema.parse('assistant_coach')).toBe('assistant_coach')
  })
  it('rejects invalid role', () => {
    expect(() => UserRoleSchema.parse('superuser')).toThrow()
  })
})
