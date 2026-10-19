'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

function CalSkeleton() {
  return (
    <div className="cal-skeleton" aria-hidden="true">
      <span />
      <span />
      <span className="cal-skeleton-grid" />
      <p className="mono">LOADING CALENDAR</p>
    </div>
  )
}

const CalInline = dynamic(() => import('./cal-inline'), { ssr: false, loading: () => null })

export default function CalBooking({ calLink, theme }: { calLink: string; theme: 'light' | 'dark' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const node = ref.current
    if (!node || near) return
    const watch = node.closest('section') ?? node
    if (!('IntersectionObserver' in window)) {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px 400px 0px' },
    )
    observer.observe(watch)
    return () => observer.disconnect()
  }, [near])

  // Safety net: never leave the skeleton up forever.
  useEffect(() => {
    if (!near || ready) return
    const id = window.setTimeout(() => setReady(true), 10000)
    return () => window.clearTimeout(id)
  }, [near, ready])

  return (
    <div ref={ref} className="cal-embed" data-lenis-prevent aria-label="Book a discovery call">
      {near && <CalInline calLink={calLink} theme={theme} onReady={onReady} />}
      {!ready && <CalSkeleton />}
    </div>
  )
}
