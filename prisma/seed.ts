import 'dotenv/config'
import { db } from '../lib/db'
import { certifications, journey, projects, settings, testimonials } from './seed-data'

// update: {} means re-running never overwrites edits made in the admin panel.
async function main() {
  for (const project of projects) {
    const { id, slug, ...data } = project
    await db.project.upsert({
      where: { slug },
      update: {},
      create: { id, slug, ...data },
    })
  }

  for (const cert of certifications) {
    await db.certification.upsert({ where: { id: cert.id }, update: {}, create: cert })
  }

  for (const item of journey) {
    await db.journeyItem.upsert({ where: { id: item.id }, update: {}, create: item })
  }

  for (const testimonial of testimonials) {
    await db.testimonial.upsert({ where: { id: testimonial.id }, update: {}, create: testimonial })
  }

  await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', ...settings },
  })

  console.log(`Seeded ${projects.length} projects, ${certifications.length} certifications, ${journey.length} journey items, ${testimonials.length} testimonials and site settings.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
