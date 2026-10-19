import SettingsForm from '@/components/admin/settings-form'
import { db } from '@/lib/db'

export default async function AdminSettingsPage() {
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
