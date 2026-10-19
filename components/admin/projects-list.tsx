'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useState } from 'react'
import { deleteProject, reorderProjects, setProjectFlag } from '@/app/admin/actions'
import ConfirmButton from '@/components/admin/confirm-button'
import SortableList from '@/components/admin/sortable-list'
import Switch from '@/components/admin/switch'

export type ProjectListItem = { id: string; title: string; slug: string; coverImage: string; featured: boolean; published: boolean; views: number; year: string }

export default function ProjectsList({ initial }: { initial: ProjectListItem[] }) {
  const [items, setItems] = useState(initial)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const flash = (text: string) => {
    setSaved(text)
    window.setTimeout(() => setSaved(''), 1800)
  }

  const reorder = async (next: ProjectListItem[]) => {
    const previous = items
    setItems(next)
    setError('')
    const result = await reorderProjects(next.map((item) => item.id))
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    } else flash('Order saved')
  }

  const toggle = async (id: string, field: 'featured' | 'published', value: boolean) => {
    const previous = items
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    setError('')
    const result = await setProjectFlag(id, field, value)
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    } else flash('Saved')
  }

  const remove = async (id: string) => {
    const result = await deleteProject(id)
    if (!result.ok) setError(result.error)
    else setItems((current) => current.filter((item) => item.id !== id))
  }

  if (items.length === 0) return <p className="empty">No projects yet. Create the first one.</p>

  return (
    <div>
      {error && <p className="notice bad">{error}</p>}
      {saved && <p className="notice">{saved}</p>}
      <SortableList
        items={items}
        itemClassName="row"
        onReorder={reorder}
        renderItem={(item, handle) => (
          <>
            {handle}
            <img className="thumb" src={item.coverImage || '/placeholder.svg'} alt="" />
            <div className="grow">
              <div className="title">{item.title}</div>
              <div className="meta">
                <span>/work/{item.slug}</span>
                <span>{item.year}</span>
                <span>{item.views} views</span>
                <span className={item.published ? 'pill live' : 'pill draft'}>{item.published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
            <Switch checked={item.featured} label="Featured" onChange={(value) => toggle(item.id, 'featured', value)} />
            <Switch checked={item.published} label="Published" onChange={(value) => toggle(item.id, 'published', value)} />
            <Link className="btn small" href={`/admin/projects/${item.id}`}>Edit</Link>
            <ConfirmButton onConfirm={() => remove(item.id)} />
          </>
        )}
      />
      <p className="small muted" style={{ marginTop: 10 }}>Drag the handle to reorder. Featured projects are always listed first on the site.</p>
    </div>
  )
}
