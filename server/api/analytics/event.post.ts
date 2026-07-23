import { ANALYTICS_EVENTS, type AnalyticsEventName } from '../../../shared/types/analytics'
import { analyticsSessionId, safeAnalyticsMetadata, safeAnalyticsPath } from '../../utils/analytics-session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: unknown, path?: unknown, metadata?: unknown }>(event)
  const name = typeof body?.name === 'string' ? body.name as AnalyticsEventName : '' as AnalyticsEventName
  if (!ANALYTICS_EVENTS.includes(name)) throw createError({ statusCode: 400, statusMessage: 'Événement inconnu' })
  const sessionId = analyticsSessionId(event)
  const path = safeAnalyticsPath(body?.path)
  const metadata = safeAnalyticsMetadata(body?.metadata)
  const database = useDatabase()
  await database.execute(`INSERT INTO analytics_sessions (session_id, current_path)
    VALUES (?, ?) ON DUPLICATE KEY UPDATE last_seen=CURRENT_TIMESTAMP, current_path=VALUES(current_path)`, [sessionId, path])
  await database.execute('INSERT INTO analytics_events (session_id, event_name, path, metadata) VALUES (?, ?, ?, ?)', [
    sessionId, name, path, metadata ? JSON.stringify(metadata) : null,
  ])
  return { ok: true }
})
