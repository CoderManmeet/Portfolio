import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/auth-guard'

const FOLDER = 'portfolio'
const IMAGE_FORMATS = 'jpg,jpeg,png,webp,avif'

// Signs a direct browser -> Cloudinary upload. Admin session required.
export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary is not configured.' }, { status: 500 })
  }

  let kind: 'image' | 'raw' = 'image'
  try {
    const body = (await request.json()) as { kind?: string }
    if (body.kind === 'raw') kind = 'raw'
  } catch {
    // default to image
  }

  const timestamp = Math.floor(Date.now() / 1000)
  // Every param that Cloudinary signs must be listed here, sorted alphabetically.
  const params: Record<string, string | number> = { folder: FOLDER, timestamp }
  if (kind === 'image') params.allowed_formats = IMAGE_FORMATS

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  const signature = createHash('sha1').update(toSign + apiSecret).digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    folder: FOLDER,
    apiKey,
    cloudName,
    resourceType: kind,
    allowedFormats: kind === 'image' ? IMAGE_FORMATS : undefined,
  })
}
