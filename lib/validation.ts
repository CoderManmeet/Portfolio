import { z } from 'zod'

// Shared Zod v4 schemas: used by the admin forms (client) and the Server Actions / routes (server).

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const CAL_LINK_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const isLinkLike = (value: string) => value === '' || value === '#' || value.startsWith('/') || /^https?:\/\/\S+$/i.test(value)

const optionalLink = z
  .string()
  .trim()
  .max(500)
  .refine(isLinkLike, 'Use a full URL starting with https://')

const requiredAsset = z
  .string()
  .trim()
  .min(1, 'Upload an image')
  .refine((value) => value.startsWith('/') || /^https:\/\//i.test(value), 'Must be an uploaded image URL')

const order = z.coerce.number().int().min(0).max(100000)

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  slug: z.string().trim().min(1, 'Slug is required').max(80).regex(SLUG_PATTERN, 'Lowercase letters, numbers and single hyphens only'),
  summary: z.string().trim().min(1, 'Summary is required').max(300),
  problem: z.string().max(20000),
  build: z.string().max(20000),
  result: z.string().max(20000),
  role: z.string().trim().min(1, 'Role is required').max(160),
  stack: z.array(z.string().trim().min(1).max(40)).max(20),
  year: z.string().trim().regex(/^\d{4}$/, 'Use a 4-digit year'),
  coverImage: requiredAsset,
  gallery: z.array(requiredAsset).max(30),
  liveUrl: optionalLink,
  repoUrl: optionalLink,
  featured: z.boolean(),
  order,
})
export type ProjectInput = z.input<typeof projectSchema>
export type ProjectOutput = z.output<typeof projectSchema>

export const certificationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  issuer: z.string().trim().min(1, 'Issuer is required').max(120),
  date: z.string().trim().min(1, 'Date is required').max(40),
  credentialUrl: optionalLink,
  category: z.string().trim().min(1, 'Category is required').max(60),
  order,
})
export type CertificationInput = z.input<typeof certificationSchema>
export type CertificationOutput = z.output<typeof certificationSchema>

export const JOURNEY_TYPES = ['education', 'work', 'achievement', 'venture'] as const

export const journeySchema = z.object({
  date: z.string().trim().min(1, 'Date is required').max(40),
  title: z.string().trim().min(1, 'Title is required').max(160),
  org: z.string().trim().min(1, 'Organisation is required').max(120),
  description: z.string().trim().min(1, 'Description is required').max(1000),
  type: z.enum(JOURNEY_TYPES),
  order,
})
export type JourneyInput = z.input<typeof journeySchema>
export type JourneyOutput = z.output<typeof journeySchema>

export const testimonialSchema = z.object({
  quote: z.string().trim().min(1, 'Quote is required').max(1000),
  name: z.string().trim().min(1, 'Name is required').max(120),
  role: z.string().trim().max(120),
  company: z.string().trim().max(120),
  published: z.boolean(),
  order,
})
export type TestimonialInput = z.input<typeof testimonialSchema>
export type TestimonialOutput = z.output<typeof testimonialSchema>

export const settingsSchema = z.object({
  isAvailable: z.boolean(),
  availabilityText: z.string().trim().min(1, 'Availability text is required').max(120),
  heroTagline: z.string().trim().min(1, 'Tagline is required').max(200),
  location: z.string().trim().min(1, 'Location is required').max(120),
  calLink: z
    .string()
    .trim()
    .transform((value) => value.replace(/^https?:\/\/(www\.)?cal\.com\//i, '').replace(/^\/+|\/+$/g, ''))
    .pipe(z.string().regex(CAL_LINK_PATTERN, 'Use the format username/event-slug')),
  resumeUrl: optionalLink,
})
export type SettingsInput = z.input<typeof settingsSchema>
export type SettingsOutput = z.output<typeof settingsSchema>

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name (2-80 characters).').max(80, 'Please enter your name (2-80 characters).'),
  email: z.email('Please enter a valid email address.').max(200),
  budget: z.string().trim().max(60).optional(),
  timeline: z.string().trim().max(60).optional(),
  message: z.string().trim().min(10, 'Please write at least 10 characters.').max(5000, 'Please keep the message under 5000 characters.'),
})
export type ContactOutput = z.output<typeof contactSchema>

export const idListSchema = z.array(z.string().min(1).max(64)).max(1000)
