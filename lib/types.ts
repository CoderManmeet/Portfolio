export type Project = {
  id: string; slug: string; title: string; summary: string; problem: string; build: string; result: string; role: string; stack: string[]; year: string; coverImage: string; gallery: string[]; liveUrl?: string; repoUrl?: string; featured: boolean; order: number; published: boolean
}
export type Certification = { id: string; name: string; issuer: string; date: string; credentialUrl?: string; category: string; order: number }
export type JourneyItem = { id: string; date: string; title: string; org: string; description: string; type: 'education' | 'work' | 'achievement' | 'venture'; order: number }
export type Testimonial = { id: string; quote: string; name: string; role: string; company: string; order: number }
export type SiteSettings = { availabilityText: string; isAvailable: boolean; heroTagline: string; resumeUrl: string; location: string; calLink: string }
