import { connection } from 'next/server'
import JourneyEditor from '@/components/admin/journey-editor'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function AdminJourneyPage() {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
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
