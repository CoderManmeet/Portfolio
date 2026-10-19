import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import ProjectForm from '@/components/admin/project-form'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
  const { id } = await params
  const project = await db.project.findUnique({ where: { id } })
  if (!project) notFound()
  return (
    <ProjectForm
      key={project.id}
      nextOrder={project.order}
      project={{
        id: project.id,
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        problem: project.problem,
        build: project.build,
        result: project.result,
        role: project.role,
        stack: project.stack,
        year: project.year,
        coverImage: project.coverImage,
        gallery: project.gallery,
        liveUrl: project.liveUrl ?? '',
        repoUrl: project.repoUrl ?? '',
        featured: project.featured,
        order: project.order,
        published: project.published,
      }}
    />
  )
}
