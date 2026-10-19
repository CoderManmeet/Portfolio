'use client'

import 'lenis/dist/lenis.css'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { createContext, type RefObject, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

type Area = 'public' | 'admin'

function focusTarget(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

function findHashTarget(hash: string): HTMLElement | null {
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) return null
  return document.getElementById(id)
}

// Reads the pathname (runtime data) inside its own Suspense boundary so it never
// blocks prerendering. Scrolls to top (or to the hash target) on route change.
function RouteWatcher({ lenisRef, onArea }: { lenisRef: RefObject<Lenis | null>; onArea: (area: Area) => void }) {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    onArea(pathname.startsWith('/admin') ? 'admin' : 'public')
  }, [pathname, onArea])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const instance = lenisRef.current
    const target = window.location.hash ? findHashTarget(window.location.hash) : null
    if (target) {
      if (instance) instance.scrollTo(target, { immediate: true, force: true })
      else target.scrollIntoView({ block: 'start' })
      focusTarget(target)
    } else if (instance) {
      instance.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }
    ScrollTrigger.refresh()
  }, [pathname, lenisRef])

  return null
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [area, setArea] = useState<Area | null>(null)

  // One Lenis instance for the public site. One loop only: the GSAP ticker drives Lenis.
  // No Lenis at all under prefers-reduced-motion, and none in the admin panel.
  useEffect(() => {
    if (area !== 'public') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
    })
    lenisRef.current = instance
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => {
      instance.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenisRef.current = null
      setLenis(null)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [area])

  // Same-page anchor links (#work, #journey, #contact): smooth scroll, then focus the section.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank') return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return
      const target = findHashTarget(url.hash)
      if (!target) return

      event.preventDefault()
      if (window.location.hash !== url.hash) window.history.pushState(window.history.state, '', url.hash)

      const instance = lenisRef.current
      if (instance) {
        instance.scrollTo(target, {
          force: true,
          onComplete: () => focusTarget(target),
        })
      } else {
        target.scrollIntoView({ block: 'start' })
        focusTarget(target)
      }
    }
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
      <Suspense fallback={null}>
        <RouteWatcher lenisRef={lenisRef} onArea={setArea} />
      </Suspense>
    </LenisContext.Provider>
  )
}
