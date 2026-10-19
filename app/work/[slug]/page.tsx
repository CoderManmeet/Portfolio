import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowUpRight } from '@/components/icons'
import ViewBeacon from '@/components/view-beacon'
import { getProjectBySlug, getProjects } from '@/lib/data'
import { renderMarkdown } from '@/lib/markdown'
import { jsonLd, SITE_URL } from '@/lib/site'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const projects = await getProjects()
  if (projects.length === 0) return [{ slug: '__placeholder__' }]
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  return {
    title: project ? `${project.title} - Manmeet Singh` : 'Work - Manmeet Singh',
    description: project?.summary,
    alternates: project ? { canonical: `/work/${project.slug}` } : undefined,
  }
}

function GalleryImage({ src, index, title }: { src: string; index: number; title: string }) {
  const full = index % 2 === 0
  return (
    <div className={full ? 'case-gallery' : 'case-gallery offset'}>
      <Image
        src={src}
        alt={`${title} project detail ${index + 1}`}
        width={full ? 1400 : 900}
        height={full ? 850 : 1100}
        sizes={full ? '(max-width: 1100px) 92vw, 1000px' : '(max-width: 700px) 78vw, 620px'}
      />
    </div>
  )
}

export default async function CaseStudy({ params }: Params) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()
  const projects = await getProjects()
  const next = projects[(projects.findIndex((item) => item.slug === slug) + 1) % projects.length] ?? project

  const [problemHtml, buildHtml, resultHtml] = await Promise.all([
    renderMarkdown(project.problem),
    renderMarkdown(project.build),
    renderMarkdown(project.result, { accentNumbers: true }),
  ])

  const gallery = project.gallery.filter(Boolean)
  const [first, second, ...rest] = gallery

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: `${SITE_URL}/work/${project.slug}`,
    image: project.coverImage.startsWith('http') ? project.coverImage : `${SITE_URL}${project.coverImage}`,
    dateCreated: project.year,
    keywords: project.stack.join(', '),
    creator: { '@type': 'Person', name: 'Manmeet Singh', url: SITE_URL },
    ...(project.liveUrl && project.liveUrl.startsWith('http') ? { sameAs: project.liveUrl } : {}),
  }

  return <main className="case-study">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
    <ViewBeacon slug={project.slug} />
    <header className="case-nav"><Link href="/">MANMEET SINGH</Link><Link href="/#work" className="mono">BACK TO WORK <ArrowUpRight /></Link></header>
    <section className="case-hero"><p className="mono label">CASE STUDY / {project.year}</p><h1>{project.title}</h1><p className="case-summary">{project.summary}</p><div className="case-cover"><Image src={project.coverImage} alt={`${project.title} project cover`} fill priority sizes="100vw" /></div></section>
    <div className="case-meta mono"><span>ROLE / {project.role}</span><span>STACK / {project.stack.join(' / ')}</span><span>YEAR / {project.year}</span>{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">LIVE <ArrowUpRight /></a>}{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer">REPO <ArrowUpRight /></a>}</div>
    <article className="case-content">
      <section><p className="mono label">(01) - THE PROBLEM</p><div><h2>The question beneath the brief.</h2><div className="case-copy" dangerouslySetInnerHTML={{ __html: problemHtml }} /></div></section>
      {first && <GalleryImage src={first} index={0} title={project.title} />}
      <section><p className="mono label">(02) - THE BUILD</p><div><h2>Less noise. More signal.</h2><div className="case-copy" dangerouslySetInnerHTML={{ __html: buildHtml }} /></div></section>
      {second && <GalleryImage src={second} index={1} title={project.title} />}
      <section className="result-section"><p className="mono label">(03) - THE RESULT</p><div><h2>Work that moves.</h2><div className="case-copy" dangerouslySetInnerHTML={{ __html: resultHtml }} /></div></section>
      {rest.map((src, i) => <GalleryImage key={`${src}-${i}`} src={src} index={i + 2} title={project.title} />)}
    </article>
    <section className="case-next"><p className="mono">HAVE A SIMILAR PROJECT?</p><Link href="/#contact" className="case-cta">START A CONVERSATION <ArrowUpRight /></Link><Link href={`/work/${next.slug}`} className="next-project"><span className="mono">NEXT PROJECT</span><strong>{next.title} <ArrowUpRight /></strong></Link></section>
  </main>
}
