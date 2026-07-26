import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import type { RowDataPacket } from 'mysql2/promise'

interface RateLimitRow extends RowDataPacket {
  requestCount: number
  windowStartedAt: Date | string
}

interface LearnerRateLimit {
  bucket: string
  identity: string
  maximum: number
  windowSeconds: number
}

export async function assertLearnerRateLimit(event: H3Event, limit: LearnerRateLimit) {
  const now = new Date()
  const boundary = new Date(now.getTime() - limit.windowSeconds * 1000)
  const keyHash = createHash('sha256')
    .update(`${limit.bucket}:${limit.identity}`)
    .digest('hex')
  const database = useDatabase()

  await database.execute(`
    INSERT INTO learner_registration_rate_limits
      (key_hash, bucket, request_count, window_started_at, updated_at)
    VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      request_count=IF(window_started_at < ?, 1, request_count + 1),
      window_started_at=IF(window_started_at < ?, VALUES(window_started_at), window_started_at),
      updated_at=CURRENT_TIMESTAMP
  `, [keyHash, limit.bucket, now, boundary, boundary])

  const [[row]] = await database.execute<RateLimitRow[]>(`
    SELECT request_count AS requestCount, window_started_at AS windowStartedAt
    FROM learner_registration_rate_limits WHERE key_hash = ?
  `, [keyHash])
  const count = Number(row?.requestCount || 0)
  if (count <= limit.maximum) return

  const startedAt = row ? new Date(row.windowStartedAt).getTime() : now.getTime()
  const retryAfter = Math.max(1, Math.ceil((startedAt + limit.windowSeconds * 1000 - Date.now()) / 1000))
  setResponseHeader(event, 'Retry-After', retryAfter)
  throw createError({
    statusCode: 429,
    statusMessage: 'Trop de tentatives',
    message: 'Trop de tentatives. Réessayez plus tard.',
  })
}

export function learnerClientIp(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}
