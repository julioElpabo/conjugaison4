import { b as googleAnalyticsTodaySessions } from './google-analytics.mjs';

async function localDailySessionSnapshot(database) {
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
async function dailySessionSnapshot(database) {
  try {
    const ga4 = await googleAnalyticsTodaySessions();
    if (ga4) return { ...ga4, source: "ga4" };
  } catch (error) {
    console.warn("[analytics] Compteur GA4 du jour indisponible, utilisation du compteur local.", error);
  }
  return {
    ...await localDailySessionSnapshot(database),
    notice: "GA4 est momentan\xE9ment indisponible : compteur local affich\xE9."
  };
}

export { dailySessionSnapshot as d };
//# sourceMappingURL=daily-sessions.mjs.map
