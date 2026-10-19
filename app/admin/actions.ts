'use server'

import { updateTag } from 'next/cache'
import { signIn, signOut } from '@/auth'
import { checkAdmin } from '@/lib/auth-guard'
import { db } from '@/lib/db'
import {
  certificationSchema,
  idListSchema,
  journeySchema,
  projectSchema,
  settingsSchema,
  slugify,
  testimonialSchema,
} from '@/lib/validation'

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

const UNAUTHORIZED: ActionResult<never> = { ok: false, error: 'Not authorised. Sign in again.' }

function fail(error: unknown, fallback = 'Something went wrong. Try again.'): { ok: false; error: string } {
  console.error('[admin action]', error)
  return { ok: false, error: fallback }
}

function firstIssue(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const issue = error.issues[0]
  if (!issue) return 'Invalid input.'
  const field = issue.path.map(String).join('.')
  return field ? `${field}: ${issue.message}` : issue.message
}

/* ------------------------------------------------------------------ auth */

export async function signInWithGitHub() {
  await signIn('github', { redirectTo: '/admin' })
}

export async function signOutAction() {
  await signOut({ redirectTo: '/admin/login' })
}

/* -------------------------------------------------------------- projects */

export async function checkSlugAvailable(slug: string, excludeId?: string): Promise<ActionResult<{ available: boolean }>> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const clean = slugify(slug)
  if (!clean) return { ok: true, data: { available: false } }
  const existing = await db.project.findUnique({ where: { slug: clean }, select: { id: true } })
  return { ok: true, data: { available: !existing || existing.id === excludeId } }
}

export async function saveProject(id: string | null, input: unknown, publish: boolean): Promise<ActionResult<{ id: string; slug: string }>> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = projectSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const values = parsed.data

  const clash = await db.project.findUnique({ where: { slug: values.slug }, select: { id: true } })
  if (clash && clash.id !== id) return { ok: false, error: `The slug "${values.slug}" is already used by another project.` }

  const data = {
    ...values,
    liveUrl: values.liveUrl || null,
    repoUrl: values.repoUrl || null,
    published: publish,
  }

  try {
    let saved: { id: string; slug: string }
    let oldSlug: string | null = null
    if (id) {
      const before = await db.project.findUnique({ where: { id }, select: { slug: true } })
      if (!before) return { ok: false, error: 'Project not found.' }
      oldSlug = before.slug
      saved = await db.project.update({ where: { id }, data, select: { id: true, slug: true } })
    } else {
      saved = await db.project.create({ data, select: { id: true, slug: true } })
    }
    updateTag('projects')
    updateTag(`project:${saved.slug}`)
    if (oldSlug && oldSlug !== saved.slug) updateTag(`project:${oldSlug}`)
    return { ok: true, data: saved }
  } catch (error) {
    return fail(error, 'Could not save the project.')
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    const deleted = await db.project.delete({ where: { id }, select: { slug: true } })
    updateTag('projects')
    updateTag(`project:${deleted.slug}`)
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not delete the project.')
  }
}

export async function setProjectFlag(id: string, field: 'featured' | 'published', value: boolean): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  if (field !== 'featured' && field !== 'published') return { ok: false, error: 'Unknown field.' }
  try {
    const updated = await db.project.update({ where: { id }, data: { [field]: Boolean(value) }, select: { slug: true } })
    updateTag('projects')
    updateTag(`project:${updated.slug}`)
    return { ok: true }
  } catch (error) {
    return fail(error)
  }
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = idListSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'Invalid order.' }
  try {
    await db.$transaction(parsed.data.map((projectId, index) => db.project.update({ where: { id: projectId }, data: { order: index + 1 } })))
    updateTag('projects')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not save the new order.')
  }
}

/* -------------------------------------------------------- certifications */

export async function saveCertification(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = certificationSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const data = { ...parsed.data, credentialUrl: parsed.data.credentialUrl || null }
  // Order only changes through drag-and-drop (reorderCertifications), never through a row edit.
  const { order: _order, ...updateData } = data
  try {
    const saved = id
      ? await db.certification.update({ where: { id }, data: updateData, select: { id: true } })
      : await db.certification.create({ data, select: { id: true } })
    updateTag('certs')
    return { ok: true, data: saved }
  } catch (error) {
    return fail(error, 'Could not save the certification.')
  }
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.certification.delete({ where: { id } })
    updateTag('certs')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not delete the certification.')
  }
}

export async function reorderCertifications(ids: string[]): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = idListSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'Invalid order.' }
  try {
    await db.$transaction(parsed.data.map((certId, index) => db.certification.update({ where: { id: certId }, data: { order: index + 1 } })))
    updateTag('certs')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not save the new order.')
  }
}

/* --------------------------------------------------------------- journey */

export async function saveJourneyItem(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = journeySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const { order: _order, ...updateData } = parsed.data
  try {
    const saved = id
      ? await db.journeyItem.update({ where: { id }, data: updateData, select: { id: true } })
      : await db.journeyItem.create({ data: parsed.data, select: { id: true } })
    updateTag('journey')
    return { ok: true, data: saved }
  } catch (error) {
    return fail(error, 'Could not save the journey item.')
  }
}

export async function deleteJourneyItem(id: string): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.journeyItem.delete({ where: { id } })
    updateTag('journey')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not delete the journey item.')
  }
}

export async function reorderJourney(ids: string[]): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = idListSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'Invalid order.' }
  try {
    await db.$transaction(parsed.data.map((itemId, index) => db.journeyItem.update({ where: { id: itemId }, data: { order: index + 1 } })))
    updateTag('journey')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not save the new order.')
  }
}

/* ---------------------------------------------------------- testimonials */

export async function saveTestimonial(id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = testimonialSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const { order: _order, ...updateData } = parsed.data
  try {
    const saved = id
      ? await db.testimonial.update({ where: { id }, data: updateData, select: { id: true } })
      : await db.testimonial.create({ data: parsed.data, select: { id: true } })
    updateTag('testimonials')
    return { ok: true, data: saved }
  } catch (error) {
    return fail(error, 'Could not save the testimonial.')
  }
}

export async function setTestimonialPublished(id: string, published: boolean): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.testimonial.update({ where: { id }, data: { published: Boolean(published) } })
    updateTag('testimonials')
    return { ok: true }
  } catch (error) {
    return fail(error)
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.testimonial.delete({ where: { id } })
    updateTag('testimonials')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not delete the testimonial.')
  }
}

export async function reorderTestimonials(ids: string[]): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = idListSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'Invalid order.' }
  try {
    await db.$transaction(parsed.data.map((itemId, index) => db.testimonial.update({ where: { id: itemId }, data: { order: index + 1 } })))
    updateTag('testimonials')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not save the new order.')
  }
}

/* -------------------------------------------------------------- settings */

const SETTINGS_FALLBACK = {
  availabilityText: 'Available for new projects',
  heroTagline: 'I make digital products feel inevitable.',
  resumeUrl: '#',
  location: 'New Delhi, India',
  calLink: 'manmeetcodes/discovery-15',
}

export async function setAvailability(isAvailable: boolean): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.siteSettings.upsert({
      where: { id: 'singleton' },
      update: { isAvailable: Boolean(isAvailable) },
      create: { id: 'singleton', ...SETTINGS_FALLBACK, isAvailable: Boolean(isAvailable) },
    })
    updateTag('settings')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not update availability.')
  }
}

export async function saveSettings(input: unknown): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  const data = { ...parsed.data, resumeUrl: parsed.data.resumeUrl || '#' }
  try {
    await db.siteSettings.upsert({ where: { id: 'singleton' }, update: data, create: { id: 'singleton', ...data } })
    updateTag('settings')
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not save settings.')
  }
}

/* ----------------------------------------------------------------- inbox */

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.contactMessage.update({ where: { id }, data: { read: Boolean(read) } })
    return { ok: true }
  } catch (error) {
    return fail(error)
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  if (!(await checkAdmin())) return UNAUTHORIZED
  try {
    await db.contactMessage.delete({ where: { id } })
    return { ok: true }
  } catch (error) {
    return fail(error, 'Could not delete the message.')
  }
}

