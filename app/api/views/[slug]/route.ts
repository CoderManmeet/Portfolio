import { db } from '@/lib/db'

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|headless|lighthouse/i

// Increments the view counter. Never revalidates anything, so pages stay static.
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const agent = request.headers.get('user-agent') ?? ''
  if (!slug || slug.length > 80 || BOT_PATTERN.test(agent)) return new Response(null, { status: 204 })
  try {
    await db.project.updateMany({ where: { slug, published: true }, data: { views: { increment: 1 } } })
  } catch (error) {
    console.error('[views] increment failed', error)
  }
  return new Response(null, { status: 204 })
}
