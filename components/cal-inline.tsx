'use client'

import Cal, { getCalApi } from '@calcom/embed-react'
import { useEffect } from 'react'

export const CAL_NAMESPACE = 'discovery'
const BRAND = '#FF4A1C'

type CalApi = (action: string, payload: unknown) => void

export default function CalInline({ calLink, theme, onReady }: { calLink: string; theme: 'light' | 'dark'; onReady: () => void }) {
  useEffect(() => {
    let cancelled = false
    getCalApi({ namespace: CAL_NAMESPACE }).then((api) => {
      if (cancelled) return
      const cal = api as unknown as CalApi
      cal('ui', {
        theme,
        layout: 'month_view',
        hideEventTypeDetails: false,
        styles: { branding: { brandColor: BRAND } },
        cssVarsPerTheme: {
          light: { 'cal-brand': BRAND },
          dark: { 'cal-brand': BRAND },
        },
      })
      cal('on', { action: 'linkReady', callback: () => onReady() })
    })
    return () => {
      cancelled = true
    }
  }, [theme, onReady])

  return (
    <Cal
      namespace={CAL_NAMESPACE}
      calLink={calLink}
      style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      config={{ layout: 'month_view', theme }}
    />
  )
}
