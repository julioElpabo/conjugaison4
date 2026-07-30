import { d as defineEventHandler, x as getHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { a as analyticsSessionId, s as safeAnalyticsPath, b as analyticsDeviceCategory } from '../../../_/analytics-session.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const heartbeat_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const sessionId = analyticsSessionId(event);
  const path = safeAnalyticsPath(body == null ? void 0 : body.path);
  const locale = typeof (body == null ? void 0 : body.locale) === "string" && /^[a-z]{2}$/u.test(body.locale) ? body.locale : "fr";
  const device = analyticsDeviceCategory(getHeader(event, "user-agent") || "");
  const actorType = await getLearnerSession(event) ? "learner" : "anonymous";
  const pageView = (body == null ? void 0 : body.pageView) === true;
  const database = useDatabase();
  await database.execute(`INSERT INTO analytics_sessions
    (session_id, current_path, interface_locale, device_category, page_views)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      last_seen=CURRENT_TIMESTAMP,
      current_path=VALUES(current_path),
      interface_locale=VALUES(interface_locale),
      device_category=VALUES(device_category),
      page_views=page_views + VALUES(page_views)`, [sessionId, path, locale, device, pageView ? 1 : 0]);
  if (pageView) {
    await database.execute(`INSERT INTO analytics_events (session_id, event_name, path, metadata)
      VALUES (?, 'page_view', ?, ?)`, [sessionId, path, JSON.stringify({ actor: actorType })]);
  }
  return { ok: true };
});

export { heartbeat_post as default };
//# sourceMappingURL=heartbeat.post.mjs.map
