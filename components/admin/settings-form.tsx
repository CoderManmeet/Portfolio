'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { saveSettings } from '@/app/admin/actions'
import Switch from '@/components/admin/switch'
import { uploadToCloudinary } from '@/lib/upload-client'
import { settingsSchema } from '@/lib/validation'

type FormIn = z.input<typeof settingsSchema>
type FormOut = z.output<typeof settingsSchema>

export default function SettingsForm({ initial }: { initial: FormIn }) {
  const [notice, setNotice] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { register, control, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  })
  const resumeUrl = watch('resumeUrl')
  const calLink = watch('calLink')

  const onValid = async (values: FormOut) => {
    setNotice(null)
    const result = await saveSettings(values)
    if (!result.ok) {
      setNotice({ kind: 'bad', text: result.error })
      return
    }
    reset(values)
    setNotice({ kind: 'ok', text: 'Settings saved. The site is updated.' })
  }

  const onResume = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setUploading(true)
    setNotice(null)
    try {
      const url = await uploadToCloudinary(file, 'raw')
      setValue('resumeUrl', url, { shouldDirty: true, shouldValidate: true })
      setNotice({ kind: 'ok', text: 'Resume uploaded. Click Save settings to publish it.' })
    } catch (err) {
      setNotice({ kind: 'bad', text: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="card" style={{ maxWidth: 760 }}>
      {notice && <p className={notice.kind === 'ok' ? 'notice' : 'notice bad'} role="status">{notice.text}</p>}
      <div className="field">
        <Controller control={control} name="isAvailable" render={({ field }) => <Switch checked={Boolean(field.value)} onChange={field.onChange} label="Available for new projects (pulsing dot)" />} />
      </div>
      <div className="form-grid">
        <label className="field full">
          <span>Availability text</span>
          <input {...register('availabilityText')} />
          {errors.availabilityText && <span className="error">{errors.availabilityText.message}</span>}
        </label>
        <label className="field full">
          <span>Hero tagline</span>
          <input {...register('heroTagline')} />
          {errors.heroTagline && <span className="error">{errors.heroTagline.message}</span>}
        </label>
        <label className="field">
          <span>Location</span>
          <input {...register('location')} />
          {errors.location && <span className="error">{errors.location.message}</span>}
        </label>
        <label className="field">
          <span>Cal.com link (username/event-slug)</span>
          <input {...register('calLink')} placeholder="manmeetcodes/discovery-15" />
          {errors.calLink ? <span className="error">{errors.calLink.message}</span> : <span className="small muted">https://cal.com/{calLink}</span>}
        </label>
        <div className="field full">
          <span className="small muted">RESUME (PDF, MAX 5MB)</span>
          <input {...register('resumeUrl')} placeholder="https://res.cloudinary.com/..." aria-label="Resume URL" />
          {errors.resumeUrl && <span className="error">{errors.resumeUrl.message}</span>}
          <div className="btn-row">
            <button type="button" className="btn small" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'Uploading...' : 'Upload PDF'}</button>
            {resumeUrl && resumeUrl !== '#' && <a className="small" href={resumeUrl} target="_blank" rel="noreferrer">Open current resume</a>}
          </div>
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => onResume(event.target.files)} />
        </div>
      </div>
      <div className="btn-row" style={{ marginTop: 8 }}>
        <button type="submit" className="btn primary" disabled={isSubmitting || !isDirty}>{isSubmitting ? 'Saving...' : 'Save settings'}</button>
      </div>
    </form>
  )
}
