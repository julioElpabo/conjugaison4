import type { H3Event } from 'h3'

interface TurnstileResponse {
  success?: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

export async function assertTurnstile(event: H3Event, token: unknown, expectedAction: string) {
  const secret = useRuntimeConfig().turnstileSecretKey
  const expectedHostname = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).hostname
  if (typeof secret !== 'string' || !secret.trim()) {
    if (['localhost', '127.0.0.1', '::1'].includes(expectedHostname)) return
    throw createError({ statusCode: 503, statusMessage: 'Protection antibot indisponible' })
  }
  const responseToken = typeof token === 'string' ? token.trim() : ''
  if (!responseToken || responseToken.length > 2048) {
    throw createError({ statusCode: 400, statusMessage: 'Vérification antibot manquante' })
  }
  const result = await $fetch<TurnstileResponse>(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: {
        secret,
        response: responseToken,
      },
    }
  ).catch(() => null)
  if (
    !result?.success
    || result.hostname !== expectedHostname
    || (result.action && result.action !== expectedAction)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Vérification antibot refusée' })
  }
}
