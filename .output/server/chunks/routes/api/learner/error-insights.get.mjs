import { Q as LEARNER_ERROR_TAXONOMY, d as defineEventHandler, s as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
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

function count(value) {
  return Math.max(0, Number(value) || 0);
}
function rate(errors, opportunities) {
  return opportunities ? Math.round(errors / opportunities * 100) : 0;
}
function buildLearnerErrorInsights(sources, examples = /* @__PURE__ */ new Map()) {
  const taxonomy = new Map(LEARNER_ERROR_TAXONOMY.map((item) => [item.code, item]));
  const insights = sources.flatMap((source) => {
    if (source.code === "unknown" || source.code === "orthography.copied_complement") return [];
    const definition = taxonomy.get(source.code);
    const opportunities = count(source.opportunities);
    const errors = count(source.errors);
    if (!definition || !opportunities || !errors) return [];
    const recentOpportunities = count(source.recentOpportunities);
    const recentErrors = count(source.recentErrors);
    const previousOpportunities = count(source.previousOpportunities);
    const previousErrors = count(source.previousErrors);
    const recentErrorRate = recentOpportunities ? rate(recentErrors, recentOpportunities) : null;
    const previousErrorRate = previousOpportunities ? rate(previousErrors, previousOpportunities) : null;
    const hasTrendEvidence = recentOpportunities >= 3 && previousOpportunities >= 3;
    const trendDelta = hasTrendEvidence ? Number(recentErrorRate) - Number(previousErrorRate) : null;
    const trend = trendDelta === null ? "insufficient" : Math.abs(trendDelta) < 5 ? "stable" : trendDelta < 0 ? "improving" : "worsening";
    return [{
      ...definition,
      opportunities,
      errors,
      errorRate: rate(errors, opportunities),
      recentErrorRate,
      previousErrorRate,
      trend,
      trendDelta,
      examples: (examples.get(source.code) || []).slice(0, 3)
    }];
  }).sort((left, right) => right.errors - left.errors || right.errorRate - left.errorRate);
  const primaryCounts = new Map(
    sources.flatMap((source) => {
      var _a;
      return source.code === "unknown" || source.code === "orthography.copied_complement" ? [] : [[source.code, count((_a = source.primaryErrors) != null ? _a : source.errors)]];
    })
  );
  const totalErrors = [...primaryCounts.values()].reduce((total, value) => total + value, 0);
  const first = [...insights].sort(
    (left, right) => (primaryCounts.get(right.code) || 0) - (primaryCounts.get(left.code) || 0)
  )[0];
  const firstPrimaryErrors = first ? primaryCounts.get(first.code) || 0 : 0;
  const dominant = first && totalErrors >= 5 && firstPrimaryErrors >= 3 ? {
    code: first.code,
    label: first.label,
    percent: Math.round(firstPrimaryErrors / totalErrors * 100),
    errors: firstPrimaryErrors
  } : null;
  return { insights, totalErrors, dominant };
}

function questionFromJson(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
const errorInsights_get = defineEventHandler(async (event) => {
  var _a;
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const database = useDatabase();
  const [stats] = await database.execute(`
    SELECT error_type_code AS code,
           SUM(opportunities) AS opportunities,
           SUM(errors) AS errors,
           SUM(IF(stat_date >= CURRENT_DATE - INTERVAL 29 DAY, opportunities, 0)) AS recentOpportunities,
           SUM(IF(stat_date >= CURRENT_DATE - INTERVAL 29 DAY, errors, 0)) AS recentErrors,
           SUM(IF(stat_date BETWEEN CURRENT_DATE - INTERVAL 59 DAY
             AND CURRENT_DATE - INTERVAL 30 DAY, opportunities, 0)) AS previousOpportunities,
           SUM(IF(stat_date BETWEEN CURRENT_DATE - INTERVAL 59 DAY
             AND CURRENT_DATE - INTERVAL 30 DAY, errors, 0)) AS previousErrors
    FROM learner_skill_daily_stats
    WHERE account_id=?
    GROUP BY error_type_code
  `, [learner.id]);
  const [rows] = await database.execute(`
    SELECT tags.error_type_code AS code, tags.confidence,
           attempts.learner_answer AS learnerAnswer, attempts.infinitive,
           attempts.mode_label AS mode, attempts.tense_label AS tense,
           attempts.question_json AS questionJson, attempts.answered_at AS answeredAt
    FROM learner_attempt_error_tags tags
    INNER JOIN learner_answer_attempts attempts ON attempts.id=tags.attempt_id
    INNER JOIN learner_challenge_runs runs ON runs.id=attempts.run_id
    WHERE runs.account_id=? AND tags.is_initial=1
      AND tags.confidence IN ('high', 'medium')
    ORDER BY attempts.answered_at DESC, attempts.id DESC
    LIMIT 500
  `, [learner.id]);
  const [primaryCounts] = await database.execute(`
    SELECT tags.error_type_code AS code, COUNT(*) AS primaryErrors
    FROM learner_attempt_error_tags tags
    INNER JOIN learner_answer_attempts attempts ON attempts.id=tags.attempt_id
    INNER JOIN learner_challenge_runs runs ON runs.id=attempts.run_id
    WHERE runs.account_id=? AND tags.is_initial=1 AND tags.is_primary=1
    GROUP BY tags.error_type_code
  `, [learner.id]);
  const primaryByCode = new Map(primaryCounts.map((row) => [row.code, Number(row.primaryErrors)]));
  const examples = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const current = examples.get(row.code) || [];
    if (current.length >= 3) continue;
    const question = questionFromJson(row.questionJson);
    current.push({
      learnerAnswer: row.learnerAnswer,
      expectedAnswers: [...((_a = question == null ? void 0 : question.reponsesPourCorrige) == null ? void 0 : _a.length) ? question.reponsesPourCorrige : (question == null ? void 0 : question.reponses) || []].slice(0, 4),
      infinitive: row.infinitive || (question == null ? void 0 : question.infinitif) || "",
      mode: row.mode || (question == null ? void 0 : question.mode) || "",
      tense: row.tense || (question == null ? void 0 : question.temps) || "",
      person: (question == null ? void 0 : question.pronom) || (question == null ? void 0 : question.saisiePrefixe) || "",
      answeredAt: row.answeredAt.toISOString(),
      confidence: row.confidence
    });
    examples.set(row.code, current);
  }
  return buildLearnerErrorInsights(stats.map((stat) => ({
    ...stat,
    primaryErrors: primaryByCode.get(stat.code) || 0
  })), examples);
});

export { errorInsights_get as default };
//# sourceMappingURL=error-insights.get.mjs.map
