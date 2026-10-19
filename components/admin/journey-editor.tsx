'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { deleteJourneyItem, reorderJourney, saveJourneyItem } from '@/app/admin/actions'
import ConfirmButton from '@/components/admin/confirm-button'
import SortableList from '@/components/admin/sortable-list'
import { JOURNEY_TYPES, journeySchema } from '@/lib/validation'

type FormIn = z.input<typeof journeySchema>
type FormOut = z.output<typeof journeySchema>
export type JourneyEntry = FormOut & { id: string }

function JourneyRow({ item, handle, nextOrder = 0, onSaved, onDeleted }: { item: JourneyEntry | null; handle?: React.ReactNode; nextOrder?: number; onSaved: (saved: JourneyEntry) => void; onDeleted?: () => void }) {
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const empty: FormIn = { date: '', title: '', org: '', description: '', type: 'work', order: 0 }
  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(journeySchema),
    defaultValues: item ? { date: item.date, title: item.title, org: item.org, description: item.description, type: item.type, order: item.order } : empty,
  })

  const onValid = async (values: FormOut) => {
    setError('')
    const payload = item ? values : { ...values, order: nextOrder }
    const result = await saveJourneyItem(item?.id ?? null, payload)
    if (!result.ok || !result.data) {
      setError(result.ok ? 'Could not save.' : result.error)
      return
    }
    onSaved({ id: result.data.id, ...payload })
    if (item) {
      reset(values)
      setStatus('Saved')
      window.setTimeout(() => setStatus(''), 1500)
    } else reset(empty)
  }

  const firstError = errors.date?.message || errors.title?.message || errors.org?.message || errors.description?.message || errors.type?.message

  return (
    <form className={item ? 'edit-row journey' : 'edit-row journey is-new'} onSubmit={handleSubmit(onValid)} noValidate>
      <div>{handle ?? <span className="handle" aria-hidden="true">+</span>}</div>
      <div>
        <div className="form-grid">
          <label className="field"><span>Date</span><input {...register('date')} placeholder="2023 - 2027" /></label>
          <label className="field">
            <span>Type</span>
            <select {...register('type')}>{JOURNEY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
          </label>
          <label className="field"><span>Title</span><input {...register('title')} /></label>
          <label className="field"><span>Organisation</span><input {...register('org')} /></label>
          <label className="field full"><span>Description</span><textarea rows={2} style={{ minHeight: 60 }} {...register('description')} /></label>
        </div>
        <div className="btn-row">
          <button type="submit" className={item ? 'btn small' : 'btn small primary'} disabled={isSubmitting || (item !== null && !isDirty)}>{isSubmitting ? 'Saving...' : item ? 'Save' : 'Add'}</button>
          {item && onDeleted && <ConfirmButton onConfirm={onDeleted} />}
          {firstError && <span className="error">{firstError}</span>}
          {error && <span className="error">{error}</span>}
          {status && <span className="ok-text">{status}</span>}
        </div>
      </div>
    </form>
  )
}

export default function JourneyEditor({ initial }: { initial: JourneyEntry[] }) {
  const [items, setItems] = useState(initial)
  const [error, setError] = useState('')

  const reorder = async (moved: JourneyEntry[]) => {
    const previous = items
    const next = moved.map((item, index) => ({ ...item, order: index + 1 }))
    setItems(next)
    const result = await reorderJourney(next.map((item) => item.id))
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    }
  }

  return (
    <div>
      {error && <p className="notice bad">{error}</p>}
      {items.length === 0 && <p className="empty">No journey items yet.</p>}
      <SortableList
        items={items}
        onReorder={reorder}
        renderItem={(item, handle) => (
          <JourneyRow
            item={item}
            handle={handle}
            onSaved={(saved) => setItems((current) => current.map((entry) => (entry.id === saved.id ? { ...saved, order: entry.order } : entry)))}
            onDeleted={async () => {
              const result = await deleteJourneyItem(item.id)
              if (!result.ok) setError(result.error)
              else setItems((current) => current.filter((entry) => entry.id !== item.id))
            }}
          />
        )}
      />
      <h2 style={{ marginTop: 24 }}>Add journey item</h2>
      <JourneyRow item={null} nextOrder={items.reduce((max, entry) => Math.max(max, entry.order), 0) + 1} onSaved={(saved) => setItems((current) => [...current, saved])} />
    </div>
  )
}
