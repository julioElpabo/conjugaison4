import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import type { RowDataPacket } from 'mysql2/promise'

interface PublicRateLimit {
  bucket: string
  maximum: number
  windowSeconds: number
}

interface RateLimitRow extends RowDataPacket {
  requestCount: number
  windowStartedAt: Date | string
}

export const PUBLIC_RATE_LIMITS = {
  telemetry: { bucket: 'telemetry', maximum: 180, windowSeconds: 60 },
  questionnaire: { bucket: 'questionnaire', maximum: 60, windowSeconds: 60 },
  tenseExamples: { bucket: 'tense-examples', maximum: 30, windowSeconds: 60 },
  challengeCreate: { bucket: 'challenge-create', maximum: 30, windowSeconds: 60 * 60 },
  challengeRead: { bucket: 'challenge-read', maximum: 180, windowSeconds: 60 },
  feedback: { bucket: 'feedback', maximum: 12, windowSeconds: 10 * 60 },
  automaticHelpError: { bucket: 'automatic-help-error', maximum: 30, windowSeconds: 10 * 60 },
} as const satisfies Record<string, PublicRateLimit>

function clientKey(event: H3Event, bucket: string) {
  // Sur le déploiement Plesk/nginx, la première valeur est remplacée par le
  // proxy et correspond à l'adresse du client.
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return createHash('sha256').update(`${bucket}:${ip}`).digest('hex')
}

export async function assertPublicApiRateLimit(event: H3Event, limit: PublicRateLimit) {
  const now = new Date()
  const boundary = new Date(now.getTime() - limit.windowSeconds * 1000)
  const keyHash = clientKey(event, limit.bucket)
  const database = useDatabase()

  await database.execute(`
    INSERT INTO public_api_rate_limits
      (key_hash, bucket, request_count, window_started_at, updated_at)
    VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      request_count=IF(window_started_at < ?, 1, request_count + 1),
      window_started_at=IF(window_started_at < ?, VALUES(window_started_at), window_started_at),
      updated_at=CURRENT_TIMESTAMP
  `, [keyHash, limit.bucket, now, boundary, boundary])

  const [[row]] = await database.execute<RateLimitRow[]>(`
    SELECT request_count AS requestCount, window_started_at AS windowStartedAt
    FROM public_api_rate_limits
    WHERE key_hash = ?
  `, [keyHash])

  const count = Number(row?.requestCount || 0)
  const startedAt = row ? new Date(row.windowStartedAt).getTime() : now.getTime()
  const resetAt = startedAt + limit.windowSeconds * 1000
  const remaining = Math.max(0, limit.maximum - count)

  setResponseHeader(event, 'RateLimit-Limit', limit.maximum)
  setResponseHeader(event, 'RateLimit-Remaining', remaining)
  setResponseHeader(event, 'RateLimit-Reset', Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)))

  if (count <= limit.maximum) return

  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
  setResponseHeader(event, 'Retry-After', retryAfter)
  throw createError({
    statusCode: 429,
    statusMessage: 'Too Many Requests',
    message: 'Trop de requêtes. Réessayez dans quelques instants.',
  })
}
