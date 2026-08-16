import { d as defineEventHandler, s as setResponseHeader, a as getQuery, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';

const activityDays = {
  week: 7,
  month: 30,
  year: 365
};
const localeLabels = {
  fr: "Fran\xE7ais",
  de: "Allemand",
  en: "Anglais",
  it: "Italien",
  es: "Espagnol"
};
const connectedFeatureLabels = {
  "learner.history": "Historique",
  "learner.summary": "Bilan de s\xE9ance",
  "learner.finish": "Reprendre une s\xE9ance",
  "learner.relaunch.same": "Relancer dans le m\xEAme ordre",
  "learner.relaunch.random": "Relancer au hasard",
  "learner.errors.session": "Reprendre les erreurs de la s\xE9ance",
  "learner.errors.challenge": "Reprendre les erreurs du d\xE9fi",
  "learner.errors.targeted": "D\xE9fi cibl\xE9 par erreur",
  "learner.progress": "Comprendre ses erreurs",
  "learner.training": "Progression par d\xE9fi",
  "learner.training.analysis": "Analyse de progression",
  "learner.preferences": "Pr\xE9f\xE9rences",
  "learner.account": "R\xE9glages du compte"
};
function isoDate(value, fallback) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`)) ? text : fallback.toISOString().slice(0, 10);
}
function filledRegistrationSeries(rows, startDate, endDate, unit) {
  const values = new Map(rows.map((row) => [String(row.date), Number(row.value) || 0]));
  const cursor = /* @__PURE__ */ new Date(`${startDate}T12:00:00Z`);
  const end = /* @__PURE__ */ new Date(`${endDate}T12:00:00Z`);
  if (unit === "Semaines") {
    const weekday = cursor.getUTCDay() || 7;
    cursor.setUTCDate(cursor.getUTCDate() - weekday + 1);
  }
  if (unit === "Mois") cursor.setUTCDate(1);
  const points = [];
  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10);
    points.push({ date, value: values.get(date) || 0 });
    if (unit === "Jours") cursor.setUTCDate(cursor.getUTCDate() + 1);
    else if (unit === "Semaines") cursor.setUTCDate(cursor.getUTCDate() + 7);
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return points;
}
const analyticsUsers_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  const query = getQuery(event);
  const requestedWindow = String(query.activity || "month");
  const activityWindow = Object.hasOwn(activityDays, requestedWindow) ? requestedWindow : "month";
  const today = /* @__PURE__ */ new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 29);
  const startDate = isoDate(query.start, defaultStart);
  const endDate = isoDate(query.end, today);
  if (startDate > endDate) {
    throw createError({ statusCode: 400, statusMessage: "La date de d\xE9but doit pr\xE9c\xE9der la date de fin." });
  }
  const rangeDays = Math.max(1, Math.ceil(
    (Date.parse(`${endDate}T12:00:00Z`) - Date.parse(`${startDate}T12:00:00Z`)) / 864e5
  ) + 1);
  const registrationFormat = rangeDays <= 45 ? "%Y-%m-%d" : rangeDays <= 210 ? "%Y-%m-%d" : "%Y-%m-01";
  const registrationDate = rangeDays <= 45 ? `DATE_FORMAT(a.created_at, '${registrationFormat}')` : rangeDays <= 210 ? "DATE_FORMAT(DATE_SUB(DATE(a.created_at), INTERVAL WEEKDAY(a.created_at) DAY), '%Y-%m-%d')" : `DATE_FORMAT(a.created_at, '${registrationFormat}')`;
  const registrationUnit = rangeDays <= 45 ? "Jours" : rangeDays <= 210 ? "Semaines" : "Mois";
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - activityDays[activityWindow]);
  const cutoffSql = cutoff.toISOString().slice(0, 19).replace("T", " ");
  const database = useDatabase();
  const [[[total]], [[active]], [languageRows], [anonymousLanguageRows], [registrationRows], [[errorReviews]], [[loginSummary]], [[failedLogins]], [connectedFeatureRows]] = await Promise.all([
    database.execute(`
      SELECT COUNT(*) AS value
      FROM learner_accounts
      WHERE deleted_at IS NULL
    `),
    database.execute(`
      SELECT COUNT(DISTINCT activity.account_id) AS value
      FROM (
        SELECT account_id FROM learner_login_events
        WHERE event_type='login' AND occurred_at>=?
        UNION
        SELECT account_id FROM learner_sessions
        WHERE last_seen_at>=?
        UNION
        SELECT account_id FROM learner_challenge_runs
        WHERE last_answered_at>=?
      ) activity
      INNER JOIN learner_accounts accounts ON accounts.id=activity.account_id
      WHERE accounts.deleted_at IS NULL
    `, [cutoffSql, cutoffSql, cutoffSql]),
    database.execute(`
      SELECT COALESCE(NULLIF(preferences.interface_locale, ''), 'fr') AS locale,
             COUNT(*) AS value
      FROM learner_accounts accounts
      LEFT JOIN learner_preferences preferences ON preferences.account_id=accounts.id
      WHERE accounts.deleted_at IS NULL
      GROUP BY locale
      ORDER BY value DESC
    `),
    database.execute(`
      SELECT sessions.interface_locale AS locale,
             COUNT(DISTINCT events.session_id) AS value
      FROM analytics_events events
      INNER JOIN analytics_sessions sessions ON sessions.session_id=events.session_id
      WHERE events.event_name='exercise_started'
        AND events.actor_type='anonymous'
        AND events.created_at>=? AND events.created_at<DATE_ADD(?, INTERVAL 1 DAY)
        AND sessions.interface_locale IN ('fr','de','en','it','es')
      GROUP BY sessions.interface_locale
      ORDER BY value DESC
    `, [startDate, endDate]),
    database.execute(`
      SELECT ${registrationDate} AS date, COUNT(*) AS value
      FROM learner_accounts a
      WHERE a.deleted_at IS NULL
        AND a.created_at>=? AND a.created_at<DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY date
      ORDER BY date
    `, [startDate, endDate]),
    database.execute(`
      SELECT COUNT(DISTINCT runs.account_id) AS value
      FROM learner_challenge_runs runs
      INNER JOIN learner_accounts accounts ON accounts.id=runs.account_id
      WHERE accounts.deleted_at IS NULL
        AND runs.is_review=1
        AND runs.last_answered_at>=?
        AND runs.last_answered_at<DATE_ADD(?, INTERVAL 1 DAY)
    `, [startDate, endDate]),
    database.execute(`
      SELECT COUNT(*) AS value, COUNT(DISTINCT account_id) AS accounts
      FROM learner_login_events
      WHERE event_type='login' AND occurred_at>=? AND occurred_at<DATE_ADD(?, INTERVAL 1 DAY)
    `, [startDate, endDate]),
    database.execute(`
      SELECT COUNT(*) AS value FROM analytics_events
      WHERE event_name='feature_failed'
        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature'))='auth.login'
        AND created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)
    `, [startDate, endDate]),
    database.execute(`
      SELECT JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) AS feature,
             COUNT(DISTINCT session_id) AS value
      FROM analytics_events
      WHERE actor_type='learner' AND event_name IN ('feature_selected','feature_completed')
        AND created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)
        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) LIKE 'learner.%'
      GROUP BY feature ORDER BY value DESC
    `, [startDate, endDate])
  ]);
  const languages = languageRows.map((row) => ({
    code: String(row.locale || "fr"),
    label: localeLabels[String(row.locale)] || String(row.locale || "Non pr\xE9cis\xE9e"),
    value: Number(row.value) || 0
  }));
  const anonymousExerciseLanguages = anonymousLanguageRows.map((row) => ({
    code: String(row.locale || "fr"),
    label: localeLabels[String(row.locale)] || String(row.locale || "Non pr\xE9cis\xE9e"),
    value: Number(row.value) || 0
  }));
  const anonymousExerciseSessions = anonymousExerciseLanguages.reduce((sum, row) => sum + row.value, 0);
  const connectedFeatures = connectedFeatureRows.map((row) => ({
    code: String(row.feature),
    label: connectedFeatureLabels[String(row.feature)] || String(row.feature),
    value: Number(row.value) || 0
  }));
  const registrations = filledRegistrationSeries(
    registrationRows,
    startDate,
    endDate,
    registrationUnit
  );
  return {
    startDate,
    endDate,
    activityWindow,
    activityDays: activityDays[activityWindow],
    totalAccounts: Number(total == null ? void 0 : total.value) || 0,
    activeAccounts: Number(active == null ? void 0 : active.value) || 0,
    loggedInAccounts: Number(loginSummary == null ? void 0 : loginSummary.accounts) || 0,
    successfulLogins: Number(loginSummary == null ? void 0 : loginSummary.value) || 0,
    failedLogins: Number(failedLogins == null ? void 0 : failedLogins.value) || 0,
    errorReviewUsers: Number(errorReviews == null ? void 0 : errorReviews.value) || 0,
    languages,
    connectedFeatures,
    anonymousExerciseSessions,
    anonymousExerciseLanguages,
    registrations,
    registrationUnit,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    notice: "L\u2019activit\xE9 regroupe les connexions, les sessions de compte et les r\xE9ponses enregistr\xE9es. La reprise des erreurs compte chaque utilisateur une seule fois sur la p\xE9riode."
  };
});

export { analyticsUsers_get as default };
//# sourceMappingURL=analytics-users.get.mjs.map
