import TestimonialsEditor from '@/components/admin/testimonials-editor'
import { db } from '@/lib/db'

export default async function AdminTestimonialsPage() {
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
