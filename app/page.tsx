import { getCertifications, getJourney, getProjects, getSettings, getTestimonials } from '@/lib/data'
import Portfolio from '@/components/portfolio'
import { jsonLd, SITE_URL } from '@/lib/site'

export default async function Page() {
  const [projects, journey, certifications, testimonials, settings] = await Promise.all([getProjects(), getJourney(), getCertifications(), getTestimonials(), getSettings()])
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Manmeet Singh',
    url: SITE_URL,
    image: `${SITE_URL}/me.jpg`,
    jobTitle: 'Full-stack developer',
    description: settings.heroTagline,
    worksFor: { '@type': 'Organization', name: 'MANTRIX' },
    address: { '@type': 'PostalAddress', addressLocality: settings.location },
    knowsAbout: Array.from(new Set(projects.flatMap((project) => project.stack))),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(person) }} />
      <Portfolio projects={projects} journey={journey} certifications={certifications} testimonials={testimonials} settings={settings} />
    </>
  )
}
