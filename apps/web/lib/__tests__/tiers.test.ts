import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @clerk/nextjs before importing hook
vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn(),
}))

describe('formatCaribbeanCurrency', () => {
  it('formats JMD correctly using Intl.NumberFormat', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'JMD')
    // Intl.NumberFormat output depends on ICU data; verify amount and currency are present
    expect(result).toContain('100.00')
    expect(result.toUpperCase()).toContain('JMD')
  })

  it('formats TTD correctly', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'TTD')
    expect(result).toContain('100.00')
  })

  it('formats USD with $ prefix', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'USD')
    expect(result).toMatch(/\$100\.00/)
  })

  it('formats BBD correctly', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'BBD')
    expect(result).toContain('100.00')
  })

  it('formats GYD correctly', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'GYD')
    expect(result).toContain('100.00')
  })

  it('formats BSD correctly', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'BSD')
    expect(result).toContain('100.00')
  })

  it('formats XCD correctly', async () => {
    const { formatCaribbeanCurrency } = await import('../tiers.js')
    const result = formatCaribbeanCurrency(100, 'XCD')
    expect(result).toContain('100.00')
  })
})

describe('useTierCapability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false when user has no tierCapabilities in publicMetadata', async () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValue({ user: { publicMetadata: {} } } as any)

    const { useTierCapability } = await import('../tiers.js')
    const result = useTierCapability('messaging')
    expect(result).toBe(false)
  })

  it('returns true when user publicMetadata.tierCapabilities has the capability', async () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValue({
      user: {
        publicMetadata: {
          tierCapabilities: {
            messaging: true,
            vbt: false,
            analyticsDepth: 'advanced',
            programTemplates: true,
            readinessEngine: true,
            multiModalityTracking: true,
            sportSpecificAssessments: false,
            maxAthletes: 50,
          },
        },
      },
    } as any)

    const { useTierCapability } = await import('../tiers.js')
    const result = useTierCapability('messaging')
    expect(result).toBe(true)
  })

  it('returns false when capability is explicitly false', async () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValue({
      user: {
        publicMetadata: {
          tierCapabilities: {
            messaging: true,
            vbt: false,
            analyticsDepth: 'advanced',
            programTemplates: true,
            readinessEngine: true,
            multiModalityTracking: true,
            sportSpecificAssessments: false,
            maxAthletes: 50,
          },
        },
      },
    } as any)

    const { useTierCapability } = await import('../tiers.js')
    const result = useTierCapability('vbt')
    expect(result).toBe(false)
  })

  it('returns false when user is null', async () => {
    const { useUser } = await import('@clerk/nextjs')
    vi.mocked(useUser).mockReturnValue({ user: null } as any)

    const { useTierCapability } = await import('../tiers.js')
    const result = useTierCapability('messaging')
    expect(result).toBe(false)
  })
})
