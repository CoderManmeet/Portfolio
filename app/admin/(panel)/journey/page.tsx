import JourneyEditor from '@/components/admin/journey-editor'
import { db } from '@/lib/db'

export default async function AdminJourneyPage() {
  const rows = await db.journeyItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Journey</h1>
          <p className="muted">Timeline on the home page. Drag to reorder.</p>
        </div>
      </div>
      <JourneyEditor initial={rows.map((row) => ({ id: row.id, date: row.date, title: row.title, org: row.org, description: row.description, type: row.type, order: row.order }))} />
    </>
  )
}
