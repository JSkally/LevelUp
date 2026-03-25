import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { DEFAULT_TIERS } from '@repo/shared'

interface Tier {
  id: string
  name: string
  capabilities: Record<string, unknown>
}

async function fetchTiers(): Promise<Tier[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  try {
    const res = await fetch(`${apiUrl}/api/tiers`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    // Return static defaults if API is not available during build
    return Object.entries(DEFAULT_TIERS).map(([name, capabilities], i) => ({
      id: `static-${i}`,
      name,
      capabilities: capabilities as Record<string, unknown>,
    }))
  }
}

export default async function AdminTiersPage() {
  try {
    await requireRole('admin')
  } catch {
    redirect('/dashboard')
  }

  const tiers = await fetchTiers()
  const capabilityKeys = Object.keys(DEFAULT_TIERS.base)

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Tier Management</h1>
      <p className="text-muted-foreground mb-8">
        Update tier capabilities — changes take effect immediately (no schema migration required).
      </p>

      <div className="space-y-8">
        {tiers.map((tier) => (
          <div key={tier.id} className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold capitalize mb-4">{tier.name} Tier</h2>
            <form
              action={async (formData: FormData) => {
                'use server'
                const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
                const updated: Record<string, unknown> = {}
                const defaultBase = DEFAULT_TIERS['base']
                for (const key of capabilityKeys) {
                  const raw = formData.get(key)
                  const defaultVal = defaultBase[key as keyof typeof defaultBase]
                  if (typeof defaultVal === 'boolean') {
                    updated[key] = raw === 'true'
                  } else if (typeof defaultVal === 'number') {
                    updated[key] = raw === '-1' ? -1 : Number(raw)
                  } else {
                    updated[key] = raw
                  }
                }
                const res = await fetch(`${apiUrl}/api/tiers/${tier.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updated),
                })
                if (!res.ok) throw new Error('Failed to update tier')
              }}
            >
              <div className="space-y-3">
                {capabilityKeys.map((key) => {
                  const value = tier.capabilities[key]
                  const defaultTierBase = DEFAULT_TIERS['base']
                  const defaultValue = defaultTierBase[key as keyof typeof defaultTierBase]
                  const isBool = typeof defaultValue === 'boolean'
                  const isNum = typeof defaultValue === 'number'

                  return (
                    <div key={key} className="flex items-center justify-between">
                      <label htmlFor={`${tier.id}-${key}`} className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {isBool ? (
                        <select
                          id={`${tier.id}-${key}`}
                          name={key}
                          defaultValue={String(value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : isNum ? (
                        <input
                          id={`${tier.id}-${key}`}
                          name={key}
                          type="number"
                          defaultValue={String(value)}
                          min="-1"
                          className="border rounded px-2 py-1 text-sm w-24"
                        />
                      ) : (
                        <select
                          id={`${tier.id}-${key}`}
                          name={key}
                          defaultValue={String(value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="basic">Basic</option>
                          <option value="advanced">Advanced</option>
                          <option value="full">Full</option>
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>

              <button
                type="submit"
                className="mt-6 w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium"
              >
                Save {tier.name.charAt(0).toUpperCase() + tier.name.slice(1)} Tier
              </button>
            </form>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Tier updated — changes take effect immediately
      </p>
    </div>
  )
}
