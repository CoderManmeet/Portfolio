import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Mono, Instrument_Serif, Inter_Tight } from 'next/font/google'
import SmoothScroll from '@/components/smooth-scroll'
import './globals.css'
import './case-study.css'
import './enhancements.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter-tight',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-dm-mono',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Manmeet Singh - Full-stack developer',
  description: 'Manmeet Singh is a full-stack developer and founder of MANTRIX, making digital products feel inevitable.',
  openGraph: {
    title: 'Manmeet Singh - Full-stack developer',
    description: 'Manmeet Singh is a full-stack developer and founder of MANTRIX, making digital products feel inevitable.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#EFEBE4' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E0E' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${interTight.variable} ${dmMono.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
