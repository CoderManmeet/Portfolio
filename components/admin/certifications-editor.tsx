'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { deleteCertification, reorderCertifications, saveCertification } from '@/app/admin/actions'
import ConfirmButton from '@/components/admin/confirm-button'
import SortableList from '@/components/admin/sortable-list'
import { certificationSchema } from '@/lib/validation'

type FormIn = z.input<typeof certificationSchema>
type FormOut = z.output<typeof certificationSchema>
export type CertItem = { id: string; name: string; issuer: string; date: string; credentialUrl: string; category: string; order: number }

const NEW_CATEGORY = '__new__'

function CategoryPicker({ value, onChange, categories }: { value: string; onChange: (next: string) => void; categories: string[] }) {
  const known = categories.includes(value) || value === ''
  const [adding, setAdding] = useState(!known)
  if (adding) {
    return (
      <div className="btn-row" style={{ flexWrap: 'nowrap' }}>
        <input value={value} placeholder="New category" onChange={(event) => onChange(event.target.value)} aria-label="New category name" />
        {categories.length > 0 && <button type="button" className="btn small" onClick={() => { setAdding(false); onChange(categories[0]) }}>List</button>}
      </div>
    )
  }
  return (
    <select
      value={value}
      aria-label="Category"
      onChange={(event) => {
        if (event.target.value === NEW_CATEGORY) {
          setAdding(true)
          onChange('')
        } else onChange(event.target.value)
      }}
    >
      <option value="" disabled>Category</option>
      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      <option value={NEW_CATEGORY}>+ Add new category</option>
    </select>
  )
}

function CertRow({ item, handle, categories, nextOrder = 0, onSaved, onDeleted }: { item: CertItem | null; handle?: React.ReactNode; categories: string[]; nextOrder?: number; onSaved: (saved: CertItem) => void; onDeleted?: () => void }) {
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(certificationSchema),
    defaultValues: item
      ? { name: item.name, issuer: item.issuer, date: item.date, credentialUrl: item.credentialUrl, category: item.category, order: item.order }
      : { name: '', issuer: '', date: String(new Date().getFullYear()), credentialUrl: '', category: categories[0] ?? '', order: 0 },
  })
  const { register, control, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = form

  const onValid = async (values: FormOut) => {
    setError('')
    const payload = item ? values : { ...values, order: nextOrder }
    const result = await saveCertification(item?.id ?? null, payload)
    if (!result.ok || !result.data) {
      setError(result.ok ? 'Could not save.' : result.error)
      return
    }
    const saved: CertItem = { id: result.data.id, ...payload, credentialUrl: payload.credentialUrl ?? '' }
    onSaved(saved)
    if (item) {
      reset(values)
      setStatus('Saved')
      window.setTimeout(() => setStatus(''), 1500)
    } else {
      reset({ name: '', issuer: '', date: values.date, credentialUrl: '', category: values.category, order: 0 })
    }
  }

  const firstError = errors.name?.message || errors.issuer?.message || errors.date?.message || errors.credentialUrl?.message || errors.category?.message

  return (
    <form className={item ? 'edit-row' : 'edit-row is-new'} onSubmit={handleSubmit(onValid)} noValidate>
      <div>{handle ?? <span className="handle" aria-hidden="true">+</span>}</div>
      <input {...register('name')} placeholder="Certification name" aria-label="Name" />
      <input {...register('issuer')} placeholder="Issuer" aria-label="Issuer" />
      <input {...register('date')} placeholder="2024" aria-label="Date" />
      <input {...register('credentialUrl')} placeholder="https://credential" aria-label="Credential URL" />
      <Controller control={control} name="category" render={({ field }) => <CategoryPicker value={field.value ?? ''} onChange={field.onChange} categories={categories} />} />
      <div className="btn-row" style={{ flexWrap: 'nowrap' }}>
        <button type="submit" className={item ? 'btn small' : 'btn small primary'} disabled={isSubmitting || (item !== null && !isDirty)}>{isSubmitting ? 'Saving...' : item ? 'Save' : 'Add'}</button>
        {item && onDeleted && <ConfirmButton onConfirm={onDeleted} />}
      </div>
      {(firstError || error || status) && (
        <div className="cell-error">
          {firstError && <span className="error">{firstError}</span>}
          {error && <span className="error">{error}</span>}
          {status && <span className="ok-text">{status}</span>}
        </div>
      )}
    </form>
  )
}

export default function CertificationsEditor({ initial }: { initial: CertItem[] }) {
  const [items, setItems] = useState(initial)
  const [error, setError] = useState('')
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort()

  const reorder = async (moved: CertItem[]) => {
    const previous = items
    const next = moved.map((item, index) => ({ ...item, order: index + 1 }))
    setItems(next)
    const result = await reorderCertifications(next.map((item) => item.id))
    if (!result.ok) {
      setItems(previous)
      setError(result.error)
    }
  }

  return (
    <div>
      {error && <p className="notice bad">{error}</p>}
      <div className="table-head"><span /><span>Name</span><span>Issuer</span><span>Date</span><span>Credential URL</span><span>Category</span><span /></div>
      {items.length === 0 && <p className="empty">No certifications yet.</p>}
      <SortableList
        items={items}
        onReorder={reorder}
        renderItem={(item, handle) => (
          <CertRow
            item={item}
            handle={handle}
            categories={categories}
            onSaved={(saved) => setItems((current) => current.map((entry) => (entry.id === saved.id ? { ...saved, order: entry.order } : entry)))}
            onDeleted={async () => {
              const result = await deleteCertification(item.id)
              if (!result.ok) setError(result.error)
              else setItems((current) => current.filter((entry) => entry.id !== item.id))
            }}
          />
        )}
      />
      <h2 style={{ marginTop: 24 }}>Add certification</h2>
      <CertRow
        item={null}
        categories={categories}
        nextOrder={items.reduce((max, entry) => Math.max(max, entry.order), 0) + 1}
        onSaved={(saved) => setItems((current) => [...current, saved])}
      />
    </div>
  )
}
