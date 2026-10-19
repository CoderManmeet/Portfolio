'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { z } from 'zod'
import { checkSlugAvailable, saveProject } from '@/app/admin/actions'
import { CoverImageField, GalleryField } from '@/components/admin/image-fields'
import MarkdownField from '@/components/admin/markdown-field'
import Switch from '@/components/admin/switch'
import TagInput from '@/components/admin/tag-input'
import { projectSchema, slugify } from '@/lib/validation'

type FormIn = z.input<typeof projectSchema>
type FormOut = z.output<typeof projectSchema>

export type ProjectFormProject = FormIn & { id: string; published: boolean }

function FieldError({ message }: { message?: string }) {
  return message ? <span className="error">{message}</span> : null
}

export default function ProjectForm({ project, nextOrder }: { project: ProjectFormProject | null; nextOrder: number }) {
  const router = useRouter()
  const [published, setPublished] = useState(project?.published ?? false)
  const [slugTouched, setSlugTouched] = useState(Boolean(project))
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [notice, setNotice] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null)
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null)
  const publishRef = useRef(false)

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title, slug: project.slug, summary: project.summary, problem: project.problem, build: project.build,
          result: project.result, role: project.role, stack: project.stack, year: project.year, coverImage: project.coverImage,
          gallery: project.gallery, liveUrl: project.liveUrl ?? '', repoUrl: project.repoUrl ?? '', featured: project.featured, order: project.order,
        }
      : {
          title: '', slug: '', summary: '', problem: '', build: '', result: '', role: '', stack: [], year: String(new Date().getFullYear()),
          coverImage: '', gallery: [], liveUrl: '', repoUrl: '', featured: false, order: nextOrder,
        },
  })
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = form

  const title = watch('title')
  const slug = watch('slug')

  // Auto-generate the slug from the title until the slug is edited by hand.
  useEffect(() => {
    if (!slugTouched) setValue('slug', slugify(title || ''), { shouldValidate: false })
  }, [title, slugTouched, setValue])

  // Debounced uniqueness check.
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    const id = window.setTimeout(async () => {
      const result = await checkSlugAvailable(slug, project?.id)
      if (result.ok && result.data) setSlugStatus(result.data.available ? 'available' : 'taken')
      else setSlugStatus('idle')
    }, 400)
    return () => window.clearTimeout(id)
  }, [slug, project?.id])

  const onValid = async (values: FormOut) => {
    const publish = publishRef.current
    setSaving(publish ? 'publish' : 'draft')
    setNotice(null)
    const result = await saveProject(project?.id ?? null, values, publish)
    setSaving(null)
    if (!result.ok) {
      setNotice({ kind: 'bad', text: result.error })
      return
    }
    setPublished(publish)
    setNotice({ kind: 'ok', text: publish ? 'Published. The live site is updated.' : 'Saved as draft (not visible on the site).' })
    if (!project && result.data) {
      router.replace(`/admin/projects/${result.data.id}`)
    } else {
      router.refresh()
    }
  }

  const submit = (publish: boolean) => {
    publishRef.current = publish
    void handleSubmit(onValid, () => setNotice({ kind: 'bad', text: 'Fix the highlighted fields first.' }))()
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); submit(published) }} noValidate>
      <div className="admin-head">
        <div>
          <h1>{project ? 'Edit project' : 'New project'}</h1>
          <p className="muted">
            Status: <span className={published ? 'pill live' : 'pill draft'}>{published ? 'Published' : 'Draft'}</span>
            {published && slug && <> &middot; <a href={`/work/${slug}`} target="_blank" rel="noreferrer">View live</a></>}
          </p>
        </div>
        <Link href="/admin/projects" className="btn">Back to projects</Link>
      </div>

      {notice && <p className={notice.kind === 'ok' ? 'notice' : 'notice bad'} role="status">{notice.text}</p>}

      <div className="grid two">
        <div className="card">
          <div className="form-grid">
            <label className="field full">
              <span>Title</span>
              <input {...register('title')} />
              <FieldError message={errors.title?.message} />
            </label>
            <label className="field full">
              <span>Slug</span>
              <input {...register('slug', { onChange: () => setSlugTouched(true) })} />
              <FieldError message={errors.slug?.message} />
              {slugStatus === 'checking' && <span className="small muted">Checking...</span>}
              {slugStatus === 'available' && <span className="ok-text">/work/{slug} is available</span>}
              {slugStatus === 'taken' && <span className="error">This slug is already used by another project.</span>}
            </label>
            <label className="field full">
              <span>Summary</span>
              <input {...register('summary')} />
              <FieldError message={errors.summary?.message} />
            </label>
            <label className="field full">
              <span>Role</span>
              <input {...register('role')} />
              <FieldError message={errors.role?.message} />
            </label>
            <label className="field">
              <span>Year</span>
              <input {...register('year')} inputMode="numeric" />
              <FieldError message={errors.year?.message} />
            </label>
            <label className="field">
              <span>Order</span>
              <input type="number" {...register('order')} />
              <FieldError message={errors.order?.message} />
            </label>
            <label className="field">
              <span>Live URL</span>
              <input type="url" {...register('liveUrl')} placeholder="https://" />
              <FieldError message={errors.liveUrl?.message} />
            </label>
            <label className="field">
              <span>Repo URL</span>
              <input type="url" {...register('repoUrl')} placeholder="https://" />
              <FieldError message={errors.repoUrl?.message} />
            </label>
            <div className="field full">
              <span className="small muted">STACK</span>
              <Controller control={control} name="stack" render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} />} />
              <FieldError message={errors.stack?.message} />
            </div>
            <div className="field full">
              <span className="small muted">THE PROBLEM (MARKDOWN)</span>
              <Controller control={control} name="problem" render={({ field }) => <MarkdownField id="problem" value={field.value ?? ''} onChange={field.onChange} />} />
              <FieldError message={errors.problem?.message} />
            </div>
            <div className="field full">
              <span className="small muted">THE BUILD (MARKDOWN)</span>
              <Controller control={control} name="build" render={({ field }) => <MarkdownField id="build" value={field.value ?? ''} onChange={field.onChange} />} />
              <FieldError message={errors.build?.message} />
            </div>
            <div className="field full">
              <span className="small muted">THE RESULT (MARKDOWN, NUMBERS SHOW BIG IN ORANGE)</span>
              <Controller control={control} name="result" render={({ field }) => <MarkdownField id="result" accentNumbers value={field.value ?? ''} onChange={field.onChange} rows={5} />} />
              <FieldError message={errors.result?.message} />
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h2>Visibility</h2>
            <Controller control={control} name="featured" render={({ field }) => <Switch checked={Boolean(field.value)} onChange={field.onChange} label="Featured (listed first)" />} />
          </div>
          <div className="card">
            <h2>Cover image</h2>
            <Controller control={control} name="coverImage" render={({ field }) => <CoverImageField value={field.value ?? ''} onChange={field.onChange} />} />
            <FieldError message={errors.coverImage?.message} />
          </div>
          <div className="card">
            <h2>Gallery</h2>
            <Controller control={control} name="gallery" render={({ field }) => <GalleryField value={field.value ?? []} onChange={field.onChange} />} />
            <FieldError message={errors.gallery?.message} />
          </div>
        </div>
      </div>

      <div className="sticky-actions btn-row">
        <button type="button" className="btn" disabled={saving !== null} onClick={() => submit(false)}>{saving === 'draft' ? 'Saving...' : 'Save draft'}</button>
        <button type="button" className="btn accent" disabled={saving !== null} onClick={() => submit(true)}>{saving === 'publish' ? 'Publishing...' : 'Publish'}</button>
        <span className="small muted">Save draft hides the project from the site. Publish makes it live.</span>
      </div>
    </form>
  )
}
