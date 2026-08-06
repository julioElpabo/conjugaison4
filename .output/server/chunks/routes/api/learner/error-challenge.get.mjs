import { d as defineEventHandler, s as setResponseHeader, a as getQuery, Q as LEARNER_ERROR_TAXONOMY, c as createError, u as useDatabase, L as diagnoseLearnerError, N as applicableLearnerErrorTypes } from '../../../nitro/nitro.mjs';
import { g as generateQuestionnaire } from '../../../_/questionnaire.mjs';
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
import '../../../_/radical-reference.mjs';
import '../../../_/pronominal-formatter.mjs';
import '../../../_/passive-voice.mjs';
import '../../../_/near-future.mjs';
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

function parsed(source) {
  try {
    return JSON.parse(source);
  } catch {
    return null;
  }
}
function optionsForError(code, existing) {
  if (code === "agreement.cod_before") return ["cod-before"];
  if (code === "agreement.cod_after") return ["cod-after"];
  if (code === "agreement.coi") return ["coi-before"];
  if (code === "orthography.copied_complement") {
    return ["cod-after", "coi-after"];
  }
  return existing;
}
function shuffled(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
function questionKey(question) {
  return [
    question.verbeId,
    question.tenseId,
    question.personId,
    question.complementPosition,
    question.complementFunction,
    question.complement,
    question.consigne
  ].join("\0");
}
function normalized(value) {
  return String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("fr");
}
const errorChallenge_get = defineEventHandler(async (event) => {
  var _a, _b;
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const code = String(getQuery(event).code || "");
  if (!LEARNER_ERROR_TAXONOMY.some((item) => item.code === code)) {
    throw createError({ statusCode: 400, statusMessage: "Type d\u2019erreur invalide" });
  }
  if (code === "morphology.ending" || code === "person.other_form") {
    throw createError({
      statusCode: 422,
      statusMessage: "Ce type d\u2019erreur ne permet pas de cr\xE9er un d\xE9fi cibl\xE9"
    });
  }
  const database = useDatabase();
  const [rows] = await database.execute(`
    SELECT r.challenge_config_json AS challengeJson,
           a.question_json AS questionJson,
           a.learner_answer AS learnerAnswer
    FROM learner_answer_attempts a
    INNER JOIN learner_challenge_runs r ON r.id=a.run_id
    WHERE r.account_id=?
      AND a.is_correct=0
    ORDER BY a.answered_at DESC, a.id DESC
  `, [learner.id]);
  const sourceQuestions = [];
  const verbIds = /* @__PURE__ */ new Set();
  const tenseIds = /* @__PURE__ */ new Set();
  const complementOptions = /* @__PURE__ */ new Set();
  const confusedTenses = /* @__PURE__ */ new Map();
  let pastSimplePronouns = "third-person-only";
  let inclusivePronouns = false;
  let includeOnPronoun = false;
  const voiceModes = /* @__PURE__ */ new Set();
  let includeComplements = false;
  for (const row of rows) {
    const challenge2 = parsed(row.challengeJson);
    const question = parsed(row.questionJson);
    if (!question) continue;
    const diagnostic = diagnoseLearnerError(row.learnerAnswer, question).find((item) => item.code === code);
    if (!diagnostic) continue;
    const evidence = diagnostic.evidence || {};
    for (const id of (challenge2 == null ? void 0 : challenge2.verbIds) || []) verbIds.add(Number(id));
    for (const id of (challenge2 == null ? void 0 : challenge2.tenseIds) || []) tenseIds.add(Number(id));
    for (const option of (challenge2 == null ? void 0 : challenge2.complementOptions) || []) complementOptions.add(option);
    if ((challenge2 == null ? void 0 : challenge2.pastSimplePronouns) === "all") pastSimplePronouns = "all";
    if (challenge2 == null ? void 0 : challenge2.inclusivePronouns) inclusivePronouns = true;
    if (challenge2 == null ? void 0 : challenge2.includeOnPronoun) includeOnPronoun = true;
    if ((challenge2 == null ? void 0 : challenge2.voiceMode) === "passive") voiceModes.add("passive");
    else if ((challenge2 == null ? void 0 : challenge2.voiceMode) === "mixed") {
      voiceModes.add("active");
      voiceModes.add("passive");
    } else voiceModes.add(question.voice === "passive" ? "passive" : "active");
    if (challenge2 == null ? void 0 : challenge2.includeComplements) includeComplements = true;
    if (applicableLearnerErrorTypes(question).includes(code)) {
      sourceQuestions.push(question);
      if (question.verbeId) verbIds.add(Number(question.verbeId));
      if (question.tenseId) tenseIds.add(Number(question.tenseId));
      if (code === "task.wrong_tense") {
        const expectedTense = evidence.expectedTense || question.temps || "";
        const expectedMode = question.mode || "";
        if (expectedTense) {
          confusedTenses.set(
            `${normalized(expectedMode)}\0${normalized(expectedTense)}`,
            { tense: expectedTense, ...expectedMode ? { mode: expectedMode } : {} }
          );
        }
        const detectedTense = evidence.detectedTense || "";
        const detectedMode = ((_b = (_a = question.conjugationConfusions) == null ? void 0 : _a.find((confusion) => normalized(confusion.tense) === normalized(detectedTense))) == null ? void 0 : _b.mode) || "";
        if (detectedTense) {
          confusedTenses.set(
            `${normalized(detectedMode)}\0${normalized(detectedTense)}`,
            { tense: detectedTense, ...detectedMode ? { mode: detectedMode } : {} }
          );
        }
      }
    }
  }
  if (!sourceQuestions.length || !verbIds.size || !tenseIds.size) {
    throw createError({
      statusCode: 422,
      statusMessage: "Pas assez de questions pour entra\xEEner ce type d\u2019erreur"
    });
  }
  const [availableTenses] = await database.execute(`
    SELECT t.id, t.name, modes.name AS mode,
           t.isTempsCompose AS isCompound
    FROM temps t
    INNER JOIN modes ON modes.id=t.mode_id
  `);
  const selectedTenseIds = code === "agreement.subject" ? availableTenses.filter((tense) => tenseIds.has(Number(tense.id)) && Boolean(tense.isCompound)).map((tense) => Number(tense.id)) : code === "task.wrong_tense" ? availableTenses.filter((tense) => [...confusedTenses.values()].some((confusion) => normalized(confusion.tense) === normalized(tense.name) && (!confusion.mode || normalized(confusion.mode) === normalized(tense.mode)))).map((tense) => Number(tense.id)) : [...tenseIds];
  if (!selectedTenseIds.length) {
    throw createError({
      statusCode: 422,
      statusMessage: "Aucun temps adapt\xE9 \xE0 ce type d\u2019erreur"
    });
  }
  const targetedOptions = optionsForError(code, [...complementOptions]);
  const challenge = {
    verbIds: [...verbIds],
    tenseIds: selectedTenseIds,
    questionCount: 10,
    exerciseKind: "conjugation",
    identificationSource: "selected-verbs",
    pastSimplePronouns,
    inclusivePronouns,
    includeOnPronoun,
    voiceMode: voiceModes.size > 1 ? "mixed" : voiceModes.has("passive") ? "passive" : "active",
    includeComplements: includeComplements || targetedOptions.length > 0,
    complementPlacement: targetedOptions.some((option) => option.endsWith("-before")) ? targetedOptions.some((option) => option.endsWith("-after")) ? "mixed" : "before" : "after",
    complementOptions: targetedOptions
  };
  let generated = [];
  try {
    generated = await generateQuestionnaire({ ...challenge, questionCount: 100 });
  } catch {
  }
  const candidates = shuffled([...sourceQuestions, ...generated]).filter((question) => applicableLearnerErrorTypes(question).includes(code));
  const unique = [...new Map(candidates.map((question) => [questionKey(question), question])).values()];
  if (!unique.length) {
    throw createError({
      statusCode: 422,
      statusMessage: "Aucune question adapt\xE9e \xE0 ce type d\u2019erreur"
    });
  }
  const questions = Array.from({ length: 10 }, (_, index) => ({
    ...unique[index % unique.length],
    id: `error-${code.replaceAll(".", "-")}-${index + 1}`
  }));
  return { challenge, questions };
});

export { errorChallenge_get as default };
//# sourceMappingURL=error-challenge.get.mjs.map
