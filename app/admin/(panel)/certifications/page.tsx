import { connection } from 'next/server'
import CertificationsEditor from '@/components/admin/certifications-editor'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function AdminCertificationsPage() {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
  const rows = await db.certification.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Certifications</h1>
          <p className="muted">Edit inline. Drag to reorder.</p>
        </div>
      </div>
      <CertificationsEditor initial={rows.map((row) => ({ id: row.id, name: row.name, issuer: row.issuer, date: row.date, credentialUrl: row.credentialUrl ?? '', category: row.category, order: row.order }))} />
    </>
  )
}
