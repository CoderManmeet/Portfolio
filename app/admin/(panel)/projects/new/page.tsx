import ProjectForm from '@/components/admin/project-form'
import { db } from '@/lib/db'

export default async function NewProjectPage() {
  const last = await db.project.aggregate({ _max: { order: true } })
  return <ProjectForm project={null} nextOrder={(last._max.order ?? 0) + 1} />
}
