import { P as LEARNER_ERROR_TAXONOMY, d as defineEventHandler, s as setResponseHeader, o as normalizeLocale, a as getQuery, u as useDatabase, N as learnerErrorDetails, Q as learnerErrorDetailText, M as applicableLearnerErrorTypes } from '../../../nitro/nitro.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
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
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

const OPPORTUNITY_WINDOW = 10;
const MINIMUM_EVIDENCE = 5;
const STALE_AFTER_DAYS = 45;
function count(value) {
  return Math.max(0, Number(value) || 0);
}
function errorRate(errors, opportunities) {
  return opportunities ? Math.round(errors / opportunities * 100) : 0;
}
function normalizedDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value) ? value : "";
}
function daysBetween(left, right) {
  const leftTime = Date.parse(`${left}T00:00:00Z`);
  const rightTime = Date.parse(`${right}T00:00:00Z`);
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return 0;
  return Math.max(0, Math.floor((rightTime - leftTime) / 864e5));
}
function collectOpportunityWindow(rows, endIndex) {
  var _a, _b;
  let opportunities = 0;
  let errors = 0;
  let index = endIndex;
  let startDate = ((_a = rows[endIndex]) == null ? void 0 : _a.statDate) || "";
  const endDate = ((_b = rows[endIndex]) == null ? void 0 : _b.statDate) || "";
  while (index >= 0 && opportunities < OPPORTUNITY_WINDOW) {
    const row = rows[index];
    opportunities += count(row.opportunities);
    errors += Math.min(count(row.errors), count(row.opportunities));
    startDate = row.statDate;
    index -= 1;
  }
  return { nextIndex: index, startDate, endDate, opportunities, errors };
}
function progressPoints(rows) {
  return rows.flatMap((row, index) => {
    const window = collectOpportunityWindow(rows, index);
    if (window.opportunities < MINIMUM_EVIDENCE) return [];
    return [{
      date: row.statDate,
      windowStartDate: window.startDate,
      opportunities: window.opportunities,
      errors: window.errors,
      errorRate: errorRate(window.errors, window.opportunities),
      ...row.sequence === void 0 ? {} : { sequence: row.sequence }
    }];
  }).slice(-24);
}
function buildLearnerErrorProgress(sources, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), examples = /* @__PURE__ */ new Map()) {
  const taxonomy = new Map(LEARNER_ERROR_TAXONOMY.map((item) => [item.code, item]));
  const grouped = /* @__PURE__ */ new Map();
  for (const source of sources) {
    if (source.code === "unknown") continue;
    if (!taxonomy.has(source.code)) continue;
    const statDate = normalizedDate(source.statDate);
    const opportunities = count(source.opportunities);
    if (!statDate || !opportunities) continue;
    const rows = grouped.get(source.code) || [];
    rows.push({
      code: source.code,
      statDate,
      opportunities,
      errors: Math.min(count(source.errors), opportunities),
      ...source.sequence === void 0 ? {} : { sequence: count(source.sequence) },
      ...source.challengeKey ? { challengeKey: source.challengeKey } : {}
    });
    grouped.set(source.code, rows);
  }
  const cards = [...grouped.entries()].flatMap(([code, unsortedRows]) => {
    const definition = taxonomy.get(code);
    const rows = [...unsortedRows].sort(
      (left, right) => left.statDate.localeCompare(right.statDate) || count(left.sequence) - count(right.sequence)
    );
    const totalOpportunities = rows.reduce((total, row) => total + row.opportunities, 0);
    const totalErrors = rows.reduce((total, row) => total + row.errors, 0);
    const affectedChallengeCount = new Set(
      rows.filter((row) => row.errors > 0 && row.challengeKey).map((row) => row.challengeKey)
    ).size;
    if (!definition || !totalErrors) return [];
    const recent = collectOpportunityWindow(rows, rows.length - 1);
    const previous = recent.nextIndex >= 0 ? collectOpportunityWindow(rows, recent.nextIndex) : null;
    const hasCurrentEvidence = recent.opportunities >= MINIMUM_EVIDENCE;
    const hasComparisonEvidence = hasCurrentEvidence && Boolean(previous && previous.opportunities >= MINIMUM_EVIDENCE);
    const currentRate = errorRate(recent.errors, recent.opportunities);
    if (currentRate === 0) return [];
    const previousRate = hasComparisonEvidence && previous ? errorRate(previous.errors, previous.opportunities) : null;
    const trendDelta = previousRate === null ? null : currentRate - previousRate;
    const trend = trendDelta === null ? "insufficient" : Math.abs(trendDelta) < 5 ? "stable" : trendDelta < 0 ? "improving" : "worsening";
    const lastTestedAt = rows.at(-1).statDate;
    const daysSinceLastTest = daysBetween(lastTestedAt, normalizedDate(today) || lastTestedAt);
    return [{
      ...definition,
      totalOpportunities,
      totalErrors,
      affectedChallengeCount,
      currentRate,
      previousRate,
      trend,
      trendDelta,
      lastTestedAt,
      daysSinceLastTest,
      isStale: daysSinceLastTest > STALE_AFTER_DAYS,
      points: progressPoints(rows),
      examples: (examples.get(code) || []).slice(0, 5),
      hasMoreExamples: (examples.get(code) || []).length > 5
    }];
  }).sort(
    (left, right) => Number(left.isStale) - Number(right.isStale) || right.currentRate - left.currentRate || right.totalErrors - left.totalErrors
  );
  return {
    cards,
    opportunityWindow: OPPORTUNITY_WINDOW,
    minimumEvidence: MINIMUM_EVIDENCE,
    staleAfterDays: STALE_AFTER_DAYS
  };
}

function jsonQuestion(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
const progress_get = defineEventHandler(async (event) => {
  var _a;
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const locale = normalizeLocale(getQuery(event).locale, "fr");
  const database = useDatabase();
  const [[runQuestions], [runErrors], [dailyRows], [exampleRows]] = await Promise.all([
    database.execute(`
      SELECT r.id AS runId,
             r.challenge_fingerprint AS challengeKey,
             DATE_FORMAT(COALESCE(r.completed_at, r.last_answered_at), '%Y-%m-%d') AS statDate,
             q.question_json AS questionJson
      FROM learner_challenge_runs r
      INNER JOIN learner_run_questions q ON q.run_id=r.id
      WHERE r.account_id=? AND r.last_answered_at IS NOT NULL
      ORDER BY COALESCE(r.completed_at, r.last_answered_at), r.id, q.question_index
    `, [learner.id]),
    database.execute(`
      SELECT DISTINCT a.id, a.run_id AS runId,
             a.learner_answer AS learnerAnswer,
             a.question_json AS questionJson
      FROM learner_challenge_runs r
      INNER JOIN learner_answer_attempts a ON a.run_id=r.id
      INNER JOIN learner_attempt_error_tags t ON t.attempt_id=a.id
      WHERE r.account_id=? AND t.is_initial=1
    `, [learner.id]),
    database.execute(`
    SELECT error_type_code AS code,
           DATE_FORMAT(stat_date, '%Y-%m-%d') AS statDate,
           opportunities,
           errors
    FROM learner_skill_daily_stats
    WHERE account_id=?
    ORDER BY error_type_code, stat_date
    `, [learner.id]),
    database.execute(`
      SELECT a.id,
             a.learner_answer AS learnerAnswer,
             a.question_json AS questionJson
      FROM learner_answer_attempts a
      INNER JOIN learner_challenge_runs r ON r.id=a.run_id
      WHERE r.account_id=?
        AND EXISTS (
          SELECT 1
          FROM learner_attempt_error_tags t
          WHERE t.attempt_id=a.id AND t.is_initial=1
        )
      ORDER BY a.answered_at DESC, a.id DESC
    `, [learner.id])
  ]);
  const adviceByCode = new Map(LEARNER_ERROR_TAXONOMY.map((item) => [item.code, item.advice]));
  const examples = /* @__PURE__ */ new Map();
  const exampleIds = /* @__PURE__ */ new Set();
  for (const row of exampleRows) {
    const question = jsonQuestion(row.questionJson);
    if (!question) continue;
    const details = learnerErrorDetails(row.learnerAnswer, question);
    if (!details.length) continue;
    const acceptedAnswers = [...question.reponses || []].filter(Boolean).slice(0, 12);
    const expectedAnswers = [...((_a = question.reponsesPourCorrige) == null ? void 0 : _a.length) ? question.reponsesPourCorrige : question.reponses || []].filter(Boolean).slice(0, 4);
    for (const detail of details) {
      const code = detail.code;
      const current = examples.get(code) || [];
      const exampleKey = `${code}\0${row.id}`;
      if (current.length >= 6 || exampleIds.has(exampleKey)) continue;
      current.push({
        id: Number(row.id),
        question: question.consigne || [
          question.infinitif || question.titre,
          question.mode,
          question.temps,
          question.pronom || question.saisiePrefixe
        ].filter(Boolean).join(" \xB7 "),
        learnerAnswer: row.learnerAnswer,
        acceptedAnswers,
        expectedAnswers,
        reason: learnerErrorDetailText(detail, locale) || adviceByCode.get(code) || "Compare ta r\xE9ponse avec la correction pour rep\xE9rer cette diff\xE9rence.",
        errorDetail: detail
      });
      exampleIds.add(exampleKey);
      examples.set(code, current);
    }
  }
  if (!runQuestions.length) {
    return buildLearnerErrorProgress(dailyRows.map((row) => ({
      code: row.code,
      statDate: row.statDate,
      opportunities: Number(row.opportunities),
      errors: Number(row.errors)
    })), void 0, examples);
  }
  const runStats = /* @__PURE__ */ new Map();
  for (const row of runQuestions) {
    const question = jsonQuestion(row.questionJson);
    if (!question) continue;
    for (const code of applicableLearnerErrorTypes(question)) {
      const key = `${row.runId}\0${code}`;
      const stat = runStats.get(key) || {
        code,
        statDate: row.statDate,
        sequence: Number(row.runId),
        challengeKey: row.challengeKey,
        opportunities: 0,
        errors: 0
      };
      stat.opportunities += 1;
      runStats.set(key, stat);
    }
  }
  for (const row of runErrors) {
    const question = jsonQuestion(row.questionJson);
    if (!question) continue;
    for (const detail of learnerErrorDetails(row.learnerAnswer, question)) {
      const stat = runStats.get(`${row.runId}\0${detail.code}`);
      if (stat) stat.errors = Math.min(stat.opportunities, stat.errors + 1);
    }
  }
  return buildLearnerErrorProgress([...runStats.values()].map((row) => ({
    code: row.code,
    statDate: row.statDate,
    sequence: row.sequence,
    challengeKey: row.challengeKey,
    opportunities: row.opportunities,
    errors: row.errors
  })), void 0, examples);
});

export { progress_get as default };
//# sourceMappingURL=progress.get.mjs.map
