'use client'

import { useEffect, useState } from 'react'
import { renderMarkdown } from '@/lib/markdown'

// Write / Preview tabs. The preview uses the exact same renderer as the public case study page.
export default function MarkdownField({ value, onChange, accentNumbers, id, rows = 8 }: { value: string; onChange: (next: string) => void; accentNumbers?: boolean; id: string; rows?: number }) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (tab !== 'preview') return
    let cancelled = false
    renderMarkdown(value, { accentNumbers }).then((out) => {
      if (!cancelled) setHtml(out)
    })
    return () => {
      cancelled = true
    }
  }, [tab, value, accentNumbers])

  return (
    <div>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'write'} onClick={() => setTab('write')}>Write</button>
        <button type="button" role="tab" aria-selected={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button>
      </div>
      {tab === 'write' ? (
        <textarea id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Markdown supported: **bold**, lists, links, tables." />
      ) : (
        <div className="preview" dangerouslySetInnerHTML={{ __html: html || '<p class="muted">Nothing to preview.</p>' }} />
      )}
    </div>
  )
}
