import { describe, it } from 'vitest'

describe('tier gate middleware', () => {
  it.todo('returns 403 with TIER_GATE error and requiredCapability when capability missing')
  it.todo('allows request when user tier has capability')
  it.todo('403 response includes currentTier and upgradeUrl')
})
