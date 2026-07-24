const EVENT_COLUMNS = {
  homepage: 'homepage',
  print: 'creationpdf',
  'challenge-save': 'sauvedefi',
  'challenge-load': 'chargedefi',
  exercise: 'exercersimple',
  result: 'resultatsimple'
} as const

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry)
  const body = await readLimitedJsonBody<{ event?: unknown }>(event, 8 * 1024)
  const eventName = typeof body?.event === 'string' ? body.event : ''
  const column = EVENT_COLUMNS[eventName as keyof typeof EVENT_COLUMNS]

  if (!column) {
    throw createError({ statusCode: 400, statusMessage: 'Événement inconnu' })
  }

  // Le nom de colonne vient exclusivement de la liste fermée ci-dessus.
  await useDatabase().execute(`INSERT INTO logs (\`${column}\`) VALUES (1)`)
  return { ok: true }
})
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../utils/limited-json-body'
