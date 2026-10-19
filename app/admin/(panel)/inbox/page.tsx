import InboxList from '@/components/admin/inbox-list'
import { db } from '@/lib/db'

export default async function AdminInboxPage() {
  const rows = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 500 })
  const unread = rows.filter((row) => !row.read).length
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Inbox</h1>
          <p className="muted">{rows.length} messages, {unread} unread</p>
        </div>
      </div>
      <InboxList
        initial={rows.map((row) => ({ id: row.id, name: row.name, email: row.email, budget: row.budget, timeline: row.timeline, message: row.message, read: row.read, createdAt: row.createdAt.toISOString() }))}
      />
    </>
  )
}
