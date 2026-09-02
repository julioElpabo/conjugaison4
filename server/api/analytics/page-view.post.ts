import { safeAnalyticsPath } from '../../utils/analytics-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { ANALYTICS_CONSENT_ACCEPTED, ANALYTICS_CONSENT_COOKIE_NAME } from '../../../shared/data/analytics-consent'

export default defineEventHandler(async (event) => {
  const body = await readLimitedJsonBody<{ path?: unknown }>(event, 2 * 1024)
  if (getCookie(event, ANALYTICS_CONSENT_COOKIE_NAME) !== ANALYTICS_CONSENT_ACCEPTED) {
    deleteCookie(event, 'tatitotu_session', { path: '/' })
  }
  const path = safeAnalyticsPath(body?.path)
  const userAgent = getHeader(event, 'user-agent') || ''
  if (/\b(bot|crawler|spider|slurp|headlesschrome|lighthouse)\b/iu.test(userAgent)) return { ok: true }

  const database = useDatabase()
  await database.execute(`INSERT INTO analytics_page_views (bucket_start, path, page_views)
    VALUES (DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00'), ?, 1)
    ON DUPLICATE KEY UPDATE page_views=page_views + 1`, [path])
  return { ok: true }
})
