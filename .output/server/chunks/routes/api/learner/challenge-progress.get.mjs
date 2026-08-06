import { d as defineEventHandler, s as setResponseHeader, o as normalizeLocale, a as getQuery, c as createError, u as useDatabase, V as learnerErrorDetails, Y as learnerErrorDetailText } from '../../../nitro/nitro.mjs';
import { createHash } from 'node:crypto';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

function rounded(value, precision = 1) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
function average(values) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}
function trend(values, stableThreshold) {
  if (values.length < 2) return { direction: "insufficient", delta: 0 };
  const split = values.length >= 4 ? Math.floor(values.length / 2) : 1;
  const earlier = average(values.slice(0, split));
  const recent = average(values.slice(values.length >= 4 ? split : -1));
  const delta = rounded(recent - earlier);
  if (Math.abs(delta) < stableThreshold) return { direction: "stable", delta };
  return { direction: delta > 0 ? "up" : "down", delta };
}
function challengeAchievement(runs) {
  const questionCount = Math.max(0, ...runs.map((run) => Number(run.expectedQuestionCount) || 0));
  return {
    questionCount,
    completedWithoutError: runs.some((run) => {
      const expected = Math.max(0, Number(run.expectedQuestionCount) || 0);
      return expected > 0 && Number(run.incorrectCount) === 0 && Number(run.correctCount) >= expected && Number(run.answeredQuestionCount) >= expected;
    })
  };
}
function buildChallengeProgress(runs) {
  const candidates = runs.map((run) => {
    var _a;
    const occurredAt = new Date(run.occurredAt);
    const correctCount = Math.max(0, Number(run.correctCount) || 0);
    const incorrectCount = Math.max(0, Number(run.incorrectCount) || 0);
    const totalCount = correctCount + incorrectCount;
    if (!Number.isInteger(run.id) || Number.isNaN(occurredAt.getTime()) || !totalCount) return null;
    return {
      id: run.id,
      occurredAt: occurredAt.toISOString(),
      correctCount,
      incorrectCount,
      groupKey: ((_a = run.groupKey) == null ? void 0 : _a.trim()) || "",
      runIds: [run.id]
    };
  }).filter((point) => Boolean(point)).sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());
  const grouped = /* @__PURE__ */ new Map();
  const ungrouped = [];
  for (const candidate of candidates) {
    if (!candidate.groupKey) {
      ungrouped.push(candidate);
      continue;
    }
    const previous = grouped.get(candidate.groupKey);
    if (!previous) {
      grouped.set(candidate.groupKey, candidate);
      continue;
    }
    grouped.set(candidate.groupKey, {
      ...candidate,
      correctCount: previous.correctCount + candidate.correctCount,
      incorrectCount: previous.incorrectCount + candidate.incorrectCount,
      runIds: [...previous.runIds, ...candidate.runIds]
    });
  }
  const points = [...ungrouped, ...grouped.values()].map(({ groupKey: _groupKey, ...point }) => {
    const totalCount = point.correctCount + point.incorrectCount;
    return {
      ...point,
      totalCount,
      successPercent: Math.round(point.correctCount / totalCount * 100)
    };
  }).sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());
  return {
    points,
    successTrend: trend(points.map((point) => point.successPercent), 2),
    errorTrend: trend(points.map((point) => point.incorrectCount), 0.5)
  };
}

const FINGERPRINT = /^[a-f0-9]{64}$/u;
const SWISS_DAY = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Europe/Zurich"
});
function questionFromJson(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
const challengeProgress_get = defineEventHandler(async (event) => {
  var _a;
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const locale = normalizeLocale(getQuery(event).locale, "fr");
  const fingerprint = typeof getQuery(event).fingerprint === "string" ? String(getQuery(event).fingerprint).trim() : "";
  if (!FINGERPRINT.test(fingerprint)) {
    throw createError({ statusCode: 400, statusMessage: "D\xE9fi invalide" });
  }
  const database = useDatabase();
  const [rows] = await database.execute(`
    SELECT id, COALESCE(completed_at, last_answered_at) AS occurredAt,
           correct_count AS correctCount,
           incorrect_count AS incorrectCount,
           challenge_config_json AS configJson
    FROM learner_challenge_runs
    WHERE account_id=? AND challenge_fingerprint=?
      AND is_review=0 AND last_answered_at IS NOT NULL
      AND (correct_count + incorrect_count) > 0
    ORDER BY COALESCE(completed_at, last_answered_at) ASC, id ASC
    LIMIT 200
  `, [learner.id, fingerprint]);
  const runIds = rows.map((row) => Number(row.id));
  const questionRows = runIds.length ? (await database.execute(`
      SELECT run_id AS runId, question_json AS questionJson
      FROM learner_run_questions
      WHERE run_id IN (${runIds.map(() => "?").join(", ")})
      ORDER BY run_id ASC, question_index ASC
    `, runIds))[0] : [];
  const errorRows = runIds.length ? (await database.execute(`
      SELECT a.id, a.run_id AS runId, a.infinitive,
             a.tense_label AS tense, a.mode_label AS mode,
             a.learner_answer AS learnerAnswer,
             a.question_json AS questionJson, a.answered_at AS answeredAt
      FROM learner_answer_attempts a
      INNER JOIN learner_challenge_runs r ON r.id=a.run_id
      WHERE r.account_id=? AND r.challenge_fingerprint=?
        AND r.is_review=0 AND a.is_correct=0
        AND a.run_id IN (${runIds.map(() => "?").join(", ")})
      ORDER BY a.answered_at ASC, a.id ASC
      LIMIT 5000
    `, [learner.id, fingerprint, ...runIds]))[0] : [];
  const errorsByRun = /* @__PURE__ */ new Map();
  for (const row of errorRows) {
    const question = questionFromJson(row.questionJson);
    const errors = errorsByRun.get(Number(row.runId)) || [];
    errors.push({
      id: Number(row.id),
      answeredAt: row.answeredAt,
      infinitive: row.infinitive || (question == null ? void 0 : question.infinitif) || (question == null ? void 0 : question.titre) || "",
      tense: row.tense || (question == null ? void 0 : question.temps) || "",
      mode: row.mode || (question == null ? void 0 : question.mode) || "",
      person: (question == null ? void 0 : question.pronom) || (question == null ? void 0 : question.saisiePrefixe) || "",
      learnerAnswer: row.learnerAnswer,
      expectedAnswers: ((_a = question == null ? void 0 : question.reponsesPourCorrige) == null ? void 0 : _a.length) ? question.reponsesPourCorrige : (question == null ? void 0 : question.reponses) || [],
      question,
      explanations: question ? learnerErrorDetails(row.learnerAnswer, question).map((detail) => learnerErrorDetailText(detail, locale)) : []
    });
    errorsByRun.set(Number(row.runId), errors);
  }
  const snapshots = /* @__PURE__ */ new Map();
  const sessionTitles = /* @__PURE__ */ new Map();
  for (const row of rows) {
    try {
      const snapshot = JSON.parse(row.configJson);
      snapshots.set(Number(row.id), snapshot);
      sessionTitles.set(Number(row.id), snapshot.trainingReportTitle || "");
    } catch {
      sessionTitles.set(Number(row.id), "");
    }
  }
  const questionKeysByRun = /* @__PURE__ */ new Map();
  for (const row of questionRows) {
    const runId = Number(row.runId);
    const snapshot = snapshots.get(runId);
    if (!snapshot || !questionFromJson(row.questionJson)) continue;
    const keys = questionKeysByRun.get(runId) || /* @__PURE__ */ new Set();
    keys.add(createHash("sha256").update(row.questionJson).digest("hex"));
    questionKeysByRun.set(runId, keys);
  }
  const summary = buildChallengeProgress(rows.map((row) => {
    const runId = Number(row.id);
    const questionKeys = [...questionKeysByRun.get(runId) || []].sort();
    const targeted = Boolean(sessionTitles.get(runId));
    return {
      ...row,
      groupKey: targeted && questionKeys.length ? `${SWISS_DAY.format(new Date(row.occurredAt))}|${questionKeys.join(",")}` : ""
    };
  }));
  const latestRun = rows.at(-1);
  let challenge = null;
  try {
    challenge = latestRun ? JSON.parse(latestRun.configJson) : null;
  } catch {
    challenge = null;
  }
  const achievement = challengeAchievement(rows.map((row) => {
    var _a2, _b;
    const runId = Number(row.id);
    return {
      correctCount: Number(row.correctCount),
      incorrectCount: Number(row.incorrectCount),
      answeredQuestionCount: ((_a2 = questionKeysByRun.get(runId)) == null ? void 0 : _a2.size) || 0,
      expectedQuestionCount: ((_b = snapshots.get(runId)) == null ? void 0 : _b.questionCount) || 0
    };
  }));
  const answeredQuestionCount = (runIds2) => {
    const questionKeys = /* @__PURE__ */ new Set();
    for (const runId of runIds2) {
      for (const key of questionKeysByRun.get(runId) || []) questionKeys.add(key);
    }
    return questionKeys.size;
  };
  const bestPoint = [...summary.points].sort(
    (left, right) => right.successPercent - left.successPercent || answeredQuestionCount(right.runIds) - answeredQuestionCount(left.runIds) || new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  )[0];
  return {
    ...summary,
    challenge,
    achievement: {
      ...achievement,
      bestSuccessPercent: (bestPoint == null ? void 0 : bestPoint.successPercent) || 0,
      bestAnsweredQuestionCount: bestPoint ? answeredQuestionCount(bestPoint.runIds) : 0
    },
    sessions: summary.points.map((point) => ({
      ...point,
      title: sessionTitles.get(point.id) || "",
      errors: point.runIds.flatMap((runId) => errorsByRun.get(runId) || [])
    }))
  };
});

export { challengeProgress_get as default };
//# sourceMappingURL=challenge-progress.get.mjs.map
