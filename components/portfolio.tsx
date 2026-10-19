'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import CalBooking from '@/components/cal-booking'
import { ArrowUp, ArrowUpRight } from '@/components/icons'
import { useLenis } from '@/components/smooth-scroll'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { Certification, JourneyItem, Project, SiteSettings, Testimonial } from '@/lib/types'

const sectionLabel = (n: string, label: string) => <p className="mono label">({n}) - {label}</p>

export default function Portfolio({ projects, journey, certifications, testimonials, settings }: { projects: Project[]; journey: JourneyItem[]; certifications: Certification[]; testimonials: Testimonial[]; settings: SiteSettings }) {
  const [dark, setDark] = useState(false)
  const [menu, setMenu] = useState(false)
  const [time, setTime] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const calUrl = `https://cal.com/${settings.calLink}`
  const quote = testimonials[0]

  useEffect(() => { const update = () => setTime(new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())); update(); const id = setInterval(update, 60000); return () => clearInterval(id) }, [])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
    if (menu) lenis?.stop()
    else lenis?.start()
    return () => { document.body.style.overflow = '' }
  }, [menu, lenis])

  // Scroll animations: transform/opacity only (plus the hero clip-path reveal), run once,
  // content stays visible without JS, everything skipped under prefers-reduced-motion.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const photo = root.querySelector<HTMLElement>('.hero-photo')
      if (photo) {
        gsap.fromTo(photo, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, delay: 0.15, ease: 'power4.inOut' })
      }

      gsap.utils.toArray<HTMLElement>('.section-head, .contact-section h2', root).forEach((el) => {
        gsap.from(el, { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
      })

      const rows = gsap.utils.toArray<HTMLElement>('.project-row', root)
      if (rows.length) {
        gsap.set(rows, { y: 40, opacity: 0 })
        ScrollTrigger.batch(rows, {
          start: 'top 92%',
          once: true,
          onEnter: (batch) => { gsap.to(batch, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out', overwrite: true }) },
        })
      }

      const line = root.querySelector<HTMLElement>('.journey-line')
      const list = root.querySelector<HTMLElement>('.journey-list')
      if (line && list) {
        gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 80%', end: 'bottom 60%', scrub: true } })
      }
    })
    return () => mm.revert()
  }, [])

  return <div className="site-shell" ref={rootRef}>
    <div className="grain" aria-hidden="true" />
    <a className="skip" href="#main">Skip to content</a>
    <header className="topbar"><Link href="#top" className="wordmark">MANMEET SINGH</Link><nav className="desktop-nav"><a href="#work">WORK</a><a href="#journey">JOURNEY</a><a href="#contact">CONTACT</a><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? 'LIGHT' : 'DARK'}</button></nav><button className="menu-button" onClick={() => setMenu(true)} aria-label="Open menu">MENU <span>+</span></button></header>
    {menu && <div className="mobile-menu"><button className="close-menu" onClick={() => setMenu(false)}>CLOSE <span>&times;</span></button><nav><a href="#work" onClick={() => setMenu(false)}>WORK</a><a href="#journey" onClick={() => setMenu(false)}>JOURNEY</a><a href="#contact" onClick={() => setMenu(false)}>CONTACT</a></nav><p className="mono menu-foot">NEW DELHI / INDIA<br />{time} IST</p></div>}
    <main id="main">
      <section id="top" className="hero section-rule"><div className="hero-meta mono"><span>FULL-STACK DEVELOPER<br />&amp; FOUNDER</span><span>{settings.location.toUpperCase()}<br />{time || '01:25'} IST</span></div><h1>MANMEET<br /><em>SINGH</em></h1><div className="hero-photo"><Image src="/me.jpg" alt="Portrait of Manmeet Singh" fill priority sizes="(max-width: 700px) 42vw, 280px" /></div><div className="hero-bottom"><p>{settings.heroTagline}</p><a className="availability" href="#contact"><i className={settings.isAvailable ? 'pulse' : ''} />{settings.availabilityText}</a></div></section>
      <div className="marquee" aria-label="Services and tools"><div className="marquee-track">STRATEGY <b>&times;</b> DESIGN <b>&times;</b> DEVELOPMENT <b>&times;</b> NEXT.JS <b>&times;</b> DIGITAL PRODUCTS <b>&times;</b> BRAND SYSTEMS <b>&times;</b> STRATEGY <b>&times;</b> DESIGN <b>&times;</b> DEVELOPMENT <b>&times;</b></div></div>
      <section id="work" className="content-section work-section"><div className="section-head">{sectionLabel('01', 'SELECTED WORK')}<p className="mono faint">2024 - 2026</p></div><div className="project-list">{projects.map((project, i) => <Link className="project-row" href={`/work/${project.slug}`} key={project.id}><span className="mono project-index">{String(i + 1).padStart(2, '0')}</span><span className="project-title">{project.title}</span><span className="mono project-tags">{project.stack.slice(0, 2).join(' / ')}</span><span className="mono project-year">{project.year}</span><span className="arrow"><ArrowUpRight /></span></Link>)}</div></section>
      <section id="journey" className="content-section journey-section"><div className="section-head">{sectionLabel('02', 'THE JOURNEY')}</div><div className="journey-list"><span className="journey-line" aria-hidden="true" />{journey.map((item) => <article className="journey-item" key={item.id}><p className="mono journey-date">{item.date}</p><div><h3>{item.title}</h3><p className="mono org">{item.org}</p><p className="body-copy">{item.description}</p></div><span className="mono type">{item.type}</span></article>)}</div></section>
      <section className="content-section services-section"><div className="section-head">{sectionLabel('03', 'WHAT I DO')}</div><div className="services">{['Product strategy', 'Interface systems', 'Full-stack builds', 'Digital direction'].map((service, i) => <div className="service" key={service}><span className="mono">0{i + 1}</span><h3>{service}</h3><span className="arrow"><ArrowUpRight /></span></div>)}</div></section>
      <section className="content-section certification-section"><div className="section-head">{sectionLabel('04', 'CERTIFICATIONS')}</div><div className="cert-table">{certifications.map((cert) => <a href={cert.credentialUrl} key={cert.id} target={cert.credentialUrl && cert.credentialUrl !== '#' ? '_blank' : undefined} rel="noreferrer"><span>{cert.name}</span><span className="mono">{cert.issuer}</span><span className="mono">{cert.date}</span><span className="arrow"><ArrowUpRight /></span></a>)}</div></section>
      {quote && <section className="quote-section"><span className="quote-mark">&ldquo;</span><blockquote>{quote.quote}</blockquote><p className="mono">{quote.name} / {quote.company}</p></section>}
      <section id="contact" className="contact-section"><div className="contact-left"><div className="section-head">{sectionLabel('05', 'CONTACT')}</div><h2>Start a<br /><em>project.</em></h2><form action="/api/contact" method="post"><input name="name" placeholder="YOUR NAME" required /><input type="email" name="email" placeholder="EMAIL ADDRESS" required /><select name="budget" defaultValue=""><option value="" disabled>BUDGET RANGE</option><option>$2k - $5k</option><option>$5k - $10k</option><option>$10k+</option></select><select name="timeline" defaultValue=""><option value="" disabled>TIMELINE</option><option>ASAP</option><option>1 - 2 MONTHS</option><option>3+ MONTHS</option></select><textarea name="message" placeholder="TELL ME ABOUT THE WORK" rows={4} required /><input className="honeypot" name="company" tabIndex={-1} autoComplete="off" /><button type="submit" className="submit-button">SEND INQUIRY <span><ArrowUpRight /></span></button></form><div className="contact-links mono"><a href="mailto:manmeeet00002006@gmail.com">EMAIL</a><a href="https://linkedin.com/in/manmeetcodess">LINKEDIN</a><a href="https://github.com/CoderManmeet">GITHUB</a></div></div><div className="booking"><p className="mono label">OR BOOK A 15-MIN DISCOVERY CALL</p><h3>Let&apos;s make<br /><em>time.</em></h3><p className="body-copy">Bring a question, a half-formed idea, or a project that needs a clearer next step.</p><CalBooking calLink={settings.calLink} theme={dark ? 'dark' : 'light'} /><a href={calUrl} target="_blank" rel="noreferrer" className="booking-link cal-fallback">OPEN CAL.COM <span><ArrowUpRight /></span></a></div></section>
    </main>
    <footer><div className="footer-wordmark">MANTRIX</div><div className="footer-bottom"><span className="mono">&copy; 2026 MANMEET SINGH</span><a className="mono" href="#top">BACK TO TOP <ArrowUp /></a><span className="mono">NEW DELHI / INDIA</span></div></footer>
  </div>
}
