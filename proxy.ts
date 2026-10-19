import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// First line of defence only. Every admin page, Server Action and mutating route
// re-checks the session on the server (lib/auth-guard.ts).
export default auth((req) => {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const adminId = process.env.ADMIN_GITHUB_ID
  const isAdmin = Boolean(adminId && req.auth?.user?.githubId === adminId)
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/admin/login', req.nextUrl.origin))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
