import { analyticsDeviceCategory, analyticsSessionId, safeAnalyticsPath } from '../../utils/analytics-session'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry)
  const body = await readLimitedJsonBody<{ path?: unknown, locale?: unknown, pageView?: unknown }>(event, 8 * 1024)
  const sessionId = analyticsSessionId(event)
  const path = safeAnalyticsPath(body?.path)
  const locale = typeof body?.locale === 'string' && /^[a-z]{2}$/u.test(body.locale) ? body.locale : 'fr'
  const device = analyticsDeviceCategory(getHeader(event, 'user-agent') || '')
  const pageView = body?.pageView === true
  const database = useDatabase()

  await database.execute(`INSERT INTO analytics_sessions
    (session_id, current_path, interface_locale, device_category, page_views)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      last_seen=CURRENT_TIMESTAMP,
      current_path=VALUES(current_path),
      interface_locale=VALUES(interface_locale),
      device_category=VALUES(device_category),
      page_views=page_views + VALUES(page_views)`, [sessionId, path, locale, device, pageView ? 1 : 0])

  if (pageView) {
    await database.execute(`INSERT INTO analytics_events (session_id, event_name, path)
      VALUES (?, 'page_view', ?)`, [sessionId, path])
  }
  return { ok: true }
})
