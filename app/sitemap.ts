import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/data'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects()
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      changeFrequency: 'yearly' as const,
      priority: project.featured ? 0.8 : 0.6,
    })),
  ]
}
