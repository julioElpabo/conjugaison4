import { d as defineEventHandler, s as setResponseHeader, a as getQuery, y as normalizeLocale, c as createError, u as useDatabase, a3 as learnerErrorDetails } from '../../../nitro/nitro.mjs';
import { i as identificationFormParts } from '../../../_/identification-form.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
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
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

function questionFromJson(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
function exerciseKindFromJson(source) {
  try {
    const config = JSON.parse(source);
    return config.exerciseKind === "tense-identification" || config.exerciseKind === "mode-identification" ? config.exerciseKind : "conjugation";
  } catch {
    return "conjugation";
  }
}
const challengeSummary_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const query = getQuery(event);
  const runId = Number.parseInt(String(query.runId || ""), 10);
  const locale = normalizeLocale(query.locale, "fr");
  if (!Number.isSafeInteger(runId) || runId < 1) {
    throw createError({ statusCode: 400, statusMessage: "S\xE9ance invalide" });
  }
  const database = useDatabase();
  const [[run]] = await database.execute(`
    SELECT id, challenge_config_json AS challengeConfigJson
    FROM learner_challenge_runs
    WHERE id=? AND account_id=? AND last_answered_at IS NOT NULL
    LIMIT 1
  `, [runId, learner.id]);
  if (!run) throw createError({ statusCode: 404, statusMessage: "S\xE9ance introuvable" });
  const exerciseKind = exerciseKindFromJson(run.challengeConfigJson);
  const isIdentificationExercise = exerciseKind === "tense-identification" || exerciseKind === "mode-identification";
  const [incorrectRows] = await database.execute(`
    SELECT a.question_index AS questionIndex,
           COALESCE(q.question_json, a.question_json) AS questionJson,
           0 AS isMastered,
           a.learner_answer AS learnerAnswer
    FROM learner_answer_attempts a
    LEFT JOIN learner_run_questions q
      ON q.run_id=a.run_id AND q.question_index=a.question_index
    WHERE a.run_id=? AND a.is_correct=0
      AND COALESCE(q.question_json, a.question_json) IS NOT NULL
    ORDER BY a.answered_at, a.id
  `, [runId]);
  const [correctRows] = await database.execute(`
    SELECT f.question_index AS questionIndex,
           COALESCE(q.question_json, f.question_json) AS questionJson,
           1 AS isMastered,
           NULL AS learnerAnswer
    FROM learner_run_forms f
    LEFT JOIN learner_run_questions q
      ON q.run_id=f.run_id AND q.question_index=f.question_index
    WHERE f.run_id=? AND f.is_mastered=1
      AND COALESCE(q.question_json, f.question_json) IS NOT NULL
    ORDER BY f.question_index, f.id
  `, [runId]);
  const verbs = /* @__PURE__ */ new Set();
  const tenses = /* @__PURE__ */ new Map();
  const answerSeparator = { fr: " ou ", de: " oder ", en: " or ", it: " o ", es: " o " }[locale];
  const items = [...incorrectRows, ...correctRows].flatMap((row, itemIndex) => {
    const question = questionFromJson(row.questionJson);
    if (!question) return [];
    if (question.infinitif) verbs.add(question.infinitif);
    if (question.temps) {
      const key = `${question.mode || ""}\0${question.temps}`;
      tenses.set(key, { name: question.temps, ...question.mode ? { mode: question.mode } : {} });
    }
    const expectedAnswer = question.reponsesPourCorrige.join(answerSeparator) || question.reponses.join(answerSeparator);
    const mastered = Boolean(row.isMastered);
    const learnerAnswer = mastered ? question.reponses[0] || expectedAnswer : row.learnerAnswer || "";
    const errorDetails = mastered || isIdentificationExercise ? [] : learnerErrorDetails(learnerAnswer, question);
    const identificationForm = !mastered && isIdentificationExercise ? identificationFormParts(question) : null;
    return [{
      index: itemIndex + 1,
      status: mastered ? "correct" : "incorrect",
      questionLabel: [
        question.infinitif || question.titre,
        question.mode,
        question.temps,
        question.pronom || question.saisiePrefixe
      ].filter(Boolean).join(" \xB7 ") || question.consigne,
      learnerAnswer,
      expectedAnswer,
      acceptedAnswers: question.reponses,
      displayExpectedAnswers: question.reponsesPourCorrige.length ? question.reponsesPourCorrige : question.reponses,
      errorLabels: errorDetails.map((detail) => detail.label),
      errorDetails,
      identificationForm,
      literaryCitation: !mastered ? question.literaryCitation : void 0,
      isIdentification: isIdentificationExercise
    }];
  });
  return {
    items,
    verbs: [...verbs],
    tenses: [...tenses.values()]
  };
});

export { challengeSummary_get as default };
//# sourceMappingURL=challenge-summary.get.mjs.map
