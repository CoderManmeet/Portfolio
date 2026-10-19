import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { getProjectBySlug } from '@/lib/data'

export const alt = 'Manmeet Singh - case study'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  const title = project?.title ?? 'Selected work'

  const [serif, mono] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/InstrumentSerif-Regular.woff')),
    readFile(join(process.cwd(), 'assets/fonts/DMMono-Medium.woff')),
  ])

  const fontSize = title.length > 22 ? 120 : title.length > 14 ? 150 : 190

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#EFEBE4', color: '#0E0E0E', padding: '64px 72px' }}>
        <div style={{ display: 'flex', fontFamily: 'DM Mono', fontSize: 24, letterSpacing: 3 }}>MANMEET SINGH - CASE STUDY</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: 'Instrument Serif', fontSize, lineHeight: 0.9, letterSpacing: -4 }}>{title}</div>
          <div style={{ display: 'flex', width: '100%', height: 6, background: '#FF4A1C', marginTop: 44 }} />
          {project?.summary && <div style={{ display: 'flex', fontFamily: 'DM Mono', fontSize: 22, color: '#706C65', marginTop: 24 }}>{project.summary.toUpperCase()}</div>}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Instrument Serif', data: serif, style: 'normal', weight: 400 },
        { name: 'DM Mono', data: mono, style: 'normal', weight: 500 },
      ],
    },
  )
}
