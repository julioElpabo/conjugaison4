import { ANALYTICS_EVENTS, type AnalyticsEventName } from '../../../shared/types/analytics'
import { analyticsSessionId, safeAnalyticsMetadata, safeAnalyticsPath } from '../../utils/analytics-session'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { getLearnerSession } from '../../utils/learner-session'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry)
  const body = await readLimitedJsonBody<{ name?: unknown, path?: unknown, metadata?: unknown }>(event, 8 * 1024)
  const name = typeof body?.name === 'string' ? body.name as AnalyticsEventName : '' as AnalyticsEventName
  if (!ANALYTICS_EVENTS.includes(name)) throw createError({ statusCode: 400, statusMessage: 'Événement inconnu' })
  const sessionId = analyticsSessionId(event)
  const path = safeAnalyticsPath(body?.path)
  const metadata = safeAnalyticsMetadata(body?.metadata)
  const actorType = await getLearnerSession(event) ? 'learner' : 'anonymous'
  const storedMetadata = { ...(metadata || {}), actor: actorType }
  const database = useDatabase()
  await database.execute(`INSERT INTO analytics_sessions (session_id, current_path)
    VALUES (?, ?) ON DUPLICATE KEY UPDATE last_seen=CURRENT_TIMESTAMP,
      current_path=VALUES(current_path)`, [sessionId, path])
  await database.execute('INSERT INTO analytics_events (session_id, event_name, path, metadata) VALUES (?, ?, ?, ?)', [
    sessionId, name, path, JSON.stringify(storedMetadata),
  ])
  return { ok: true }
})
