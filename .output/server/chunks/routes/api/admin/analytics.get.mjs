import { d as defineEventHandler, a as getQuery, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { a as googleAnalyticsOverview } from '../../../_/google-analytics.mjs';
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

const windows = ["now", "3m", "5m", "30m", "range"];
function isoDate(value, fallback) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`)) ? text : fallback.toISOString().slice(0, 10);
}
function breakdown(rows) {
  return rows.map((row) => ({ label: String(row.label || "\u2014"), value: Number(row.value) || 0 }));
}
function emptyOverview(notice) {
  return {
    source: "local",
    configured: true,
    activeUsers: 0,
    sessions: 0,
    newUsers: 0,
    returningUsers: 0,
    events: 0,
    exerciseStarted: 0,
    exerciseCompleted: 0,
    completionRate: 0,
    correctAnswers: 0,
    submittedAnswers: 0,
    successRate: 0,
    helpScrolled: 0,
    pdfDownloads: 0,
    wordDownloads: 0,
    challengeLoads: 0,
    challengeSaves: 0,
    devices: [],
    languages: [],
    countries: [],
    regions: [],
    cities: [],
    acquisition: [],
    landingPages: [],
    browsers: [],
    operatingSystems: [],
    featureUsage: [],
    eventBreakdown: [],
    activity: [],
    series: {},
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    notice
  };
}
const analytics_get = defineEventHandler(async (event) => {
  var _a;
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
  const liveMinutes = window === "now" ? 1 : window === "3m" ? 3 : window === "5m" ? 5 : 30;
  const eventWhere = window === "range" ? "created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)" : "created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)";
  const sessionWhere = window === "range" ? "first_seen >= ? AND first_seen < DATE_ADD(?, INTERVAL 1 DAY)" : "last_seen >= DATE_SUB(NOW(), INTERVAL ? MINUTE)";
  const eventParams = window === "range" ? [startDate, endDate] : [liveMinutes];
  const sessionParams = window === "range" ? [startDate, endDate] : [liveMinutes];
  const rangeDays = Math.max(1, Math.ceil((Date.parse(`${endDate}T12:00:00Z`) - Date.parse(`${startDate}T12:00:00Z`)) / 864e5) + 1);
  const seriesFormat = window !== "range" ? "%Y-%m-%d %H:%i:00" : rangeDays <= 2 ? "%Y-%m-%d %H:00:00" : "%Y-%m-%d";
  const database = useDatabase();
  let local = emptyOverview();
  try {
    const [[summary], [eventRows], [devices], [languages], [activity], [eventSeries], [sessionSeries], [presentationSeries], [languageSeries], [featureUsageRows]] = await Promise.all([
      database.execute(`SELECT COUNT(*) AS sessions FROM analytics_sessions WHERE ${sessionWhere}`, sessionParams),
      database.execute(`SELECT event_name, COUNT(*) AS value FROM analytics_events WHERE ${eventWhere} GROUP BY event_name ORDER BY value DESC`, eventParams),
      database.execute(`SELECT device_category AS label, COUNT(*) AS value FROM analytics_sessions WHERE ${sessionWhere} GROUP BY device_category ORDER BY value DESC`, sessionParams),
      database.execute(`SELECT interface_locale AS label, COUNT(*) AS value FROM analytics_sessions WHERE ${sessionWhere} GROUP BY interface_locale ORDER BY value DESC`, sessionParams),
      database.execute(`SELECT DATE_FORMAT(created_at, '${seriesFormat}') AS label, COUNT(*) AS value FROM analytics_events WHERE ${eventWhere} GROUP BY label ORDER BY label`, eventParams),
      database.execute(`SELECT DATE_FORMAT(created_at, '${seriesFormat}') AS date, event_name, COUNT(*) AS value
        FROM analytics_events WHERE ${eventWhere} GROUP BY date,event_name ORDER BY date`, eventParams),
      database.execute(`SELECT DATE_FORMAT(${window === "range" ? "first_seen" : "last_seen"}, '${seriesFormat}') AS date, COUNT(*) AS value
        FROM analytics_sessions WHERE ${sessionWhere} GROUP BY date ORDER BY date`, sessionParams),
      database.execute(`SELECT DATE_FORMAT(created_at, '${seriesFormat}') AS date,
        JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation')) AS presentation, COUNT(*) AS value
        FROM analytics_events WHERE ${eventWhere} AND event_name='exercise_started'
          AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation')) IN ('classic','chat')
        GROUP BY date,presentation ORDER BY date`, eventParams),
      database.execute(`SELECT DATE_FORMAT(created_at, '${seriesFormat}') AS date,
        event_name, JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.locale')) AS locale, COUNT(*) AS value
        FROM analytics_events WHERE ${eventWhere} AND event_name IN ('language_tested','language_used')
          AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.locale')) IN ('fr','de','en','it','es')
        GROUP BY date,event_name,locale ORDER BY date`, eventParams),
      database.execute(`SELECT
        SUM(CASE WHEN event_name='exercise_started' AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation'))='classic' THEN 1 ELSE 0 END) AS classic,
        SUM(CASE WHEN event_name='exercise_started' AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation'))='chat' THEN 1 ELSE 0 END) AS chat,
        SUM(CASE WHEN event_name='print_opened' THEN 1 ELSE 0 END) AS print
        FROM analytics_events WHERE ${eventWhere}`, eventParams)
    ]);
    const eventMap = Object.fromEntries(eventRows.map((row) => [row.event_name, Number(row.value) || 0]));
    const count = (name) => eventMap[name] || 0;
    const sessions = Number((_a = summary == null ? void 0 : summary[0]) == null ? void 0 : _a.sessions) || 0;
    const started = count("exercise_started");
    const completed = count("exercise_completed");
    const submitted = count("answer_submitted");
    const correct = count("answer_correct");
    const series = eventSeries.reduce((result, row) => {
      const name = String(row.event_name);
      (result[name] || (result[name] = [])).push({ date: String(row.date), value: Number(row.value) || 0 });
      return result;
    }, {});
    series.sessions = sessionSeries.map((row) => ({ date: String(row.date), value: Number(row.value) || 0 }));
    for (const row of presentationSeries) {
      const name = `exercise_started.${String(row.presentation)}`;
      (series[name] || (series[name] = [])).push({ date: String(row.date), value: Number(row.value) || 0 });
    }
    for (const row of languageSeries) {
      const name = `${String(row.event_name)}.${String(row.locale)}`;
      (series[name] || (series[name] = [])).push({ date: String(row.date), value: Number(row.value) || 0 });
    }
    const featureUsage = featureUsageRows[0];
    local = {
      ...emptyOverview(),
      source: "local",
      configured: true,
      activeUsers: sessions,
      sessions,
      newUsers: window === "range" ? sessions : 0,
      returningUsers: 0,
      events: eventRows.reduce((sum, row) => sum + (Number(row.value) || 0), 0),
      exerciseStarted: started,
      exerciseCompleted: completed,
      completionRate: started ? Math.round(completed / started * 1e3) / 10 : 0,
      correctAnswers: correct,
      submittedAnswers: submitted,
      successRate: submitted ? Math.round(correct / submitted * 1e3) / 10 : 0,
      helpScrolled: count("help_scrolled"),
      pdfDownloads: count("pdf_downloaded"),
      wordDownloads: count("word_downloaded"),
      challengeLoads: count("challenge_load"),
      challengeSaves: count("challenge_save"),
      devices: breakdown(devices),
      languages: breakdown(languages),
      countries: [],
      regions: [],
      cities: [],
      featureUsage: [
        { label: "Exercice classique", value: Number(featureUsage == null ? void 0 : featureUsage.classic) || 0 },
        { label: "Chat avec coach", value: Number(featureUsage == null ? void 0 : featureUsage.chat) || 0 },
        { label: "Impression", value: Number(featureUsage == null ? void 0 : featureUsage.print) || 0 }
      ],
      eventBreakdown: eventRows.map((row) => ({ label: row.event_name, value: Number(row.value) || 0 })),
      activity: activity.map((row) => ({ date: String(row.label), value: Number(row.value) || 0 })),
      series,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (window === "range") {
      const [legacyRows] = await database.execute(`SELECT DATE_FORMAT(created, '${seriesFormat}') AS date,
        COALESCE(SUM(creationpdf),0) creationpdf, COALESCE(SUM(sauvedefi),0) sauvedefi,
        COALESCE(SUM(chargedefi),0) chargedefi, COALESCE(SUM(exercer),0) exercer,
        COALESCE(SUM(exercersimple),0) exercersimple, COALESCE(SUM(resultat),0) resultat,
        COALESCE(SUM(resultatsimple),0) resultatsimple
        FROM logs WHERE created >= ? AND created < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY date ORDER BY date`, [startDate, endDate]);
      const addSeriesValue = (name, date, value) => {
        var _a2;
        if (!value) return;
        const points = (_a2 = local.series)[name] || (_a2[name] = []);
        const existing = points.find((point) => point.date === date);
        if (existing) existing.value += value;
        else points.push({ date, value });
        points.sort((left, right) => left.date.localeCompare(right.date));
      };
      let legacyPrints = 0;
      for (const legacy of legacyRows) {
        const date = String(legacy.date || "");
        const saves = Number(legacy.sauvedefi) || 0;
        const loads = Number(legacy.chargedefi) || 0;
        const started2 = (Number(legacy.exercer) || 0) + (Number(legacy.exercersimple) || 0);
        const completed2 = (Number(legacy.resultat) || 0) + (Number(legacy.resultatsimple) || 0);
        const prints = Number(legacy.creationpdf) || 0;
        local.challengeSaves += saves;
        local.challengeLoads += loads;
        local.exerciseStarted += started2;
        local.exerciseCompleted += completed2;
        legacyPrints += prints;
        const classicUsage = local.featureUsage.find((item) => item.label === "Exercice classique");
        const printUsage = local.featureUsage.find((item) => item.label === "Impression");
        if (classicUsage) classicUsage.value += started2;
        if (printUsage) printUsage.value += prints;
        addSeriesValue("challenge_save", date, saves);
        addSeriesValue("challenge_load", date, loads);
        addSeriesValue("exercise_started", date, started2);
        addSeriesValue("exercise_completed", date, completed2);
        addSeriesValue("print_opened", date, prints);
      }
      local.completionRate = local.exerciseStarted ? Math.round(local.exerciseCompleted / local.exerciseStarted * 1e3) / 10 : 0;
      if (legacyPrints) local.eventBreakdown.push({ label: "legacy_print_opened", value: legacyPrints });
    }
  } catch (error) {
    console.error("[analytics] Lecture des statistiques locales impossible.", error);
    local = emptyOverview("Les nouvelles tables statistiques ne sont pas encore disponibles.");
  }
  let ga4 = null;
  try {
    ga4 = await googleAnalyticsOverview({ window, startDate, endDate });
  } catch (error) {
    console.error("[analytics] Lecture GA4 impossible.", error);
    const rawDetail = error instanceof Error ? error.message.replace(/\s+/gu, " ") : "";
    const detail = rawDetail.includes("(429)") ? "Le quota horaire GA4 est temporairement atteint. Les statistiques locales restent disponibles et GA4 reprendra automatiquement dans moins d\u2019une heure." : rawDetail.slice(0, 180);
    ga4 = {
      ...emptyOverview(`Connexion GA4 indisponible.${detail ? ` ${detail}` : " V\xE9rifiez les variables serveur et l\u2019acc\xE8s de la propri\xE9t\xE9."}`),
      source: "ga4",
      configured: true
    };
  }
  return { window, startDate, endDate, local, ga4 };
});

export { analytics_get as default };
//# sourceMappingURL=analytics.get.mjs.map
