import { m as useRuntimeConfig, d as defineEventHandler, i as getQuery, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

let tokenCache;
const reportCache = /* @__PURE__ */ new Map();
const quotaBackoff = /* @__PURE__ */ new Map();
const GOOGLE_AUTH_TIMEOUT_MS = 1e4;
const GOOGLE_REPORT_TIMEOUT_MS = 12e3;
function privateKeyFromEnvironment() {
  const parts = [];
  for (let index = 1; index <= 20; index += 1) {
    const value = process.env[`NUXT_GA4_PRIVATE_KEY_${index}`] || process.env[`GA4_PRIVATE_KEY_${index}`];
    if (!value) break;
    parts.push(value);
  }
  return parts.join("");
}
function base64url(value) {
  return Buffer.from(value).toString("base64url");
}
async function accessToken(email, privateKey) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 6e4) return tokenCache.value;
  const now = Math.floor(Date.now() / 1e3);
  const encodedHeader = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const encodedClaim = base64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  }));
  const unsigned = `${encodedHeader}.${encodedClaim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${base64url(signer.sign(privateKey.replace(/\\n/gu, "\n")))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(GOOGLE_AUTH_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`Authentification GA4 impossible (${response.status})`);
  const data = await response.json();
  tokenCache = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1e3 };
  return tokenCache.value;
}
function rows(response, dimensionCount = 1) {
  return (response.rows || []).map((row) => {
    var _a, _b, _c;
    return {
      label: ((_a = row.dimensionValues) == null ? void 0 : _a.slice(0, dimensionCount).map((item) => item.value || "\u2014").join(" \xB7 ")) || "\u2014",
      value: Number((_c = (_b = row.metricValues) == null ? void 0 : _b[0]) == null ? void 0 : _c.value) || 0
    };
  });
}
async function googleAnalyticsOverview(options) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const config = useRuntimeConfig();
  const propertyId = String(config.ga4PropertyId || "").trim();
  let email = String(config.ga4ClientEmail || "").trim();
  let privateKey = String(config.ga4PrivateKey || privateKeyFromEnvironment()).trim();
  const credentialsFile = String(config.ga4CredentialsFile || "").trim();
  if ((!email || !privateKey) && credentialsFile) {
    try {
      const credentials = JSON.parse(await readFile(credentialsFile, "utf8"));
      email = typeof credentials.client_email === "string" ? credentials.client_email.trim() : "";
      privateKey = typeof credentials.private_key === "string" ? credentials.private_key.trim() : "";
    } catch (error) {
      console.error("[analytics] Impossible de lire le fichier du compte de service GA4.", error);
    }
  }
  if (!propertyId || !email || !privateKey) return null;
  const cacheKey = `geo-v7:${propertyId}:${options.window}:${options.startDate}:${options.endDate}`;
  const cached = reportCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const realtime = options.window !== "range";
  const quotaKey = `${propertyId}:${realtime ? "realtime" : "core"}`;
  if ((quotaBackoff.get(quotaKey) || 0) > Date.now()) {
    throw new Error("Lecture GA4 impossible (429) : quota horaire temporairement atteint.");
  }
  const token = await accessToken(email, privateKey);
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${realtime ? "runRealtimeReport" : "runReport"}`;
  const range = realtime ? { minuteRanges: [{ name: options.window, startMinutesAgo: options.window === "now" ? 0 : options.window === "3m" ? 2 : options.window === "5m" ? 4 : 29, endMinutesAgo: 0 }] } : { dateRanges: [{ startDate: options.startDate, endDate: options.endDate }] };
  const request = async (dimensions, metrics, limit = 10) => {
    var _a2;
    const body = JSON.stringify({ ...range, dimensions: dimensions.map((name) => ({ name })), metrics: metrics.map((name) => ({ name })), limit, orderBys: [{ metric: { metricName: metrics[0] }, desc: true }] });
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body,
          signal: AbortSignal.timeout(GOOGLE_REPORT_TIMEOUT_MS)
        });
        if (response.ok) return response.json();
        const payload = await response.json().catch(() => null);
        if (response.status === 429) quotaBackoff.set(quotaKey, Date.now() + 15 * 6e4);
        const error = new Error(`Lecture GA4 impossible (${response.status})${((_a2 = payload == null ? void 0 : payload.error) == null ? void 0 : _a2.message) ? ` : ${payload.error.message}` : ""}`);
        error.retryable = response.status >= 500;
        throw error;
      } catch (error) {
        if (attempt === 0 && error.retryable !== false) continue;
        throw error;
      }
    }
    throw new Error("Lecture GA4 impossible apr\xE8s deux tentatives.");
  };
  const optionalRequest = async (label, dimensions, metrics, limit = 10) => {
    try {
      return await request(dimensions, metrics, limit);
    } catch (error) {
      console.warn(`[analytics] Sous-rapport GA4 \xAB ${label} \xBB indisponible.`, error);
      return { rows: [] };
    }
  };
  const summaryMetrics = realtime ? ["activeUsers", "eventCount"] : ["activeUsers", "totalUsers", "sessions", "newUsers", "eventCount"];
  let summary;
  try {
    summary = await request([], summaryMetrics, 1);
  } catch (error) {
    if (cached) {
      return {
        ...cached.value,
        notice: "GA4 a atteint temporairement son quota. Les derni\xE8res donn\xE9es disponibles sont conserv\xE9es."
      };
    }
    throw error;
  }
  const [devices, languages, countries, regions, cities, cityRegions, events, activity, audienceTrend] = await Promise.all([
    optionalRequest("appareils", ["deviceCategory"], ["activeUsers"]),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("langues", ["language"], ["activeUsers"]),
    optionalRequest("pays", ["countryId", "country"], ["activeUsers"], 250),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("r\xE9gions", ["region", "country"], ["activeUsers"], 5e3),
    realtime ? optionalRequest("villes", ["cityId", "city", "countryId", "country"], ["activeUsers"], 1e3) : optionalRequest("villes", ["cityId", "city", "region", "countryId", "country"], ["activeUsers"], 1e4),
    realtime ? optionalRequest("r\xE9gions des villes", ["cityId", "region", "countryId", "country"], ["activeUsers"], 1e3) : Promise.resolve({ rows: [] }),
    Promise.resolve({ rows: [] }),
    optionalRequest("activit\xE9", [realtime ? "minutesAgo" : "date"], [realtime ? "activeUsers" : "sessions"], realtime ? 30 : 400),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("progression de l\u2019audience", ["date"], ["activeUsers", "sessions", "newUsers"], 400)
  ]);
  const summaryValues = ((_b = (_a = summary.rows) == null ? void 0 : _a[0]) == null ? void 0 : _b.metricValues) || [];
  const metric = (index) => {
    var _a2;
    return Number((_a2 = summaryValues[index]) == null ? void 0 : _a2.value) || 0;
  };
  const activityRows = (activity.rows || []).map((row) => {
    var _a2, _b2, _c2, _d2;
    return {
      date: ((_b2 = (_a2 = row.dimensionValues) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.value) || "",
      value: Number((_d2 = (_c2 = row.metricValues) == null ? void 0 : _c2[0]) == null ? void 0 : _d2.value) || 0
    };
  }).reverse();
  const eventRows = rows(events);
  const realtimeRegionsByCity = new Map((cityRegions.rows || []).map((row) => {
    var _a2, _b2, _c2, _d2;
    return [
      ((_b2 = (_a2 = row.dimensionValues) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.value) || "",
      (_d2 = (_c2 = row.dimensionValues) == null ? void 0 : _c2[1]) == null ? void 0 : _d2.value
    ];
  }));
  const eventValue = (name) => {
    var _a2;
    return ((_a2 = eventRows.find((item) => item.label === name)) == null ? void 0 : _a2.value) || 0;
  };
  const submittedAnswers = eventValue("answer_submitted");
  const correctAnswers = eventValue("answer_correct");
  const exerciseStarted = eventValue("exercise_started");
  const exerciseCompleted = eventValue("exercise_completed");
  const countryRows = (countries.rows || []).map((row) => {
    var _a2, _b2, _c2, _d2, _e2, _f2;
    return {
      code: ((_b2 = (_a2 = row.dimensionValues) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.value) || "",
      label: ((_d2 = (_c2 = row.dimensionValues) == null ? void 0 : _c2[1]) == null ? void 0 : _d2.value) || "\u2014",
      value: Number((_f2 = (_e2 = row.metricValues) == null ? void 0 : _e2[0]) == null ? void 0 : _f2.value) || 0
    };
  });
  const audienceSeries = {
    activeUsers: [],
    sessions: [],
    newUsers: []
  };
  for (const row of [...audienceTrend.rows || []].reverse()) {
    const date = ((_d = (_c = row.dimensionValues) == null ? void 0 : _c[0]) == null ? void 0 : _d.value) || "";
    audienceSeries.activeUsers.push({ date, value: Number((_f = (_e = row.metricValues) == null ? void 0 : _e[0]) == null ? void 0 : _f.value) || 0 });
    audienceSeries.sessions.push({ date, value: Number((_h = (_g = row.metricValues) == null ? void 0 : _g[1]) == null ? void 0 : _h.value) || 0 });
    audienceSeries.newUsers.push({ date, value: Number((_j = (_i = row.metricValues) == null ? void 0 : _i[2]) == null ? void 0 : _j.value) || 0 });
  }
  const result = {
    source: "ga4",
    configured: true,
    activeUsers: metric(0),
    sessions: realtime ? metric(0) : metric(2),
    newUsers: realtime ? 0 : metric(3),
    returningUsers: realtime ? 0 : Math.max(0, metric(1) - metric(3)),
    events: realtime ? metric(1) : metric(4),
    exerciseStarted,
    exerciseCompleted,
    completionRate: exerciseStarted ? Math.round(exerciseCompleted / exerciseStarted * 1e3) / 10 : 0,
    correctAnswers,
    submittedAnswers,
    successRate: submittedAnswers ? Math.round(correctAnswers / submittedAnswers * 1e3) / 10 : 0,
    helpOpened: eventValue("help_opened"),
    pdfDownloads: eventValue("pdf_downloaded"),
    wordDownloads: eventValue("word_downloaded"),
    challengeLoads: eventValue("challenge_load"),
    challengeSaves: eventValue("challenge_save"),
    devices: rows(devices),
    languages: rows(languages),
    countries: countryRows,
    regions: rows(regions, 2).map((item) => {
      const [label, country] = item.label.split(" \xB7 ");
      return { label: label || "\u2014", country, value: item.value };
    }),
    cities: (cities.rows || []).map((row) => {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k, _l, _m, _n;
      return {
        cityId: (_b2 = (_a2 = row.dimensionValues) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.value,
        label: ((_d2 = (_c2 = row.dimensionValues) == null ? void 0 : _c2[1]) == null ? void 0 : _d2.value) || "\u2014",
        region: realtime ? realtimeRegionsByCity.get(((_f2 = (_e2 = row.dimensionValues) == null ? void 0 : _e2[0]) == null ? void 0 : _f2.value) || "") : (_h2 = (_g2 = row.dimensionValues) == null ? void 0 : _g2[2]) == null ? void 0 : _h2.value,
        countryCode: (_j2 = (_i2 = row.dimensionValues) == null ? void 0 : _i2[realtime ? 2 : 3]) == null ? void 0 : _j2.value,
        country: (_l = (_k = row.dimensionValues) == null ? void 0 : _k[realtime ? 3 : 4]) == null ? void 0 : _l.value,
        value: Number((_n = (_m = row.metricValues) == null ? void 0 : _m[0]) == null ? void 0 : _n.value) || 0
      };
    }),
    featureUsage: [],
    eventBreakdown: eventRows,
    activity: activityRows,
    series: audienceSeries,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  reportCache.set(cacheKey, { value: result, expiresAt: Date.now() + (realtime ? 5 * 6e4 : 30 * 6e4) });
  return result;
}

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
    helpOpened: 0,
    pdfDownloads: 0,
    wordDownloads: 0,
    challengeLoads: 0,
    challengeSaves: 0,
    devices: [],
    languages: [],
    countries: [],
    regions: [],
    cities: [],
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
  const activityFormat = window !== "range" ? "%Y-%m-%d %H:%i:00" : rangeDays <= 2 ? "%Y-%m-%d %H:00:00" : "%Y-%m-%d";
  const database = useDatabase();
  let local = emptyOverview();
  try {
    const [[summary], [eventRows], [devices], [languages], [activity], [eventSeries], [sessionSeries], [featureUsageRows]] = await Promise.all([
      database.execute(`SELECT COUNT(*) AS sessions FROM analytics_sessions WHERE ${sessionWhere}`, sessionParams),
      database.execute(`SELECT event_name, COUNT(*) AS value FROM analytics_events WHERE ${eventWhere} GROUP BY event_name ORDER BY value DESC`, eventParams),
      database.execute(`SELECT device_category AS label, COUNT(*) AS value FROM analytics_sessions WHERE ${sessionWhere} GROUP BY device_category ORDER BY value DESC`, sessionParams),
      database.execute(`SELECT interface_locale AS label, COUNT(*) AS value FROM analytics_sessions WHERE ${sessionWhere} GROUP BY interface_locale ORDER BY value DESC`, sessionParams),
      database.execute(`SELECT DATE_FORMAT(created_at, '${activityFormat}') AS label, COUNT(*) AS value FROM analytics_events WHERE ${eventWhere} GROUP BY label ORDER BY label`, eventParams),
      window === "range" ? database.execute(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, event_name, COUNT(*) AS value
          FROM analytics_events WHERE ${eventWhere} GROUP BY date,event_name ORDER BY date`, eventParams) : Promise.resolve([[], []]),
      window === "range" ? database.execute(`SELECT DATE_FORMAT(first_seen, '%Y-%m-%d') AS date, COUNT(*) AS value
          FROM analytics_sessions WHERE ${sessionWhere} GROUP BY date ORDER BY date`, sessionParams) : Promise.resolve([[], []]),
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
      helpOpened: count("help_opened"),
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
      const [legacyRows] = await database.execute(`SELECT DATE_FORMAT(created, '%Y-%m-%d') AS date,
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
      if (legacyRows.length) {
        local.notice = "Les totaux historiques incluent les anciens compteurs. Les d\xE9tails fins commencent \xE0 partir de la mise en service de ce tableau de bord.";
      }
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
