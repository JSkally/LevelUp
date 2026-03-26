import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

interface ClerkUser {
  id: string
  email: string
  role: string | null
}

const ROLES = ['athlete', 'trainer', 'admin', 'assistant_coach'] as const

async function fetchUsers(): Promise<ClerkUser[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  try {
    const res = await fetch(`${apiUrl}/api/admin/users`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function AdminUsersPage() {
  try {
    await requireRole('admin')
  } catch {
    redirect('/dashboard')
  }

  const users = await fetchUsers()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">User Role Management</h1>
      <p className="text-muted-foreground mb-8">
        Assign or change user roles. Changes take effect on the user&apos;s next sign-in.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User ID</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Current Role</th>
              <th className="text-left px-4 py-3 font-medium">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No users found or API unavailable.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                    {user.id}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                      {user.role ?? 'none'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={async (formData: FormData) => {
                        'use server'
                        const apiUrl =
                          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
                        const newRole = formData.get('role') as string
                        await fetch(`${apiUrl}/api/admin/users/${user.id}/role`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ role: newRole }),
                        })
                      }}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="role"
                        defaultValue={user.role ?? ''}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
