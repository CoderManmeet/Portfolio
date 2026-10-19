'use client'

import { useState } from 'react'

export default function TagInput({ value, onChange, placeholder = 'Type and press Enter', id }: { value: string[]; onChange: (next: string[]) => void; placeholder?: string; id?: string }) {
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean)
    if (!parts.length) return
    const next = [...value]
    for (const part of parts) {
      if (!next.some((tag) => tag.toLowerCase() === part.toLowerCase())) next.push(part)
    }
    onChange(next)
    setDraft('')
  }

  return (
    <div className="tags">
      {value.map((tag, index) => (
        <span className="tag" key={`${tag}-${index}`}>
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((_, i) => i !== index))}>x</button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            add(draft)
          } else if (event.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => add(draft)}
      />
    </div>
  )
}
