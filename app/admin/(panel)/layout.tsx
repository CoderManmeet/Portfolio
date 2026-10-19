import { Suspense } from 'react'
import { signOutAction } from '@/app/admin/actions'
import AdminNav from '@/components/admin/admin-nav'
import { requireAdmin } from '@/lib/auth-guard'
import { db } from '@/lib/db'

// The admin panel is private and always reads fresh data per request, so navigations
// between admin pages are allowed to wait for the server (no instant-navigation check).
export const instant = false

async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  const unread = await db.contactMessage.count({ where: { read: false } })
  return (
    <div className="admin">
      <header className="admin-top">
        <span className="brand">MS / ADMIN</span>
        <AdminNav unread={unread} />
        <div className="right">
          <a href="/" target="_blank" rel="noreferrer">View site</a>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  )
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="admin"><main className="admin-main"><p className="muted">Loading...</p></main></div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  )
}
