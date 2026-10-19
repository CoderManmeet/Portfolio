import type { Session } from 'next-auth'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { auth } from '@/auth'

export function isAdminSession(session: Session | null): session is Session {
  const adminId = process.env.ADMIN_GITHUB_ID
  return Boolean(adminId && session?.user?.githubId === adminId)
}

// For admin pages: redirect anyone who is not the admin.
// connection() first: admin rendering is always request-time, and Auth.js generates
// random CSRF values that Cache Components does not allow during prerendering.
export async function requireAdmin(): Promise<Session> {
  await connection()
  const session = await auth()
  if (!isAdminSession(session)) redirect('/admin/login')
  return session
}

// For Server Actions and route handlers: true only for the admin.
export async function checkAdmin(): Promise<boolean> {
  const session = await auth()
  return isAdminSession(session)
}
