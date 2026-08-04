import { u as useDatabase, d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { g as generateQuestionnaire } from '../../_/questionnaire.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../_/limited-json-body.mjs';
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
import '../../_/radical-reference.mjs';
import '../../_/pronominal-formatter.mjs';
import '../../_/exercise-instructions.mjs';
import '../../_/near-future.mjs';

function asSentence(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const sentence = /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
  return sentence.charAt(0).toLocaleUpperCase("fr") + sentence.slice(1);
}
function examplesFromQuestions(tenseIds, questions, codByVerb = {}) {
  return Object.fromEntries(tenseIds.flatMap((tenseId) => {
    var _a, _b;
    const candidates = questions.filter((question) => Number(question.tenseId) === tenseId);
    const chosen = (_a = candidates.find((question) => Boolean(question.complement))) != null ? _a : candidates[0];
    const rawCorrection = chosen == null ? void 0 : chosen.reponsesPourCorrige[0];
    const complement = (chosen == null ? void 0 : chosen.verbeId) ? codByVerb[chosen.verbeId] : void 0;
    const correction = rawCorrection && complement && !(chosen == null ? void 0 : chosen.complement) ? withComplement(rawCorrection, complement) : rawCorrection;
    return correction ? [[tenseId, splitSentence(correction, (_b = chosen == null ? void 0 : chosen.complement) != null ? _b : complement)]] : [];
  }));
}
function splitSentence(answer, complement) {
  const sentence = asSentence(answer);
  if (!complement) return { emphasis: sentence, rest: "" };
  const complementIndex = sentence.lastIndexOf(complement);
  if (complementIndex < 0) return { emphasis: sentence, rest: "" };
  return {
    emphasis: sentence.slice(0, complementIndex).trimEnd(),
    rest: sentence.slice(complementIndex).trimStart()
  };
}
function withComplement(answer, complement) {
  var _a, _b;
  const punctuation = (_b = (_a = answer.match(/[!?]$/u)) == null ? void 0 : _a[0]) != null ? _b : "";
  const stem = punctuation ? answer.slice(0, -1).trimEnd() : answer;
  return `${stem} ${complement}${punctuation}`;
}
async function loadCodByVerb(verbIds) {
  var _a, _b;
  const storedIds = verbIds.filter((id) => id > 0);
  if (!storedIds.length) return {};
  const placeholders = storedIds.map(() => "?").join(", ");
  const [rows] = await useDatabase().execute(`
    SELECT vs.verbe_id, c.texte
    FROM verbe_sens vs
    INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
    INNER JOIN complements_verbaux c ON c.construction_id=cv.id
    WHERE vs.verbe_id IN (${placeholders})
      AND cv.actif=1 AND cv.statut_validation='valide' AND cv.fonction_objet='cod'
      AND c.actif=1 AND c.statut_validation='valide'
    ORDER BY RAND()
  `, storedIds);
  const result = {};
  for (const row of rows) (_b = result[_a = Number(row.verbe_id)]) != null ? _b : result[_a] = row.texte;
  return result;
}
function questionnaireRequest(verbIds, tenseIds, questionCount) {
  return {
    verbIds,
    tenseIds,
    questionCount,
    exerciseKind: "conjugation",
    identificationSource: "selected-verbs",
    pastSimplePronouns: "all",
    inclusivePronouns: false,
    includeComplements: true,
    complementPlacement: "after",
    complementOptions: ["cod-after", "coi-after"]
  };
}
async function buildSelectedTenseExamples(verbIds, tenseIds) {
  const [questions, codByVerb] = await Promise.all([
    generateQuestionnaire(questionnaireRequest(verbIds, tenseIds, 500)),
    loadCodByVerb(verbIds)
  ]);
  const examples = examplesFromQuestions(tenseIds, questions, codByVerb);
  const missingTenseIds = tenseIds.filter((tenseId) => !examples[tenseId]);
  if (missingTenseIds.length) {
    const missingQuestions = await Promise.all(missingTenseIds.map((tenseId) => generateQuestionnaire(questionnaireRequest(verbIds, [tenseId], 100))));
    Object.assign(examples, examplesFromQuestions(missingTenseIds, missingQuestions.flat(), codByVerb));
  }
  return examples;
}

function parseIds(value, maximum) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maximum) return null;
  const ids = value.map(Number);
  if (ids.some((id) => !Number.isSafeInteger(id) || id === 0) || new Set(ids).size !== ids.length) return null;
  return ids;
}
const index_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.tenseExamples);
  const body = await readLimitedJsonBody(event, 32 * 1024);
  const verbIds = parseIds(body == null ? void 0 : body.verbIds, 100);
  const tenseIds = parseIds(body == null ? void 0 : body.tenseIds, 50);
  if (!verbIds || !tenseIds || tenseIds.some((id) => id < 0)) {
    throw createError({ statusCode: 400, statusMessage: "S\xE9lection de verbes ou de temps invalide" });
  }
  try {
    return { examples: await buildSelectedTenseExamples(verbIds, tenseIds) };
  } catch (error) {
    console.error("Impossible de g\xE9n\xE9rer les exemples de temps", error);
    throw createError({ statusCode: 500, statusMessage: "Impossible de g\xE9n\xE9rer les exemples" });
  }
});

export { index_post as default };
//# sourceMappingURL=index3.post.mjs.map
