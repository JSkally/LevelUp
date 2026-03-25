'use client'
import { useTierCapability } from '@/lib/tiers'
import type { TierCapabilities } from '@repo/shared'
import Link from 'next/link'

interface TierGateProps {
  capabilityKey: keyof TierCapabilities
  children: React.ReactNode
  upgradeMessage?: string
}

export function TierGate({ capabilityKey, children, upgradeMessage }: TierGateProps) {
  const hasCapability = useTierCapability(capabilityKey)

  if (!hasCapability) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-40 select-none">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
          <span className="text-2xl mb-2" aria-hidden="true">
            🔒
          </span>
          <p className="text-sm text-muted-foreground mb-3">
            {upgradeMessage ?? 'This feature requires a higher tier'}
          </p>
          <Link href="/upgrade" className="text-sm font-medium underline">
            Upgrade your plan
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
