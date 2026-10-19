// Brevo transactional email (https://api.brevo.com/v3/smtp/email). No SDK, just fetch.

type Address = { email: string; name?: string }

type SendInput = {
  to: Address[]
  subject: string
  html: string
  text: string
  replyTo?: Address
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendBrevoEmail(input: SendInput): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !fromEmail) throw new Error('Brevo is not configured (BREVO_API_KEY / CONTACT_FROM_EMAIL).')

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: fromEmail, name: 'Manmeet Singh' },
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
    }),
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Brevo responded ${response.status}: ${detail.slice(0, 300)}`)
  }
}
