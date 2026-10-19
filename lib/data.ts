import { cacheLife, cacheTag } from 'next/cache'
import { db } from '@/lib/db'
import type { Certification, JourneyItem, Project, SiteSettings, Testimonial } from './types'

// All public getters are cached with "use cache" + cacheLife('max').
// Pages are prerendered at build time; the admin panel calls updateTag() after every
// mutation, so visitors never hit the database on a normal page view.

const DEFAULT_SETTINGS: SiteSettings = {
  availabilityText: 'Available for new projects',
  isAvailable: true,
  heroTagline: 'I make digital products feel inevitable.',
  resumeUrl: '#',
  location: 'New Delhi, India',
  calLink: 'manmeetcodes/discovery-15',
}

type ProjectRow = {
  id: string; slug: string; title: string; summary: string; problem: string; build: string; result: string; role: string
  stack: string[]; year: string; coverImage: string; gallery: string[]; liveUrl: string | null; repoUrl: string | null
  featured: boolean; order: number; published: boolean
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    problem: row.problem,
    build: row.build,
    result: row.result,
    role: row.role,
    stack: [...row.stack],
    year: row.year,
    coverImage: row.coverImage,
    gallery: [...row.gallery],
    liveUrl: row.liveUrl ?? undefined,
    repoUrl: row.repoUrl ?? undefined,
    featured: row.featured,
    order: row.order,
    published: row.published,
  }
}

const projectSelect = {
  id: true, slug: true, title: true, summary: true, problem: true, build: true, result: true, role: true,
  stack: true, year: true, coverImage: true, gallery: true, liveUrl: true, repoUrl: true,
  featured: true, order: true, published: true,
} as const

export async function getProjects(): Promise<Project[]> {
  'use cache'
  cacheTag('projects')
  cacheLife('max')
  const rows = await db.project.findMany({
    where: { published: true },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'asc' }],
    select: projectSelect,
  })
  return rows.map(toProject)
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  'use cache'
  cacheTag('projects', `project:${slug}`)
  cacheLife('max')
  const row = await db.project.findFirst({ where: { slug, published: true }, select: projectSelect })
  return row ? toProject(row) : undefined
}

export async function getCertifications(): Promise<Certification[]> {
  'use cache'
  cacheTag('certs')
  cacheLife('max')
  const rows = await db.certification.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    date: row.date,
    credentialUrl: row.credentialUrl ?? undefined,
    category: row.category,
    order: row.order,
  }))
}

export async function getJourney(): Promise<JourneyItem[]> {
  'use cache'
  cacheTag('journey')
  cacheLife('max')
  const rows = await db.journeyItem.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] })
  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    title: row.title,
    org: row.org,
    description: row.description,
    type: row.type,
    order: row.order,
  }))
}

export async function getTestimonials(): Promise<Testimonial[]> {
  'use cache'
  cacheTag('testimonials')
  cacheLife('max')
  const rows = await db.testimonial.findMany({ where: { published: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
  return rows.map((row) => ({
    id: row.id,
    quote: row.quote,
    name: row.name,
    role: row.role,
    company: row.company,
    order: row.order,
  }))
}

export async function getSettings(): Promise<SiteSettings> {
  'use cache'
  cacheTag('settings')
  cacheLife('max')
  const row = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (!row) return DEFAULT_SETTINGS
  return {
    availabilityText: row.availabilityText,
    isAvailable: row.isAvailable,
    heroTagline: row.heroTagline,
    resumeUrl: row.resumeUrl,
    location: row.location,
    calLink: row.calLink,
  }
}
