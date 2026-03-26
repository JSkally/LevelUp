import { auth } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth()
  const claims = sessionClaims as { metadata?: { role?: string } } | null
  const role = claims?.metadata?.role ?? 'athlete'

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome to LevelUP</h1>
      <p className="mt-2 text-gray-600">User ID: {userId}</p>
      <p className="mt-1 text-gray-600">Role: {role}</p>
    </main>
  )
}
