import { d as defineEventHandler, x as getCookie, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { a as analyticsSessionId, s as safeAnalyticsPath, c as safeAnalyticsMetadata } from '../../../_/analytics-session.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
import { b as recordFalcModeUsed } from '../../../_/admin-push-notifications.mjs';
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
import '../../../_/google-analytics.mjs';
import '../../../_/daily-sessions.mjs';

const ANALYTICS_EVENTS = [
  "page_view",
  "homepage",
  "challenge_preset_selected",
  "challenge_load",
  "challenge_save",
  "exercise_started",
  "exercise_completed",
  "answer_submitted",
  "answer_correct",
  "answer_retry",
  "help_opened",
  "help_scrolled",
  "coach_selected",
  "print_opened",
  "pdf_downloaded",
  "word_downloaded",
  "feature_exposed",
  "feature_selected",
  "feature_completed",
  "feature_failed",
  "exercise_abandoned",
  "account_registered",
  "account_login",
  "language_tested",
  "language_used",
  "tour_started",
  "tour_step",
  "tour_completed",
  "tour_abandoned",
  "chat_conjugation_opened",
  "browser_printed",
  "client_error"
];

const FALC_USAGE_EVENTS = /* @__PURE__ */ new Set([
  "challenge_preset_selected",
  "challenge_load",
  "challenge_save",
  "exercise_started",
  "help_opened",
  "print_opened",
  "pdf_downloaded",
  "word_downloaded"
]);
const event_post = defineEventHandler(async (event) => {
  if (getCookie(event, ANALYTICS_CONSENT_COOKIE_NAME) !== ANALYTICS_CONSENT_ACCEPTED) return { ok: true };
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const name = typeof (body == null ? void 0 : body.name) === "string" ? body.name : "";
  if (!ANALYTICS_EVENTS.includes(name)) throw createError({ statusCode: 400, statusMessage: "\xC9v\xE9nement inconnu" });
  const sessionId = analyticsSessionId(event);
  const path = safeAnalyticsPath(body == null ? void 0 : body.path);
  const metadata = safeAnalyticsMetadata(body == null ? void 0 : body.metadata);
  const actorType = await getLearnerSession(event) ? "learner" : "anonymous";
  const storedMetadata = { ...metadata || {}, actor: actorType };
  const database = useDatabase();
  await database.execute(`INSERT INTO analytics_sessions (session_id, current_path)
    VALUES (?, ?) ON DUPLICATE KEY UPDATE last_seen=CURRENT_TIMESTAMP,
      current_path=VALUES(current_path)`, [sessionId, path]);
  await database.execute("INSERT INTO analytics_events (session_id, event_name, path, actor_type, metadata) VALUES (?, ?, ?, ?, ?)", [
    sessionId,
    name,
    path,
    actorType,
    JSON.stringify(storedMetadata)
  ]);
  if ((metadata == null ? void 0 : metadata.falc) === "true" && FALC_USAGE_EVENTS.has(name)) {
    await recordFalcModeUsed(sessionId);
  }
  return { ok: true };
});

export { event_post as default };
//# sourceMappingURL=event.post.mjs.map
