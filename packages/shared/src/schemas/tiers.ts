import { z } from 'zod'

export const TierCapabilitiesSchema = z.object({
  messaging: z.boolean(),
  vbt: z.boolean(),
  analyticsDepth: z.enum(['basic', 'advanced', 'full']),
  programTemplates: z.boolean(),
  readinessEngine: z.boolean(),
  multiModalityTracking: z.boolean(),
  sportSpecificAssessments: z.boolean(),
  maxAthletes: z.number().int().positive().or(z.literal(-1)), // -1 = unlimited
})

export type TierCapabilities = z.infer<typeof TierCapabilitiesSchema>

// Default tier seeds
export const DEFAULT_TIERS: Record<string, TierCapabilities> = {
  base: {
    messaging: false,
    vbt: false,
    analyticsDepth: 'basic',
    programTemplates: false,
    readinessEngine: false,
    multiModalityTracking: false,
    sportSpecificAssessments: false,
    maxAthletes: 5,
  },
  pro: {
    messaging: true,
    vbt: false,
    analyticsDepth: 'advanced',
    programTemplates: true,
    readinessEngine: true,
    multiModalityTracking: true,
    sportSpecificAssessments: false,
    maxAthletes: 50,
  },
  elite: {
    messaging: true,
    vbt: true,
    analyticsDepth: 'full',
    programTemplates: true,
    readinessEngine: true,
    multiModalityTracking: true,
    sportSpecificAssessments: true,
    maxAthletes: -1,
  },
}
