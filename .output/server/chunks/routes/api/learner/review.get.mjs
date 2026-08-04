import { d as defineEventHandler, s as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
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

function text(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function uniquePush(values, candidates, maximum) {
  for (const candidate of candidates) {
    const value = text(candidate, "");
    if (value && !values.includes(value)) values.push(value);
    if (values.length >= maximum) break;
  }
}
function dominantInsight(forms, totalErrors, dimension) {
  const counts = /* @__PURE__ */ new Map();
  for (const form of forms) {
    const label = dimension === "tense" ? form.tense : dimension === "mode" ? form.mode : form.infinitive;
    const key = label.toLocaleLowerCase("fr-CH");
    const current = counts.get(key);
    if (current) current.count += form.errorCount;
    else counts.set(key, { label, count: form.errorCount });
  }
  const dominant = [...counts.values()].sort((left, right) => right.count - left.count)[0];
  if (!dominant || totalErrors < 5 || dominant.count < 3) return null;
  const percent = Math.round(dominant.count / totalErrors * 100);
  if (percent < 60) return null;
  return {
    dimension,
    label: dominant.label,
    errorCount: dominant.count,
    totalErrors,
    percent
  };
}
function buildLearnerReview(attempts) {
  const formsByKey = /* @__PURE__ */ new Map();
  for (const attempt of attempts) {
    const formKey = text(attempt.formKey, "");
    if (!formKey) continue;
    const answeredAt = new Date(attempt.answeredAt);
    if (Number.isNaN(answeredAt.getTime())) continue;
    const existing = formsByKey.get(formKey);
    if (existing) {
      existing.errorCount += 1;
      uniquePush(existing.learnerAnswers, [attempt.learnerAnswer], 4);
      uniquePush(existing.expectedAnswers, attempt.expectedAnswers, 8);
      if (answeredAt.getTime() > new Date(existing.lastErrorAt).getTime()) {
        existing.lastErrorAt = answeredAt.toISOString();
      }
      continue;
    }
    const learnerAnswers = [];
    const expectedAnswers = [];
    uniquePush(learnerAnswers, [attempt.learnerAnswer], 4);
    uniquePush(expectedAnswers, attempt.expectedAnswers, 8);
    formsByKey.set(formKey, {
      formKey,
      infinitive: text(attempt.infinitive, "Verbe"),
      mode: text(attempt.mode, "Mode non renseign\xE9"),
      tense: text(attempt.tense, "Temps non renseign\xE9"),
      person: text(attempt.person, ""),
      errorCount: 1,
      learnerAnswers,
      expectedAnswers,
      lastErrorAt: answeredAt.toISOString()
    });
  }
  const forms = [...formsByKey.values()].sort((left, right) => new Date(right.lastErrorAt).getTime() - new Date(left.lastErrorAt).getTime());
  const totalErrors = forms.reduce((total, form) => total + form.errorCount, 0);
  const insight = ["tense", "mode", "verb"].map((dimension) => dominantInsight(forms, totalErrors, dimension)).find((candidate) => Boolean(candidate)) || null;
  return { forms, totalErrors, insight };
}

function questionFromJson(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
const review_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const database = useDatabase();
  const [rows] = await database.execute(`
    SELECT a.form_key AS formKey, a.infinitive, a.mode_label AS mode,
           a.tense_label AS tense, a.learner_answer AS learnerAnswer,
           a.question_json AS questionJson, a.answered_at AS answeredAt
    FROM learner_answer_attempts a
    INNER JOIN learner_challenge_runs r ON r.id=a.run_id
    WHERE r.account_id=? AND a.is_correct=0
    ORDER BY a.answered_at DESC, a.id DESC
    LIMIT 5000
  `, [learner.id]);
  return buildLearnerReview(rows.map((row) => {
    var _a;
    const question = questionFromJson(row.questionJson);
    return {
      formKey: row.formKey,
      infinitive: row.infinitive || (question == null ? void 0 : question.infinitif) || (question == null ? void 0 : question.titre) || "",
      mode: row.mode || (question == null ? void 0 : question.mode) || "",
      tense: row.tense || (question == null ? void 0 : question.temps) || "",
      person: (question == null ? void 0 : question.pronom) || (question == null ? void 0 : question.saisiePrefixe) || "",
      learnerAnswer: row.learnerAnswer,
      expectedAnswers: ((_a = question == null ? void 0 : question.reponsesPourCorrige) == null ? void 0 : _a.length) ? question.reponsesPourCorrige : (question == null ? void 0 : question.reponses) || [],
      answeredAt: row.answeredAt
    };
  }));
});

export { review_get as default };
//# sourceMappingURL=review.get.mjs.map
