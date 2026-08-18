import { d as defineEventHandler, s as setResponseHeader, a as getQuery, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
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
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

function json(source, fallback) {
  try {
    return JSON.parse(source);
  } catch {
    return fallback;
  }
}
const dashboard_get = defineEventHandler(async (event) => {
  var _a, _b;
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const query = getQuery(event);
  const offset = Math.min(1e4, Math.max(0, Number(query.offset) || 0));
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 6));
  const database = useDatabase();
  const [runs] = await database.execute(`
    SELECT r.id, r.client_run_id AS clientRunId,
           r.challenge_fingerprint AS fingerprint, r.challenge_label AS label,
           r.challenge_config_json AS configJson, r.presentation, r.is_review AS isReview,
           r.started_at AS startedAt, r.last_answered_at AS lastAnsweredAt,
           r.completed_at AS completedAt, r.correct_count AS correctCount,
           r.incorrect_count AS incorrectCount
    FROM learner_challenge_runs r
    WHERE r.account_id=? AND r.last_answered_at IS NOT NULL
    ORDER BY r.last_answered_at DESC, r.id DESC
    LIMIT ${limit + 1} OFFSET ${offset}
  `, [learner.id]);
  const pageRuns = runs.slice(0, limit);
  const pageRunIds = pageRuns.map((run) => Number(run.id));
  const pageFingerprints = [...new Set(pageRuns.map((run) => run.fingerprint).filter(Boolean))];
  const forms = pageRunIds.length ? (await database.execute(`
    SELECT r.id AS runId, r.challenge_fingerprint AS fingerprint, f.form_key AS formKey,
           f.question_json AS questionJson, f.last_answered_at AS lastAnsweredAt
    FROM learner_run_forms f
    INNER JOIN learner_challenge_runs r ON r.id=f.run_id
    WHERE r.account_id=?
      AND r.id IN (${pageRunIds.map(() => "?").join(", ")})
      AND f.question_json IS NOT NULL
      AND f.incorrect_count > 0
    ORDER BY f.last_answered_at DESC, f.id DESC
    LIMIT 5000
  `, [learner.id, ...pageRunIds]))[0] : [];
  const allChallengeForms = pageFingerprints.length ? (await database.execute(`
    SELECT r.id AS runId, r.challenge_fingerprint AS fingerprint, f.form_key AS formKey,
           f.question_json AS questionJson, f.last_answered_at AS lastAnsweredAt
    FROM learner_run_forms f
    INNER JOIN learner_challenge_runs r ON r.id=f.run_id
    WHERE r.account_id=?
      AND r.challenge_fingerprint IN (${pageFingerprints.map(() => "?").join(", ")})
      AND f.question_json IS NOT NULL
      AND f.incorrect_count > 0
    ORDER BY f.last_answered_at DESC, f.id DESC
    LIMIT 5000
  `, [learner.id, ...pageFingerprints]))[0] : [];
  const runQuestions = pageRunIds.length ? (await database.execute(`
    SELECT q.run_id AS runId, q.question_index AS questionIndex,
           q.question_json AS questionJson, q.result_status AS resultStatus,
           q.attempt_number AS attemptNumber
    FROM learner_run_questions q
    WHERE q.run_id IN (${pageRunIds.map(() => "?").join(", ")})
    ORDER BY q.run_id, q.question_index
  `, pageRunIds))[0] : [];
  const questionsByRun = /* @__PURE__ */ new Map();
  const plannedQuestionCountByRun = /* @__PURE__ */ new Map();
  const answeredQuestionIndexesByRun = /* @__PURE__ */ new Map();
  const questionResultsByRun = /* @__PURE__ */ new Map();
  for (const row of runQuestions) {
    const question = json(row.questionJson, null);
    if (!question) continue;
    const runId = Number(row.runId);
    const questions = questionsByRun.get(runId) || [];
    questions.push(question);
    questionsByRun.set(runId, questions);
    plannedQuestionCountByRun.set(
      runId,
      Math.max(plannedQuestionCountByRun.get(runId) || 0, Number(row.questionIndex) + 1)
    );
    if (row.resultStatus === "correct" || row.resultStatus === "incorrect") {
      const answeredIndexes = answeredQuestionIndexesByRun.get(runId) || [];
      answeredIndexes.push(Number(row.questionIndex));
      answeredQuestionIndexesByRun.set(runId, answeredIndexes);
      const results = questionResultsByRun.get(runId) || [];
      results.push({
        index: Number(row.questionIndex),
        status: row.resultStatus,
        attemptNumber: Number(row.attemptNumber) === 2 ? 2 : 1
      });
      questionResultsByRun.set(runId, results);
    }
  }
  const latestForms = /* @__PURE__ */ new Map();
  for (const form of forms) {
    const runId = Number(form.runId);
    const challengeForms = latestForms.get(runId) || /* @__PURE__ */ new Map();
    if (!challengeForms.has(form.formKey)) challengeForms.set(form.formKey, form);
    latestForms.set(runId, challengeForms);
  }
  const latestFormsByChallenge = /* @__PURE__ */ new Map();
  for (const form of allChallengeForms) {
    const challengeForms = latestFormsByChallenge.get(form.fingerprint) || /* @__PURE__ */ new Map();
    if (!challengeForms.has(form.formKey)) challengeForms.set(form.formKey, form);
    latestFormsByChallenge.set(form.fingerprint, challengeForms);
  }
  const challenges = [];
  for (const run of pageRuns) {
    const storedChallenge = json(run.configJson, {
      verbIds: [],
      tenseIds: [],
      questionCount: 1,
      exerciseKind: "conjugation"
    });
    const plannedQuestionCount = plannedQuestionCountByRun.get(Number(run.id)) || 0;
    const challenge = Boolean(run.isReview) && plannedQuestionCount ? { ...storedChallenge, questionCount: plannedQuestionCount } : storedChallenge;
    const forms2 = [...((_a = latestForms.get(Number(run.id))) == null ? void 0 : _a.values()) || []];
    const retryQuestions = forms2.filter((form) => form.questionJson).map((form) => json(form.questionJson || "", null)).filter((question) => Boolean(question)).slice(0, 100);
    const allRetryQuestions = [...((_b = latestFormsByChallenge.get(run.fingerprint)) == null ? void 0 : _b.values()) || []].filter((form) => form.questionJson).map((form) => json(form.questionJson || "", null)).filter((question) => Boolean(question)).slice(0, 100);
    const total = Number(run.correctCount) + Number(run.incorrectCount);
    const answeredQuestionIndexes = answeredQuestionIndexesByRun.get(Number(run.id)) || [];
    const answeredQuestionIndexSet = new Set(answeredQuestionIndexes);
    const isComplete = Array.from(
      { length: challenge.questionCount },
      (_, index) => index
    ).every((index) => answeredQuestionIndexSet.has(index));
    challenges.push({
      id: Number(run.id),
      clientRunId: run.clientRunId,
      fingerprint: run.fingerprint,
      label: run.label,
      description: challenge.description || "",
      challenge,
      presentation: run.presentation,
      isReview: Boolean(run.isReview),
      lastActivityAt: run.lastAnsweredAt,
      completedAt: isComplete ? run.completedAt || run.lastAnsweredAt : null,
      correctCount: Number(run.correctCount),
      incorrectCount: Number(run.incorrectCount),
      scorePercent: total ? Math.round(Number(run.correctCount) / total * 100) : 0,
      unresolvedCount: retryQuestions.length,
      retryQuestions,
      allUnresolvedCount: allRetryQuestions.length,
      allRetryQuestions,
      exactQuestions: questionsByRun.get(Number(run.id)) || [],
      answeredQuestionIndexes,
      questionResults: questionResultsByRun.get(Number(run.id)) || []
    });
  }
  const nextOffset = offset + challenges.length;
  return {
    challenges,
    nextOffset,
    hasMore: runs.length > limit
  };
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
