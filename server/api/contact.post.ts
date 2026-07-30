import { sendContactMessage, validateContactMessage } from '../services/contact-message'
import { getContactSettings } from '../services/contact-settings'
import { assertPublicApiRateLimit } from '../services/public-api-rate-limit'
import { assertTurnstile } from '../services/turnstile'
import { readLimitedJsonBody } from '../utils/limited-json-body'

interface ContactBody {
  email?: unknown
  subject?: unknown
  message?: unknown
  website?: unknown
  turnstileToken?: unknown
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const body = await readLimitedJsonBody<ContactBody>(event, 8 * 1024)
  const honeypot = typeof body.website === 'string' ? body.website.trim() : ''

  if (honeypot) return { ok: true }

  const settings = await getContactSettings()
  if (!settings.enabled) {
    throw createError({ statusCode: 503, statusMessage: 'Le formulaire de contact est temporairement fermé' })
  }
  await assertPublicApiRateLimit(event, {
    bucket: 'contact-short',
    maximum: settings.shortRateLimit,
    windowSeconds: settings.shortRateWindowMinutes * 60,
  })
  await assertPublicApiRateLimit(event, {
    bucket: 'contact-daily',
    maximum: settings.dailyRateLimit,
    windowSeconds: 24 * 60 * 60,
  })
  const contact = validateContactMessage(body, settings)
  await assertTurnstile(event, body.turnstileToken, 'contact', {
    optionalWhenUnconfigured: true,
  })

  try {
    await sendContactMessage(contact, settings.contactEmail)
  }
  catch (error) {
    console.error('[contact] Échec de l’envoi du message.', error)
    throw createError({
      statusCode: 503,
      statusMessage: 'Le message ne peut pas être envoyé actuellement',
    })
  }

  return { ok: true }
})
