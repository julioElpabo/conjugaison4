import { d as defineEventHandler, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { d as googleAnalyticsTodayUsers } from '../../../_/google-analytics.mjs';
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

async function localDailyVisitorEstimate(database) {
  const [[row]] = await database.query(`
    SELECT COUNT(*) AS value, DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS date
    FROM analytics_sessions
    WHERE first_seen >= CURRENT_DATE AND first_seen < CURRENT_DATE + INTERVAL 1 DAY
  `);
  return {
    count: Number(row == null ? void 0 : row.value) || 0,
    date: String((row == null ? void 0 : row.date) || ""),
    source: "local"
  };
}
async function dailyVisitorSnapshot(database) {
  try {
    const ga4 = await googleAnalyticsTodayUsers();
    if (ga4) return { ...ga4, source: "ga4" };
  } catch (error) {
    console.warn("[analytics] Compteur GA4 des visiteurs du jour indisponible, utilisation de l\u2019estimation locale.", error);
  }
  return {
    ...await localDailyVisitorEstimate(database),
    notice: "GA4 est momentan\xE9ment indisponible : estimation locale affich\xE9e."
  };
}

const dailyVisitors_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return dailyVisitorSnapshot(useDatabase());
});

export { dailyVisitors_get as default };
//# sourceMappingURL=daily-visitors.get.mjs.map
