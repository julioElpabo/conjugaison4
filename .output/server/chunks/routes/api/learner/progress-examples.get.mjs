import { d as defineEventHandler, q as setResponseHeader, i as getQuery, n as normalizeLocale, O as LEARNER_ERROR_TAXONOMY, c as createError, u as useDatabase, N as learnerErrorDetails, P as learnerErrorDetailText } from '../../../nitro/nitro.mjs';
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

function jsonQuestion(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
const progressExamples_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const query = getQuery(event);
  const locale = normalizeLocale(query.locale, "fr");
  const code = String(query.code || "");
  const offset = Math.max(0, Math.min(5e3, Number.parseInt(String(query.offset || 0), 10) || 0));
  const definition = LEARNER_ERROR_TAXONOMY.find((item) => item.code === code);
  if (!definition) {
    throw createError({ statusCode: 400, statusMessage: "Type d\u2019erreur invalide" });
  }
  const database = useDatabase();
  const [rows] = await database.execute(`
    SELECT DISTINCT a.id,
           a.learner_answer AS learnerAnswer,
           a.question_json AS questionJson
    FROM learner_answer_attempts a
    INNER JOIN learner_challenge_runs r ON r.id=a.run_id
    INNER JOIN learner_attempt_error_tags t ON t.attempt_id=a.id
    WHERE r.account_id=?
      AND t.is_initial=1
      AND t.error_type_code=?
    ORDER BY a.answered_at DESC, a.id DESC
    LIMIT ? OFFSET ?
  `, [learner.id, code, 6, offset]);
  const examples = rows.slice(0, 5).flatMap((row) => {
    var _a;
    const question = jsonQuestion(row.questionJson);
    if (!question) return [];
    const detail = learnerErrorDetails(row.learnerAnswer, question).find((item) => item.code === code);
    if (!detail) return [];
    const acceptedAnswers = [...question.reponses || []].filter(Boolean).slice(0, 12);
    const expectedAnswers = [...((_a = question.reponsesPourCorrige) == null ? void 0 : _a.length) ? question.reponsesPourCorrige : question.reponses || []].filter(Boolean).slice(0, 4);
    return [{
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
      reason: learnerErrorDetailText(detail, locale) || definition.advice || "Compare ta r\xE9ponse avec la correction pour rep\xE9rer cette diff\xE9rence.",
      errorDetail: detail
    }];
  });
  return {
    examples,
    hasMore: rows.length > 5
  };
});

export { progressExamples_get as default };
//# sourceMappingURL=progress-examples.get.mjs.map
