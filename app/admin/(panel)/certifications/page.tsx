import CertificationsEditor from '@/components/admin/certifications-editor'
import { db } from '@/lib/db'

export default async function AdminCertificationsPage() {
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
