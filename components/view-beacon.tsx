'use client'

import { useEffect } from 'react'

// Counts one view per project per browser session.
export default function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`
    try {
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')
    } catch {
      // Storage blocked (private mode etc.): still count, once per page load.
    }
    fetch(`/api/views/${encodeURIComponent(slug)}`, { method: 'POST', keepalive: true }).catch(() => undefined)
  }, [slug])
  return null
}
