import { x as useRuntimeConfig } from '../nitro/nitro.mjs';
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';

let tokenCache;
const reportCache = /* @__PURE__ */ new Map();
const timelineCache = /* @__PURE__ */ new Map();
let realtimeCountryCache;
let todaySessionsCache;
let todayUsersCache;
const quotaBackoff = /* @__PURE__ */ new Map();
const GOOGLE_AUTH_TIMEOUT_MS = 1e4;
const GOOGLE_REPORT_TIMEOUT_MS = 12e3;
function currentZurichDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).format(/* @__PURE__ */ new Date());
}
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
async function googleAnalyticsCredentials() {
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
  return propertyId && email && privateKey ? { propertyId, email, privateKey } : null;
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
  const credentials = await googleAnalyticsCredentials();
  if (!credentials) return null;
  const { propertyId, email, privateKey } = credentials;
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
  const [devices, languages, countries, regions, cities, cityRegions, events, activity, audienceTrend, acquisition, landingPages, browsers, operatingSystems] = await Promise.all([
    optionalRequest("appareils", ["deviceCategory"], ["activeUsers"]),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("langues", ["language"], ["activeUsers"]),
    optionalRequest("pays", ["countryId", "country"], ["activeUsers"], 250),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("r\xE9gions", ["region", "country"], ["activeUsers"], 5e3),
    realtime ? optionalRequest("villes", ["cityId", "city", "countryId", "country"], ["activeUsers"], 1e3) : optionalRequest("villes", ["cityId", "city", "region", "countryId", "country"], ["activeUsers"], 1e4),
    realtime ? optionalRequest("r\xE9gions des villes", ["cityId", "region", "countryId", "country"], ["activeUsers"], 1e3) : Promise.resolve({ rows: [] }),
    Promise.resolve({ rows: [] }),
    optionalRequest("activit\xE9", [realtime ? "minutesAgo" : "date"], [realtime ? "activeUsers" : "sessions"], realtime ? 30 : 400),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("progression de l\u2019audience", ["date"], ["activeUsers", "sessions", "newUsers"], 400),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("acquisition", ["sessionSourceMedium"], ["sessions"], 20),
    realtime ? Promise.resolve({ rows: [] }) : optionalRequest("pages d\u2019entr\xE9e", ["landingPagePlusQueryString"], ["sessions"], 20),
    optionalRequest("navigateurs", ["browser"], ["activeUsers"], 10),
    optionalRequest("syst\xE8mes", ["operatingSystem"], ["activeUsers"], 10)
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
    pageViews: 0,
    sessions: realtime ? metric(0) : metric(2),
    connectedAccounts: 0,
    newUsers: realtime ? 0 : metric(3),
    returningUsers: realtime ? 0 : Math.max(0, metric(1) - metric(3)),
    events: realtime ? metric(1) : metric(4),
    exerciseStarted,
    exerciseCompleted,
    completionRate: exerciseStarted ? Math.round(exerciseCompleted / exerciseStarted * 1e3) / 10 : 0,
    correctAnswers,
    submittedAnswers,
    successRate: submittedAnswers ? Math.round(correctAnswers / submittedAnswers * 1e3) / 10 : 0,
    helpScrolled: eventValue("help_scrolled"),
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
    acquisition: rows(acquisition),
    landingPages: rows(landingPages),
    browsers: rows(browsers),
    operatingSystems: rows(operatingSystems),
    featureUsage: [],
    eventBreakdown: eventRows,
    activity: activityRows,
    series: audienceSeries,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  reportCache.set(cacheKey, { value: result, expiresAt: Date.now() + (realtime ? 5 * 6e4 : 30 * 6e4) });
  return result;
}
async function googleAnalyticsRealtimeCountries() {
  const credentials = await googleAnalyticsCredentials();
  if (!credentials) return null;
  if (realtimeCountryCache && realtimeCountryCache.expiresAt > Date.now()) return realtimeCountryCache.value;
  const { propertyId, email, privateKey } = credentials;
  const quotaKey = `${propertyId}:realtime-countries`;
  if ((quotaBackoff.get(quotaKey) || 0) > Date.now()) return (realtimeCountryCache == null ? void 0 : realtimeCountryCache.value) || [];
  const token = await accessToken(email, privateKey);
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      minuteRanges: [{ name: "active-30m", startMinutesAgo: 29, endMinutesAgo: 0 }],
      dimensions: [{ name: "countryId" }, { name: "country" }],
      metrics: [{ name: "activeUsers" }],
      limit: 250,
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }]
    }),
    signal: AbortSignal.timeout(GOOGLE_REPORT_TIMEOUT_MS)
  });
  if (!response.ok) {
    if (response.status === 429) quotaBackoff.set(quotaKey, Date.now() + 15 * 6e4);
    throw new Error(`Lecture GA4 des pays impossible (${response.status})`);
  }
  const report = await response.json();
  const value = (report.rows || []).map((row) => {
    var _a, _b, _c, _d, _e, _f;
    return {
      code: (((_b = (_a = row.dimensionValues) == null ? void 0 : _a[0]) == null ? void 0 : _b.value) || "").toUpperCase(),
      label: ((_d = (_c = row.dimensionValues) == null ? void 0 : _c[1]) == null ? void 0 : _d.value) || "\u2014",
      value: Number((_f = (_e = row.metricValues) == null ? void 0 : _e[0]) == null ? void 0 : _f.value) || 0
    };
  });
  realtimeCountryCache = { value, expiresAt: Date.now() + 5 * 6e4 };
  return value;
}
async function googleAnalyticsTodaySessions() {
  var _a, _b, _c, _d, _e;
  const credentials = await googleAnalyticsCredentials();
  if (!credentials) return null;
  const date = currentZurichDate();
  if ((todaySessionsCache == null ? void 0 : todaySessionsCache.date) === date && todaySessionsCache.expiresAt > Date.now()) {
    return { count: todaySessionsCache.value, date };
  }
  const { propertyId, email, privateKey } = credentials;
  const quotaKey = `${propertyId}:today-sessions`;
  if ((quotaBackoff.get(quotaKey) || 0) > Date.now()) {
    return todaySessionsCache ? { count: todaySessionsCache.value, date: todaySessionsCache.date } : null;
  }
  const token = await accessToken(email, privateKey);
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: date, endDate: date }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "session_start", caseSensitive: true }
        }
      },
      limit: 1
    }),
    signal: AbortSignal.timeout(GOOGLE_REPORT_TIMEOUT_MS)
  });
  if (!response.ok) {
    if (response.status === 429) quotaBackoff.set(quotaKey, Date.now() + 15 * 6e4);
    const payload = await response.json().catch(() => null);
    throw new Error(`Lecture GA4 des sessions du jour impossible (${response.status})${((_a = payload == null ? void 0 : payload.error) == null ? void 0 : _a.message) ? ` : ${payload.error.message}` : ""}`);
  }
  const report = await response.json();
  const count = Number((_e = (_d = (_c = (_b = report.rows) == null ? void 0 : _b[0]) == null ? void 0 : _c.metricValues) == null ? void 0 : _d[0]) == null ? void 0 : _e.value) || 0;
  todaySessionsCache = { value: count, date, expiresAt: Date.now() + 2 * 6e4 };
  return { count, date };
}
async function googleAnalyticsTodayUsers() {
  var _a, _b, _c, _d, _e;
  const credentials = await googleAnalyticsCredentials();
  if (!credentials) return null;
  const date = currentZurichDate();
  if ((todayUsersCache == null ? void 0 : todayUsersCache.date) === date && todayUsersCache.expiresAt > Date.now()) {
    return { count: todayUsersCache.value, date };
  }
  const { propertyId, email, privateKey } = credentials;
  const quotaKey = `${propertyId}:today-users`;
  if ((quotaBackoff.get(quotaKey) || 0) > Date.now()) {
    return todayUsersCache ? { count: todayUsersCache.value, date: todayUsersCache.date } : null;
  }
  const token = await accessToken(email, privateKey);
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: date, endDate: date }],
      metrics: [{ name: "totalUsers" }],
      limit: 1
    }),
    signal: AbortSignal.timeout(GOOGLE_REPORT_TIMEOUT_MS)
  });
  if (!response.ok) {
    if (response.status === 429) quotaBackoff.set(quotaKey, Date.now() + 15 * 6e4);
    const payload = await response.json().catch(() => null);
    throw new Error(`Lecture GA4 des visiteurs du jour impossible (${response.status})${((_a = payload == null ? void 0 : payload.error) == null ? void 0 : _a.message) ? ` : ${payload.error.message}` : ""}`);
  }
  const report = await response.json();
  const count = Number((_e = (_d = (_c = (_b = report.rows) == null ? void 0 : _b[0]) == null ? void 0 : _c.metricValues) == null ? void 0 : _d[0]) == null ? void 0 : _e.value) || 0;
  todayUsersCache = { value: count, date, expiresAt: Date.now() + 2 * 6e4 };
  return { count, date };
}
async function googleAnalyticsGeoTimeline(date) {
  var _a, _b, _c;
  const credentials = await googleAnalyticsCredentials();
  if (!credentials) return null;
  const { propertyId, email, privateKey } = credentials;
  const cacheKey = `${propertyId}:${date}`;
  const cached = timelineCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const quotaKey = `${propertyId}:core`;
  if ((quotaBackoff.get(quotaKey) || 0) > Date.now()) {
    throw new Error("Lecture GA4 impossible (429) : quota horaire temporairement atteint.");
  }
  const token = await accessToken(email, privateKey);
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const rows2 = [];
  let offset = 0;
  let metadata;
  do {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: date, endDate: date }],
        dimensions: ["dateHourMinute", "cityId", "city", "region", "countryId", "country"].map((name) => ({ name })),
        metrics: [{ name: "eventCount" }],
        dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "session_start", caseSensitive: true } } },
        orderBys: [{ dimension: { dimensionName: "dateHourMinute", orderType: "ALPHANUMERIC" }, desc: false }],
        limit: 25e4,
        offset,
        returnPropertyQuota: true
      }),
      signal: AbortSignal.timeout(GOOGLE_REPORT_TIMEOUT_MS)
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      if (response.status === 429) quotaBackoff.set(quotaKey, Date.now() + 15 * 6e4);
      throw new Error(`Lecture GA4 impossible (${response.status})${((_a = payload == null ? void 0 : payload.error) == null ? void 0 : _a.message) ? ` : ${payload.error.message}` : ""}`);
    }
    const page = await response.json();
    rows2.push(...page.rows || []);
    metadata || (metadata = page.metadata);
    offset = rows2.length;
    if (!page.rowCount || offset >= page.rowCount) break;
  } while (offset < 1e6);
  const points = rows2.flatMap((row) => {
    var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i;
    const dimensions = row.dimensionValues || [];
    const compactMinute = ((_a2 = dimensions[0]) == null ? void 0 : _a2.value) || "";
    const city = ((_b2 = dimensions[2]) == null ? void 0 : _b2.value) || "";
    const countryCode = (((_c2 = dimensions[4]) == null ? void 0 : _c2.value) || "").toUpperCase();
    const sessions2 = Number((_e = (_d = row.metricValues) == null ? void 0 : _d[0]) == null ? void 0 : _e.value) || 0;
    if (!/^\d{12}$/u.test(compactMinute) || !city || city === "(not set)" || !/^[A-Z]{2}$/u.test(countryCode) || sessions2 <= 0) return [];
    const minute = `${compactMinute.slice(0, 4)}-${compactMinute.slice(4, 6)}-${compactMinute.slice(6, 8)}T${compactMinute.slice(8, 10)}:${compactMinute.slice(10, 12)}:00`;
    return [{
      minute,
      cityId: ((_f = dimensions[1]) == null ? void 0 : _f.value) || void 0,
      city,
      region: ((_g = dimensions[3]) == null ? void 0 : _g.value) && ((_h = dimensions[3]) == null ? void 0 : _h.value) !== "(not set)" ? dimensions[3].value : void 0,
      countryCode,
      country: ((_i = dimensions[5]) == null ? void 0 : _i.value) || countryCode,
      sessions: sessions2
    }];
  });
  const sessions = points.reduce((sum, point) => sum + point.sessions, 0);
  const today = currentZurichDate();
  const notices = [
    date === today ? "Les donn\xE9es GA4 de la journ\xE9e en cours peuvent encore \xEAtre compl\xE9t\xE9es pendant plusieurs heures." : "",
    (metadata == null ? void 0 : metadata.dataLossFromOtherRow) ? "GA4 signale que certaines lignes \xE0 forte cardinalit\xE9 ont \xE9t\xE9 regroup\xE9es." : ""
  ].filter(Boolean);
  const value = {
    date,
    configured: true,
    points,
    sessions,
    firstMinute: (_b = points[0]) == null ? void 0 : _b.minute,
    lastMinute: (_c = points.at(-1)) == null ? void 0 : _c.minute,
    timeZone: metadata == null ? void 0 : metadata.timeZone,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    notice: notices.join(" ") || void 0
  };
  timelineCache.set(cacheKey, { value, expiresAt: Date.now() + (date === today ? 5 * 6e4 : 6 * 60 * 6e4) });
  return value;
}

export { googleAnalyticsOverview as a, googleAnalyticsTodaySessions as b, googleAnalyticsRealtimeCountries as c, googleAnalyticsTodayUsers as d, googleAnalyticsGeoTimeline as g };
//# sourceMappingURL=google-analytics.mjs.map
