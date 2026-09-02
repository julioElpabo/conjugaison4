import { analyticsDeviceCategory, analyticsSessionId, safeAnalyticsPath } from '../../utils/analytics-session'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { getLearnerSession } from '../../utils/learner-session'
import { evaluateAdminPushAlerts } from '../../services/admin-push-notifications'
import { ANALYTICS_CONSENT_ACCEPTED, ANALYTICS_CONSENT_COOKIE_NAME } from '../../../shared/data/analytics-consent'

export default defineEventHandler(async (event) => {
  if (getCookie(event, ANALYTICS_CONSENT_COOKIE_NAME) !== ANALYTICS_CONSENT_ACCEPTED) return { ok: true }
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry)
  const body = await readLimitedJsonBody<{ path?: unknown, locale?: unknown, pageView?: unknown }>(event, 8 * 1024)
  const sessionId = analyticsSessionId(event)
  const path = safeAnalyticsPath(body?.path)
  const locale = typeof body?.locale === 'string' && /^[a-z]{2}$/u.test(body.locale) ? body.locale : 'fr'
  const device = analyticsDeviceCategory(getHeader(event, 'user-agent') || '')
  const actorType = await getLearnerSession(event) ? 'learner' : 'anonymous'
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
    await database.execute(`INSERT INTO analytics_events (session_id, event_name, path, actor_type, metadata)
      VALUES (?, 'page_view', ?, ?, ?)`, [sessionId, path, actorType, JSON.stringify({ actor: actorType })])
  }
  await evaluateAdminPushAlerts()
  return { ok: true }
})
