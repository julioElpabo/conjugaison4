import { m as getCookie, j as setCookie, B as getRequestURL, C as stripLocaleFromPath } from '../nitro/nitro.mjs';
import { randomUUID } from 'node:crypto';

const COOKIE_NAME = "tatitotu_session";
function analyticsSessionId(event) {
  var _a;
  const existing = (_a = getCookie(event, COOKIE_NAME)) == null ? void 0 : _a.trim();
  const sessionId = existing && /^[a-f0-9-]{20,64}$/iu.test(existing) ? existing : randomUUID();
  setCookie(event, COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: getRequestURL(event).protocol === "https:",
    path: "/",
    maxAge: 30 * 60
  });
  return sessionId;
}
function analyticsDeviceCategory(userAgent = "") {
  if (/ipad|tablet|playbook|silk/iu.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/iu.test(userAgent)) return "mobile";
  return "desktop";
}
function safeAnalyticsPath(value) {
  const raw = typeof value === "string" ? value.trim().slice(0, 500) : "/";
  if (!raw.startsWith("/")) return "/";
  let parsed;
  try {
    parsed = new URL(raw, "https://analytics.local");
  } catch {
    return "/";
  }
  const path = stripLocaleFromPath(parsed.pathname).replace(/\/+$/u, "") || "/";
  if (/^\/defi\/[^/]+$/u.test(path)) return "/defi/:code";
  if (path === "/my-page") {
    const tab = String(parsed.searchParams.get("tab") || "");
    return ["history", "progress", "preferences", "account"].includes(tab) ? `/my-page/${tab}` : "/my-page";
  }
  return path.slice(0, 255);
}
function safeAnalyticsMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const allowed = [
    "presentation",
    "exerciseKind",
    "coach",
    "preset",
    "mode",
    "tense",
    "status",
    "feature",
    "item",
    "source",
    "scope",
    "step",
    "action",
    "repeat",
    "questions",
    "locale",
    "theme",
    "falc",
    "format",
    "tourFormat",
    "voiceMode",
    "complements",
    "complementPlacement",
    "questionCountBand",
    "inclusivePronouns",
    "includeOnPronoun",
    "identificationSource",
    "helpSource",
    "printSource",
    "inclusiveDisplay",
    "showGrade",
    "showVerbs",
    "showTenses",
    "showFirstName",
    "showLastName",
    "showDate",
    "showRandomNumber",
    "questionSpacingBand",
    "titleSpacingBand"
  ];
  const entries = Object.entries(value).filter(([key, item]) => allowed.includes(key) && ["string", "number", "boolean"].includes(typeof item)).slice(0, 24).map(([key, item]) => [key, String(item).slice(0, 100)]);
  return entries.length ? Object.fromEntries(entries) : null;
}

export { analyticsSessionId as a, analyticsDeviceCategory as b, safeAnalyticsMetadata as c, safeAnalyticsPath as s };
//# sourceMappingURL=analytics-session.mjs.map
