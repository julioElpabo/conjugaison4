import { d as defineEventHandler, a as getQuery, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { g as googleAnalyticsOverview } from '../../../_/google-analytics.mjs';
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

const windows = ["now", "3m", "5m", "30m", "range"];
function isoDate(value, fallback) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`)) ? text : fallback.toISOString().slice(0, 10);
}
const analyticsGa4_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const query = getQuery(event);
  const requestedWindow = String(query.window || "30m");
  const window = windows.includes(requestedWindow) ? requestedWindow : "30m";
  const today = /* @__PURE__ */ new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 6);
  const startDate = isoDate(query.start, defaultStart);
  const endDate = isoDate(query.end, today);
  if (startDate > endDate) throw createError({ statusCode: 400, statusMessage: "La date de d\xE9but doit pr\xE9c\xE9der la date de fin." });
  const ga4 = await googleAnalyticsOverview({ window, startDate, endDate });
  return { window, startDate, endDate, ga4 };
});

export { analyticsGa4_get as default };
//# sourceMappingURL=analytics-ga4.get.mjs.map
