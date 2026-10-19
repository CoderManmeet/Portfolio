import { connection } from 'next/server'
import ProjectForm from '@/components/admin/project-form'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function NewProjectPage() {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
  const last = await db.project.aggregate({ _max: { order: true } })
  return <ProjectForm project={null} nextOrder={(last._max.order ?? 0) + 1} />
}
