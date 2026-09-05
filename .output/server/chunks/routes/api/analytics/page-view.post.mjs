import { d as defineEventHandler, x as getCookie, v as deleteCookie, F as getHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { s as safeAnalyticsPath } from '../../../_/analytics-session.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
import { A as ANALYTICS_CONSENT_ACCEPTED, a as ANALYTICS_CONSENT_COOKIE_NAME } from '../../../_/analytics-consent.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const pageView_post = defineEventHandler(async (event) => {
  const body = await readLimitedJsonBody(event, 2 * 1024);
  if (getCookie(event, ANALYTICS_CONSENT_COOKIE_NAME) !== ANALYTICS_CONSENT_ACCEPTED) {
    deleteCookie(event, "tatitotu_session", { path: "/" });
  }
  const path = safeAnalyticsPath(body == null ? void 0 : body.path);
  const userAgent = getHeader(event, "user-agent") || "";
  if (/\b(bot|crawler|spider|slurp|headlesschrome|lighthouse)\b/iu.test(userAgent)) return { ok: true };
  const database = useDatabase();
  await database.execute(`INSERT INTO analytics_page_views (bucket_start, path, page_views)
    VALUES (DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00'), ?, 1)
    ON DUPLICATE KEY UPDATE page_views=page_views + 1`, [path]);
  return { ok: true };
});

export { pageView_post as default };
//# sourceMappingURL=page-view.post.mjs.map
