'use client'

import { useState } from 'react'

// Two-step delete inside the UI (no window.confirm).
export default function ConfirmButton({ onConfirm, label = 'Delete', confirmLabel = 'Yes, delete', disabled }: { onConfirm: () => void | Promise<void>; label?: string; confirmLabel?: string; disabled?: boolean }) {
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!asking) {
    return <button type="button" className="btn small danger" disabled={disabled} onClick={() => setAsking(true)}>{label}</button>
  }
  return (
    <span className="btn-row" role="group" aria-label="Confirm delete">
      <span className="small muted">Sure?</span>
      <button
        type="button"
        className="btn small danger solid"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await onConfirm()
          } finally {
            setBusy(false)
            setAsking(false)
          }
        }}
      >
        {busy ? 'Deleting...' : confirmLabel}
      </button>
      <button type="button" className="btn small" disabled={busy} onClick={() => setAsking(false)}>Cancel</button>
    </span>
  )
}
