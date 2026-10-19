'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { deleteTestimonial, reorderTestimonials, saveTestimonial, setTestimonialPublished } from '@/app/admin/actions'
import ConfirmButton from '@/components/admin/confirm-button'
import SortableList from '@/components/admin/sortable-list'
import Switch from '@/components/admin/switch'
import { testimonialSchema } from '@/lib/validation'

type FormIn = z.input<typeof testimonialSchema>
type FormOut = z.output<typeof testimonialSchema>
export type TestimonialEntry = FormOut & { id: string }

function TestimonialRow({ item, handle, nextOrder = 0, onSaved, onDeleted, onTogglePublished }: { item: TestimonialEntry | null; handle?: React.ReactNode; nextOrder?: number; onSaved: (saved: TestimonialEntry) => void; onDeleted?: () => void; onTogglePublished?: (value: boolean) => void }) {
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const empty: FormIn = { quote: '', name: '', role: '', company: '', published: true, order: 0 }
  const { register, control, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: item ? { quote: item.quote, name: item.name, role: item.role, company: item.company, published: item.published, order: item.order } : empty,
  })

  const onValid = async (values: FormOut) => {
    setError('')
    // Existing rows: the published switch saves on its own, so keep its current value here.
    const payload = item ? { ...values, published: item.published } : { ...values, order: nextOrder }
    const result = await saveTestimonial(item?.id ?? null, payload)
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

  const firstError = errors.quote?.message || errors.name?.message || errors.role?.message || errors.company?.message

  return (
    <form className={item ? 'edit-row journey' : 'edit-row journey is-new'} onSubmit={handleSubmit(onValid)} noValidate>
      <div>{handle ?? <span className="handle" aria-hidden="true">+</span>}</div>
      <div>
        <div className="form-grid">
          <label className="field full"><span>Quote</span><textarea rows={3} style={{ minHeight: 70 }} {...register('quote')} /></label>
          <label className="field"><span>Name</span><input {...register('name')} /></label>
          <label className="field"><span>Role</span><input {...register('role')} /></label>
          <label className="field"><span>Company</span><input {...register('company')} /></label>
          <div className="field" style={{ alignSelf: 'end' }}>
            {item ? (
              <Switch checked={item.published} label="Published" onChange={(value) => onTogglePublished?.(value)} />
            ) : (
              <Controller control={control} name="published" render={({ field }) => <Switch checked={Boolean(field.value)} onChange={field.onChange} label="Published" />} />
            )}
          </div>
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

export default function TestimonialsEditor({ initial }: { initial: TestimonialEntry[] }) {
  const [items, setItems] = useState(initial)
  const [error, setError] = useState('')

  const reorder = async (moved: TestimonialEntry[]) => {
    const previous = items
    const next = moved.map((item, index) => ({ ...item, order: index + 1 }))
    setItems(next)
    const result = await reorderTestimonials(next.map((item) => item.id))
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    }
  }

  const togglePublished = async (id: string, value: boolean) => {
    const previous = items
    setItems(items.map((item) => (item.id === id ? { ...item, published: value } : item)))
    const result = await setTestimonialPublished(id, value)
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    }
  }

  return (
    <div>
      {error && <p className="notice bad">{error}</p>}
      <p className="small muted">The first published testimonial is the one shown on the home page.</p>
      {items.length === 0 && <p className="empty">No testimonials yet.</p>}
      <SortableList
        items={items}
        onReorder={reorder}
        renderItem={(item, handle) => (
          <TestimonialRow
            item={item}
            handle={handle}
            onTogglePublished={(value) => togglePublished(item.id, value)}
            onSaved={(saved) => setItems((current) => current.map((entry) => (entry.id === saved.id ? { ...saved, order: entry.order, published: entry.published } : entry)))}
            onDeleted={async () => {
              const result = await deleteTestimonial(item.id)
              if (!result.ok) setError(result.error)
              else setItems((current) => current.filter((entry) => entry.id !== item.id))
            }}
          />
        )}
      />
      <h2 style={{ marginTop: 24 }}>Add testimonial</h2>
      <TestimonialRow item={null} nextOrder={items.reduce((max, entry) => Math.max(max, entry.order), 0) + 1} onSaved={(saved) => setItems((current) => [...current, saved])} />
    </div>
  )
}
