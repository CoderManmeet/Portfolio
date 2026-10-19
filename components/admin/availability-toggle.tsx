'use client'

import { useState, useTransition } from 'react'
import { setAvailability } from '@/app/admin/actions'
import Switch from '@/components/admin/switch'

export default function AvailabilityToggle({ initial, text }: { initial: boolean; text: string }) {
  const [value, setValue] = useState(initial)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  return (
    <div>
      <Switch
        checked={value}
        disabled={pending}
        label={value ? 'Available for work' : 'Not available'}
        onChange={(next) => {
          setValue(next)
          setError('')
          startTransition(async () => {
            const result = await setAvailability(next)
            if (!result.ok) {
              setValue(!next)
              setError(result.error)
            }
          })
        }}
      />
      <p className="small muted" style={{ marginTop: 8 }}>Shown on the site: {text}</p>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
