import { ANALYTICS_EVENTS, type AnalyticsEventName } from '../../../shared/types/analytics'
import { analyticsSessionId, safeAnalyticsMetadata, safeAnalyticsPath } from '../../utils/analytics-session'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { getLearnerSession } from '../../utils/learner-session'
import { recordFalcModeUsed } from '../../services/admin-push-notifications'
import { ANALYTICS_CONSENT_ACCEPTED, ANALYTICS_CONSENT_COOKIE_NAME } from '../../../shared/data/analytics-consent'

const FALC_USAGE_EVENTS = new Set<AnalyticsEventName>([
  'challenge_preset_selected',
  'challenge_load',
  'challenge_save',
  'exercise_started',
  'help_opened',
  'print_opened',
  'pdf_downloaded',
  'word_downloaded',
])

export default defineEventHandler(async (event) => {
  if (getCookie(event, ANALYTICS_CONSENT_COOKIE_NAME) !== ANALYTICS_CONSENT_ACCEPTED) return { ok: true }
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
  await database.execute('INSERT INTO analytics_events (session_id, event_name, path, actor_type, metadata) VALUES (?, ?, ?, ?, ?)', [
    sessionId, name, path, actorType, JSON.stringify(storedMetadata),
  ])
  if (metadata?.falc === 'true' && FALC_USAGE_EVENTS.has(name)) {
    await recordFalcModeUsed(sessionId)
  }
  return { ok: true }
})
