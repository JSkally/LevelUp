import { DEFAULT_TIERS } from '@repo/shared'
import { formatCaribbeanCurrency } from '@/lib/tiers'

// Hardcoded prices for Phase 1 — live pricing from Stripe/DB in Phase 5
const TIER_PRICES: Record<string, { usd: number; jmd: number }> = {
  base: { usd: 0, jmd: 0 },
  pro: { usd: 29, jmd: 29 * 155 },
  elite: { usd: 79, jmd: 79 * 155 },
}

const CAPABILITY_LABELS: Record<string, string> = {
  messaging: 'Athlete Messaging',
  vbt: 'Velocity-Based Training',
  analyticsDepth: 'Analytics Depth',
  programTemplates: 'Program Templates',
  readinessEngine: 'Readiness Engine',
  multiModalityTracking: 'Multi-Modality Tracking',
  sportSpecificAssessments: 'Sport-Specific Assessments',
  maxAthletes: 'Max Athletes',
}

function renderCapabilityValue(value: boolean | string | number): string {
  if (typeof value === 'boolean') return value ? '✓' : '—'
  if (value === -1) return 'Unlimited'
  return String(value)
}

export default function UpgradePage() {
  const tiers = ['base', 'pro', 'elite']
  const capabilityKeys = Object.keys(DEFAULT_TIERS.base) as Array<keyof (typeof DEFAULT_TIERS)['base']>

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
      <p className="text-center text-muted-foreground mb-10">
        Unlock the features your coaching practice needs
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
              {tiers.map((tier) => (
                <th key={tier} className="text-center py-3 px-4 capitalize font-semibold">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    {TIER_PRICES[tier].usd === 0
                      ? 'Free'
                      : formatCaribbeanCurrency(TIER_PRICES[tier].usd, 'USD') + '/mo'}
                  </div>
                  {TIER_PRICES[tier].jmd > 0 && (
                    <div className="text-xs text-muted-foreground">
                      ≈ {formatCaribbeanCurrency(TIER_PRICES[tier].jmd, 'JMD')}/mo
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilityKeys.map((key) => (
              <tr key={key} className="border-t">
                <td className="py-3 px-4 text-sm">{CAPABILITY_LABELS[key] ?? key}</td>
                {tiers.map((tier) => (
                  <td key={tier} className="text-center py-3 px-4 text-sm">
                    {renderCapabilityValue(DEFAULT_TIERS[tier][key] as boolean | string | number)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <div key={tier} className="text-center">
            <button
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
              disabled={tier === 'base'}
            >
              {tier === 'base' ? 'Current Plan' : `Upgrade to ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
