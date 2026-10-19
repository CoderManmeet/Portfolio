// Original mock content from the v0 export. Used only by prisma/seed.ts.
// Stable ids make the seed safe to run more than once (upsert).

export const projects = [
  { id: 'seed-project-projectflow', slug: 'projectflow', title: 'ProjectFlow', summary: 'A calmer operating system for ambitious teams.', problem: 'Project work was scattered across chat threads, spreadsheets, and forgotten tabs. Teams needed one clear place to see what mattered next.', build: 'I shaped a focused SaaS workspace with opinionated project views, live activity, and a visual language that made progress feel tangible. Built with Next.js, PostgreSQL, and a careful component system.', result: 'Early teams reported 40% fewer status meetings and shipped with more confidence.', role: 'Product design + full-stack development', stack: ['Next.js', 'TypeScript', 'Postgres', 'Figma'], year: '2026', coverImage: '/placeholder.jpg', gallery: ['/placeholder.jpg', '/placeholder.jpg'], liveUrl: '#', featured: true, order: 1, published: true },
  { id: 'seed-project-trace', slug: 'trace', title: 'TRACE', summary: 'Forensic clarity for the crypto economy.', problem: 'Investigators were piecing together transaction trails manually, slowing down decisions when every block mattered.', build: 'TRACE turns complex wallet relationships into a readable investigation canvas. I built the interface, query layer, and visual data primitives around an analyst-first workflow.', result: 'Investigation time dropped from days to hours across the pilot team.', role: 'UX engineering + interface design', stack: ['React', 'Node.js', 'D3', 'GraphQL'], year: '2025', coverImage: '/placeholder.svg', gallery: ['/placeholder.jpg', '/placeholder.jpg'], featured: true, order: 2, published: true },
  { id: 'seed-project-meridian-dental', slug: 'meridian-dental', title: 'Meridian Dental', summary: 'A digital front door patients trust.', problem: 'A dated clinic site made booking feel uncertain and hid the warmth of the people behind the practice.', build: 'A responsive editorial site with clear treatment pathways, reassuring motion, and an appointment flow designed around first-time visitors.', result: 'Appointment enquiries increased 2.4x in the first month.', role: 'Strategy, design + development', stack: ['Next.js', 'Sanity', 'Cal.com'], year: '2025', coverImage: '/placeholder.jpg', gallery: ['/placeholder.svg', '/placeholder.jpg'], featured: false, order: 3, published: true },
  { id: 'seed-project-lexi-pet-clinic', slug: 'lexi-pet-clinic', title: 'Lexi Pet Clinic', summary: 'Premium care, made approachable.', problem: 'Lexi needed to feel premium without feeling clinical, and make urgent information easy to find on a phone.', build: 'I created an expressive identity system and a fast clinic experience with local SEO foundations and a frictionless request-a-visit flow.', result: 'The new site became the clinic\'s highest-performing referral channel.', role: 'Brand direction + full-stack development', stack: ['Next.js', 'Tailwind', 'SEO'], year: '2024', coverImage: '/placeholder.svg', gallery: ['/placeholder.jpg', '/placeholder.svg'], featured: false, order: 4, published: true },
]

export const certifications = [
  { id: 'seed-cert-1', name: 'Responsive Web Design', issuer: 'freeCodeCamp', date: '2024', credentialUrl: '#', category: 'Development', order: 1 },
  { id: 'seed-cert-2', name: 'JavaScript Algorithms and Data Structures', issuer: 'freeCodeCamp', date: '2024', credentialUrl: '#', category: 'Development', order: 2 },
  { id: 'seed-cert-3', name: 'Google UX Design', issuer: 'Google', date: '2023', credentialUrl: '#', category: 'Design', order: 3 },
]

export const journey = [
  { id: 'seed-journey-1', date: '2023 - 2027', title: 'Bachelor of Computer Applications', org: 'CGC University', description: 'Learning the fundamentals, then taking them apart to build better products.', type: 'education' as const, order: 1 },
  { id: 'seed-journey-2', date: '2024 - now', title: 'Founder / Full-stack developer', org: 'MANTRIX', description: 'Independent digital studio for teams who care about the details.', type: 'work' as const, order: 2 },
  { id: 'seed-journey-3', date: '2024', title: 'Finalist, Odoo x CGC Hackathon', org: 'CGC University', description: 'Turned a rough idea into a working product with a small, sharp team.', type: 'achievement' as const, order: 3 },
  { id: 'seed-journey-4', date: '2025 - now', title: 'Co-founder', org: 'Signature Estates', description: 'Building a more considered way to discover and move through real estate.', type: 'venture' as const, order: 4 },
]

export const testimonials = [
  { id: 'seed-testimonial-1', quote: 'Manmeet has the rare ability to make complex products feel obvious. He brought structure to the chaos and taste to every detail.', name: 'Aarav Mehta', role: 'Founder', company: 'ProjectFlow', order: 1, published: true },
  { id: 'seed-testimonial-2', quote: 'The work feels considered from the first click to the last line of code. We saw the difference immediately.', name: 'Dr. Riya Sharma', role: 'Director', company: 'Meridian Dental', order: 2, published: true },
]

export const settings = {
  availabilityText: 'Taking 2 projects - Nov 2026',
  isAvailable: true,
  heroTagline: 'I make digital products feel inevitable.',
  resumeUrl: '#',
  location: 'New Delhi, India',
  calLink: 'manmeetcodes/discovery-15',
}
