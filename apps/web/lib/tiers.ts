'use client'
import { useUser } from '@clerk/nextjs'
import type { TierCapabilities, CaribbeanCurrency } from '@repo/shared'

export const formatCaribbeanCurrency = (amount: number, currency: CaribbeanCurrency): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const useTierCapability = (capability: keyof TierCapabilities): boolean => {
  const { user } = useUser()
  // Tier capabilities stored in user.publicMetadata after server sets them
  const caps = user?.publicMetadata?.tierCapabilities as TierCapabilities | undefined
  const value = caps?.[capability]
  if (value === undefined || value === null) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0 || value === -1
  return Boolean(value)
}
