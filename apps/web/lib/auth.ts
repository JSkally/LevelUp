import { auth } from '@clerk/nextjs/server'
import type { UserRole } from '@repo/shared'

export const checkRole = async (role: UserRole) => {
  const { sessionClaims } = await auth()
  return (sessionClaims as any)?.metadata?.role === role
}

export const requireRole = async (role: UserRole) => {
  const { sessionClaims } = await auth()
  if ((sessionClaims as any)?.metadata?.role !== role) {
    throw new Error(`Forbidden: requires ${role}`)
  }
}
