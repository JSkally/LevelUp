import { describe, it, expect } from 'vitest'
import { TierCapabilitiesSchema, DEFAULT_TIERS } from '../schemas/tiers.js'

describe('TierCapabilitiesSchema', () => {
  it('validates base tier defaults', () => {
    expect(() => TierCapabilitiesSchema.parse(DEFAULT_TIERS.base)).not.toThrow()
  })
  it('validates pro tier defaults', () => {
    expect(() => TierCapabilitiesSchema.parse(DEFAULT_TIERS.pro)).not.toThrow()
  })
  it('validates elite tier defaults', () => {
    expect(() => TierCapabilitiesSchema.parse(DEFAULT_TIERS.elite)).not.toThrow()
  })
  it('base tier has messaging: false', () => {
    expect(DEFAULT_TIERS.base.messaging).toBe(false)
  })
  it('elite tier has vbt: true', () => {
    expect(DEFAULT_TIERS.elite.vbt).toBe(true)
  })
})
