import { connection } from 'next/server'
import Link from 'next/link'
import AvailabilityToggle from '@/components/admin/availability-toggle'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function AdminDashboard() {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
  const [projects, published, certs, unread, latest, settings] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { published: true } }),
    db.certification.count(),
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    db.siteSettings.findUnique({ where: { id: 'singleton' } }),
  ])
  const formatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Everything you change here goes live on the site immediately.</p>
        </div>
        <div className="btn-row">
          <a className="btn" href="/" target="_blank" rel="noreferrer">View site</a>
          <Link className="btn primary" href="/admin/projects/new">New project</Link>
        </div>
      </div>

      <div className="grid stats">
        <div className="card stat"><strong>{projects}</strong><span>Projects</span></div>
        <div className="card stat"><strong>{published}</strong><span>Published</span></div>
        <div className="card stat"><strong>{certs}</strong><span>Certifications</span></div>
        <div className="card stat"><strong>{unread}</strong><span>Unread messages</span></div>
      </div>

      <div className="grid two">
        <div className="card">
          <div className="admin-head" style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Latest messages</h2>
            <Link className="btn small" href="/admin/inbox">Open inbox</Link>
          </div>
          {latest.length === 0 ? (
            <p className="empty">No messages yet.</p>
          ) : (
            <div className="rows">
              {latest.map((message) => (
                <div key={message.id} className={message.read ? 'message' : 'message unread'}>
                  <header>
                    <strong>{message.name}</strong>
                    <span className="small muted">{formatter.format(message.createdAt)}</span>
                  </header>
                  <div className="meta"><span>{message.email}</span>{message.budget && <span>{message.budget}</span>}{message.timeline && <span>{message.timeline}</span>}</div>
                  <p style={{ marginTop: 8 }}>{message.message.length > 180 ? `${message.message.slice(0, 180)}...` : message.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2>Availability</h2>
          <AvailabilityToggle initial={settings?.isAvailable ?? true} text={settings?.availabilityText ?? 'Not set'} />
          <p className="small" style={{ marginTop: 12 }}><Link href="/admin/settings">Edit availability text and other settings</Link></p>
        </div>
      </div>
    </>
  )
}
