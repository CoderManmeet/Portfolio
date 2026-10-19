'use client'

export type UploadKind = 'image' | 'raw'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024
export const PDF_MAX_BYTES = 5 * 1024 * 1024

type SignResponse = {
  signature: string
  timestamp: number
  folder: string
  apiKey: string
  cloudName: string
  resourceType: UploadKind
  allowedFormats?: string
  error?: string
}

export function validateFile(file: File, kind: UploadKind): string | null {
  if (kind === 'image') {
    if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: use JPG, PNG, WebP or AVIF.`
    if (file.size > IMAGE_MAX_BYTES) return `${file.name}: images must be 8MB or smaller.`
  } else {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return `${file.name}: the resume must be a PDF.`
    if (file.size > PDF_MAX_BYTES) return `${file.name}: the PDF must be 5MB or smaller.`
  }
  return null
}

// Signed upload straight from the browser to Cloudinary. Returns the secure_url.
export async function uploadToCloudinary(file: File, kind: UploadKind): Promise<string> {
  const problem = validateFile(file, kind)
  if (problem) throw new Error(problem)

  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind }),
  })
  const sign = (await signRes.json()) as SignResponse
  if (!signRes.ok) throw new Error(sign.error || 'Could not sign the upload.')

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sign.apiKey)
  form.append('timestamp', String(sign.timestamp))
  form.append('signature', sign.signature)
  form.append('folder', sign.folder)
  if (sign.allowedFormats) form.append('allowed_formats', sign.allowedFormats)

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`, {
    method: 'POST',
    body: form,
  })
  const result = (await uploadRes.json()) as { secure_url?: string; error?: { message?: string } }
  if (!uploadRes.ok || !result.secure_url) {
    throw new Error(result.error?.message || 'Upload failed.')
  }
  return result.secure_url
}
