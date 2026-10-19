import { connection } from 'next/server'
import SettingsForm from '@/components/admin/settings-form'
import { db } from '@/lib/db'

// Admin pages read fresh data per request; navigation may wait for the server.
export const instant = false

export default async function AdminSettingsPage() {
  await connection() // request-time only: DB drivers use random values Next.js forbids during prerender
  const row = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Settings</h1>
          <p className="muted">Hero, availability, booking link and resume.</p>
        </div>
      </div>
      <SettingsForm
        initial={{
          isAvailable: row?.isAvailable ?? true,
          availabilityText: row?.availabilityText ?? 'Available for new projects',
          heroTagline: row?.heroTagline ?? 'I make digital products feel inevitable.',
          location: row?.location ?? 'New Delhi, India',
          calLink: row?.calLink ?? 'manmeetcodes/discovery-15',
          resumeUrl: row?.resumeUrl ?? '',
        }}
      />
    </>
  )
}
