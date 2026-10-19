'use client'

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react'
import SortableList from '@/components/admin/sortable-list'
import { uploadToCloudinary } from '@/lib/upload-client'

export function CoverImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadToCloudinary(file, 'image'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {value ? <img className="cover-preview" src={value} alt="Cover preview" /> : <div className="cover-preview" />}
      <div className="btn-row">
        <button type="button" className="btn small" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? 'Uploading...' : value ? 'Replace cover' : 'Upload cover'}</button>
        {value && <button type="button" className="btn small danger" onClick={() => onChange('')}>Remove</button>}
        <span className="small muted">JPG, PNG, WebP or AVIF, max 8MB</span>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(event) => onFiles(event.target.files)} />
      {error && <p className="error">{error}</p>}
    </div>
  )
}

type Tile = { id: string; url: string }

let tileCounter = 0
const toTiles = (urls: string[]): Tile[] => urls.map((url) => ({ id: `tile-${++tileCounter}`, url }))

export function GalleryField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [tiles, setTiles] = useState<Tile[]>(() => toTiles(value))
  const tilesRef = useRef(tiles)
  const [busy, setBusy] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const commit = (next: Tile[]) => {
    tilesRef.current = next
    setTiles(next)
    onChange(next.map((tile) => tile.url))
  }

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files)
    setErrors([])
    setBusy(list.length)
    const added: Tile[] = []
    const problems: string[] = []
    await Promise.all(
      list.map(async (file) => {
        try {
          const url = await uploadToCloudinary(file, 'image')
          added.push(...toTiles([url]))
        } catch (err) {
          problems.push(err instanceof Error ? err.message : `${file.name}: upload failed.`)
        } finally {
          setBusy((count) => count - 1)
        }
      }),
    )
    if (added.length) commit([...tilesRef.current, ...added])
    setErrors(problems)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {tiles.length > 0 ? (
        <SortableList
          items={tiles}
          layout="grid"
          className="uploads"
          itemClassName="upload-tile"
          onReorder={commit}
          renderItem={(tile, handle, index) => (
            <>
              <img src={tile.url} alt={`Gallery image ${index + 1}`} />
              <div className="tile-bar">
                {handle}
                <span className="small muted">{index + 1}</span>
                <button type="button" className="btn small danger" onClick={() => commit(tiles.filter((item) => item.id !== tile.id))}>Remove</button>
              </div>
            </>
          )}
        />
      ) : (
        <p className="small muted">No gallery images yet.</p>
      )}
      <div className="btn-row" style={{ marginTop: 10 }}>
        <button type="button" className="btn small" disabled={busy > 0} onClick={() => inputRef.current?.click()}>{busy > 0 ? `Uploading ${busy}...` : 'Add images'}</button>
        <span className="small muted">Multiple allowed. Drag to reorder.</span>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(event) => onFiles(event.target.files)} />
      {errors.map((problem) => <p className="error" key={problem}>{problem}</p>)}
    </div>
  )
}
