import { auth } from '@clerk/nextjs/server'
import type { UserRole } from '@repo/shared'

export const checkRole = async (role: UserRole) => {
  const { sessionClaims } = await auth()
  const claims = sessionClaims as { metadata?: { role?: string } } | null
  return claims?.metadata?.role === role
}

export const requireRole = async (role: UserRole) => {
  const { sessionClaims } = await auth()
  const claims = sessionClaims as { metadata?: { role?: string } } | null
  if (claims?.metadata?.role !== role) {
    throw new Error(`Forbidden: requires ${role}`)
  }
}
