'use client'

import { useState } from 'react'
import { deleteMessage, setMessageRead } from '@/app/admin/actions'
import ConfirmButton from '@/components/admin/confirm-button'

export type InboxMessage = { id: string; name: string; email: string; budget: string | null; timeline: string | null; message: string; read: boolean; createdAt: string }

const formatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

export default function InboxList({ initial }: { initial: InboxMessage[] }) {
  const [items, setItems] = useState(initial)
  const [error, setError] = useState('')

  const toggleRead = async (id: string, read: boolean) => {
    const previous = items
    setItems(items.map((item) => (item.id === id ? { ...item, read } : item)))
    const result = await setMessageRead(id, read)
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    }
  }

  const remove = async (id: string) => {
    const result = await deleteMessage(id)
    if (!result.ok) setError(result.error)
    else setItems((current) => current.filter((item) => item.id !== id))
  }

  if (items.length === 0) return <p className="empty">Inbox is empty.</p>

  return (
    <div className="rows">
      {error && <p className="notice bad">{error}</p>}
      {items.map((item) => {
        const subject = encodeURIComponent('Re: your project inquiry')
        const body = encodeURIComponent(`Hi ${item.name},\n\n\n\n---\nOn ${formatter.format(new Date(item.createdAt))} you wrote:\n${item.message}`)
        return (
          <article key={item.id} className={item.read ? 'message' : 'message unread'}>
            <header>
              <div>
                <strong>{item.name}</strong> {!item.read && <span className="pill live">New</span>}
                <div className="meta">
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                  {item.budget && <span>Budget: {item.budget}</span>}
                  {item.timeline && <span>Timeline: {item.timeline}</span>}
                </div>
              </div>
              <span className="small muted">{formatter.format(new Date(item.createdAt))}</span>
            </header>
            <pre>{item.message}</pre>
            <div className="btn-row">
              <a className="btn small primary" href={`mailto:${item.email}?subject=${subject}&body=${body}`} onClick={() => { if (!item.read) void toggleRead(item.id, true) }}>Reply</a>
              <button type="button" className="btn small" onClick={() => toggleRead(item.id, !item.read)}>{item.read ? 'Mark unread' : 'Mark read'}</button>
              <ConfirmButton onConfirm={() => remove(item.id)} />
            </div>
          </article>
        )
      })}
    </div>
  )
}
