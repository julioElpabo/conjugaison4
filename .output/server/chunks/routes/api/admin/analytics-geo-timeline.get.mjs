import { d as defineEventHandler, a as getQuery, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { g as googleAnalyticsGeoTimeline } from '../../../_/google-analytics.mjs';
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

function validDate(value) {
  const date = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) return null;
  return date;
}
const analyticsGeoTimeline_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const date = validDate(getQuery(event).date);
  if (!date) throw createError({ statusCode: 400, statusMessage: "Choisissez une date valide." });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
  if (date > today) throw createError({ statusCode: 400, statusMessage: "La date choisie ne peut pas \xEAtre dans le futur." });
  const result = await googleAnalyticsGeoTimeline(date);
  return result || {
    date,
    configured: false,
    points: [],
    sessions: 0,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    notice: "Google Analytics n\u2019est pas configur\xE9 sur ce serveur."
  };
});

export { analyticsGeoTimeline_get as default };
//# sourceMappingURL=analytics-geo-timeline.get.mjs.map
