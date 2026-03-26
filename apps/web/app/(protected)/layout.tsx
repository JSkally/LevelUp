import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

// All protected routes require runtime auth — disable static prerendering
export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <>{children}</>
}
