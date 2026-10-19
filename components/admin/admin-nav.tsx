'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/certifications', label: 'Certifications' },
  { href: '/admin/journey', label: 'Journey' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/inbox', label: 'Inbox' },
]

export default function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin">
      {LINKS.map((link) => {
        const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
        return (
          <Link key={link.href} href={link.href} aria-current={active ? 'page' : undefined}>
            {link.label}
            {link.href === '/admin/inbox' && unread > 0 && <span className="badge">{unread}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
