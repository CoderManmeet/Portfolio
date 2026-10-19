import { after, NextResponse } from 'next/server'
import { getSettings } from '@/lib/data'
import { db } from '@/lib/db'
import { escapeHtml, sendBrevoEmail } from '@/lib/email'
import { contactSchema, type ContactOutput } from '@/lib/validation'

const LIMIT = 3 // per IP per 10 minutes (window is set in the SQL below)

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function field(form: FormData, name: string): string | undefined {
  const value = form.get(name)
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

// Atomic fixed-window counter: one statement, safe under concurrent requests.
async function hitRateLimit(key: string): Promise<number> {
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowStart" < NOW() - INTERVAL '10 minutes' THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimit"."windowStart" < NOW() - INTERVAL '10 minutes' THEN NOW() ELSE "RateLimit"."windowStart" END
    RETURNING "count"
  `
  return Number(rows[0]?.count ?? 1)
}

async function notify(message: ContactOutput & { id: string }) {
  const settings = await getSettings()
  const bookingUrl = `https://cal.com/${settings.calLink}`
  const to = process.env.CONTACT_TO_EMAIL

  const lines = [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Budget: ${message.budget ?? '-'}`,
    `Timeline: ${message.timeline ?? '-'}`,
    '',
    message.message,
  ]

  const jobs: Promise<void>[] = []

  if (to) {
    jobs.push(
      sendBrevoEmail({
        to: [{ email: to }],
        replyTo: { email: message.email, name: message.name },
        subject: `New inquiry from ${message.name}`,
        text: lines.join('\n'),
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">${lines.map((line) => (line ? escapeHtml(line) : '&nbsp;')).join('<br>')}</div>`,
      }),
    )
  } else {
    console.error('[contact] CONTACT_TO_EMAIL is not set; skipping notification email')
  }

  const replyText = `Hi ${message.name},\n\nGot it - I reply within 24 hours. Want to talk sooner? Book a call: ${bookingUrl}\n\n- Manmeet`
  jobs.push(
    sendBrevoEmail({
      to: [{ email: message.email, name: message.name }],
      replyTo: to ? { email: to, name: 'Manmeet Singh' } : undefined,
      subject: 'Got your message',
      text: replyText,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5"><p>Hi ${escapeHtml(message.name)},</p><p>Got it - I reply within 24 hours. Want to talk sooner? Book a call: <a href="${escapeHtml(bookingUrl)}">${escapeHtml(bookingUrl)}</a></p><p>- Manmeet</p></div>`,
    }),
  )

  const results = await Promise.allSettled(jobs)
  for (const result of results) {
    if (result.status === 'rejected') console.error('[contact] email failed for message', message.id, result.reason)
  }
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  // Honeypot: bots fill the hidden "company" field. Pretend success, do nothing.
  if (field(form, 'company')) return NextResponse.json({ ok: true })

  const parsed = contactSchema.safeParse({
    name: field(form, 'name') ?? '',
    email: field(form, 'email') ?? '',
    budget: field(form, 'budget'),
    timeline: field(form, 'timeline'),
    message: field(form, 'message') ?? '',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Please complete the required fields.' }, { status: 400 })
  }

  const ip = clientIp(request)

  try {
    const count = await hitRateLimit(`contact:${ip}`)
    if (count > LIMIT) {
      return NextResponse.json({ error: 'You have sent a few messages already. Please try again in about 10 minutes, or book a call instead.' }, { status: 429 })
    }

    const saved = await db.contactMessage.create({
      data: { ...parsed.data, ip: ip === 'unknown' ? null : ip },
      select: { id: true },
    })

    // Emails run after the response is sent. A failure is logged; the message is already saved.
    after(async () => {
      try {
        await notify({ ...parsed.data, id: saved.id })
      } catch (error) {
        console.error('[contact] notification step failed', error)
      }
      if (Math.random() < 0.02) {
        await db.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }).catch(() => undefined)
      }
    })

    return NextResponse.json({ ok: true, message: 'Thanks - your inquiry is on its way.' })
  } catch (error) {
    console.error('[contact] failed to save message', error)
    return NextResponse.json({ error: 'Something went wrong. Please email me directly instead.' }, { status: 500 })
  }
}
