import Link from 'next/link'
import ProjectsList from '@/components/admin/projects-list'
import { db } from '@/lib/db'

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, title: true, slug: true, coverImage: true, featured: true, published: true, views: true, year: true },
  })
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Projects</h1>
          <p className="muted">{projects.length} total</p>
        </div>
        <Link className="btn primary" href="/admin/projects/new">New project</Link>
      </div>
      <ProjectsList initial={projects} />
    </>
  )
}
