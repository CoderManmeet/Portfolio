import { connection } from 'next/server'
import TestimonialsEditor from '@/components/admin/testimonials-editor'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function AdminTestimonialsPage() {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
  const rows = await db.testimonial.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Testimonials</h1>
          <p className="muted">Drag to reorder. Unpublished quotes stay hidden.</p>
        </div>
      </div>
      <TestimonialsEditor initial={rows.map((row) => ({ id: row.id, quote: row.quote, name: row.name, role: row.role, company: row.company, published: row.published, order: row.order }))} />
    </>
  )
}
