import { c as createError } from '../nitro/nitro.mjs';
import { createHash } from 'node:crypto';

const SAFE_IDENTIFIER = /^[A-Za-z0-9_-]{8,100}$/u;
const SAFE_FINGERPRINT = /^[a-f0-9]{64}$/u;
function learnerRunIdentifier(value) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!SAFE_IDENTIFIER.test(candidate)) {
    throw createError({ statusCode: 400, statusMessage: "Identifiant de s\xE9ance invalide" });
  }
  return candidate;
}
function learnerAttemptIdentifier(value) {
  return learnerRunIdentifier(value);
}
function integerList(value, maximum = 1e3) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0 && item <= 1e7))].slice(0, maximum);
}
function learnerChallengeSnapshot(value) {
  if (!value || typeof value !== "object") {
    throw createError({ statusCode: 400, statusMessage: "D\xE9fi invalide" });
  }
  const candidate = value;
  const exerciseKind = candidate.exerciseKind === "tense-identification" || candidate.exerciseKind === "mode-identification" ? candidate.exerciseKind : "conjugation";
  const questionCount = Math.min(200, Math.max(1, Number(candidate.questionCount) || 1));
  const description = typeof candidate.description === "string" ? candidate.description.trim().slice(0, 1e3) : "";
  const trainingReportTitle = typeof candidate.trainingReportTitle === "string" ? candidate.trainingReportTitle.trim().slice(0, 200) : "";
  return {
    ...description ? { description } : {},
    ...trainingReportTitle ? { trainingReportTitle } : {},
    verbIds: integerList(candidate.verbIds),
    tenseIds: integerList(candidate.tenseIds),
    questionCount,
    exerciseKind,
    identificationSource: candidate.identificationSource === "literary-corpus" ? "literary-corpus" : "selected-verbs",
    pastSimplePronouns: candidate.pastSimplePronouns === "third-person-only" ? "third-person-only" : "all",
    inclusivePronouns: candidate.inclusivePronouns === true,
    includeOnPronoun: candidate.includeOnPronoun === true,
    learningSupportMode: candidate.learningSupportMode === "cif-fle" ? "cif-fle" : "normal",
    voiceMode: ["active", "passive", "mixed"].includes(String(candidate.voiceMode)) ? candidate.voiceMode : "active",
    includeComplements: candidate.includeComplements === true,
    complementPlacement: ["after", "mixed", "before"].includes(String(candidate.complementPlacement)) ? candidate.complementPlacement : "after",
    complementOptions: Array.isArray(candidate.complementOptions) ? candidate.complementOptions.filter((item) => ["cod-after", "cod-before", "coi-after", "coi-before"].includes(String(item))).slice(0, 4) : []
  };
}
function learnerChallengeFingerprint(snapshot, supplied) {
  if (typeof supplied === "string" && SAFE_FINGERPRINT.test(supplied)) return supplied;
  const {
    description: _description,
    trainingReportTitle: _trainingReportTitle,
    ...challengeDefinition
  } = snapshot;
  const stable = {
    ...challengeDefinition,
    verbIds: [...snapshot.verbIds].sort((left, right) => left - right),
    tenseIds: [...snapshot.tenseIds].sort((left, right) => left - right),
    complementOptions: [...snapshot.complementOptions || []].sort()
  };
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}
function shortText(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
function boundedText(value, maximum) {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}
function learnerQuestionSnapshot(value) {
  var _a;
  if (!value || typeof value !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Question invalide" });
  }
  const question = value;
  const answers = Array.isArray(question.reponses) ? question.reponses.map((item) => shortText(item, 300)).filter(Boolean).slice(0, 8) : [];
  const correctionAnswers = Array.isArray(question.reponsesPourCorrige) ? question.reponsesPourCorrige.map((item) => shortText(item, 500)).filter(Boolean).slice(0, 8) : [];
  const futureSimpleAnswers = Array.isArray(question.futureSimpleAnswers) ? question.futureSimpleAnswers.map((item) => shortText(item, 300)).filter(Boolean).slice(0, 8) : [];
  const conjugationConfusions = Array.isArray(question.conjugationConfusions) ? question.conjugationConfusions.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const source = candidate;
    const answers2 = Array.isArray(source.answers) ? source.answers.map((item) => shortText(item, 300)).filter(Boolean).slice(0, 8) : [];
    const tense = shortText(source.tense, 100);
    const mode = shortText(source.mode, 100);
    return tense && mode && answers2.length ? [{ tense, mode, answers: answers2 }] : [];
  }).slice(0, 40) : [];
  if (!answers.length && !correctionAnswers.length) {
    throw createError({ statusCode: 400, statusMessage: "R\xE9ponses de la question manquantes" });
  }
  const number = (candidate) => {
    const parsed = Number(candidate);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : void 0;
  };
  const radicalReference = question.radicalReference && typeof question.radicalReference === "object" ? question.radicalReference : null;
  const paradigmForms = Array.isArray(radicalReference == null ? void 0 : radicalReference.paradigmForms) ? radicalReference.paradigmForms.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const source = candidate;
    const subject = shortText(source.subject, 100);
    const form = shortText(source.form, 300);
    const personId = number(source.personId);
    return subject && form && personId ? [{ subject, form, personId }] : [];
  }).slice(0, 12) : [];
  const agreement = question.agreementReminder && typeof question.agreementReminder === "object" ? question.agreementReminder : null;
  const agreementKind = ["cod-before", "cod-after", "coi"].includes(String(agreement == null ? void 0 : agreement.kind)) ? agreement == null ? void 0 : agreement.kind : null;
  const citation = question.literaryCitation && typeof question.literaryCitation === "object" ? question.literaryCitation : null;
  const citationTarget = shortText(citation == null ? void 0 : citation.target, 200);
  return {
    titre: shortText(question.titre, 300),
    instruction: shortText(question.instruction, 300) || void 0,
    consigne: shortText(question.consigne, 500),
    reponses: answers,
    reponsesPourCorrige: correctionAnswers,
    futureSimpleAnswers: futureSimpleAnswers.length ? futureSimpleAnswers : void 0,
    conjugationConfusions: conjugationConfusions.length ? conjugationConfusions : void 0,
    verbeId: number(question.verbeId),
    tenseId: number(question.tenseId),
    personId: (_a = number(question.personId)) != null ? _a : null,
    infinitif: shortText(question.infinitif, 100) || void 0,
    pronom: shortText(question.pronom, 100) || void 0,
    temps: shortText(question.temps, 100) || void 0,
    mode: shortText(question.mode, 100) || void 0,
    isCompound: question.isCompound === true,
    conjugaison1: shortText(question.conjugaison1, 300) || void 0,
    conjugaison2: shortText(question.conjugaison2, 300) || void 0,
    conjugaison3: shortText(question.conjugaison3, 300) || void 0,
    radicalReference: paradigmForms.length ? {
      kind: "memorized-form",
      label: "",
      form: "",
      removableEnding: "",
      radical: "",
      paradigmForms
    } : void 0,
    complement: shortText(question.complement, 300) || void 0,
    complementPosition: question.complementPosition === "before" ? "before" : question.complementPosition === "after" ? "after" : void 0,
    complementFunction: question.complementFunction === "coi" ? "coi" : question.complementFunction === "cod" ? "cod" : void 0,
    saisiePrefixe: shortText(question.saisiePrefixe, 200) || void 0,
    agreementReminder: agreementKind ? {
      kind: agreementKind,
      infinitive: shortText(agreement == null ? void 0 : agreement.infinitive, 100),
      complement: shortText(agreement == null ? void 0 : agreement.complement, 300),
      preposition: shortText(agreement == null ? void 0 : agreement.preposition, 50) || null,
      participle: shortText(agreement == null ? void 0 : agreement.participle, 100),
      gender: (agreement == null ? void 0 : agreement.gender) === "feminin" || (agreement == null ? void 0 : agreement.gender) === "masculin" ? agreement.gender : null,
      number: (agreement == null ? void 0 : agreement.number) === "pluriel" || (agreement == null ? void 0 : agreement.number) === "singulier" ? agreement.number : null
    } : void 0,
    literaryCitation: citation && citationTarget ? {
      before: boundedText(citation.before, 500),
      target: citationTarget,
      after: boundedText(citation.after, 500),
      author: shortText(citation.author, 200),
      work: shortText(citation.work, 300),
      chapter: shortText(citation.chapter, 200) || null,
      sourceUrl: shortText(citation.sourceUrl, 500)
    } : void 0
  };
}
function learnerFormKey(question, exerciseKind) {
  const source = [
    exerciseKind,
    question.verbeId || question.infinitif || "",
    question.tenseId || question.temps || "",
    question.personId || question.pronom || question.saisiePrefixe || "",
    question.reponses[0] || question.reponsesPourCorrige[0] || ""
  ].join("|");
  return createHash("sha256").update(source).digest("hex");
}
function learnerChallengeLabel(value) {
  const label = shortText(value, 160);
  return label || "D\xE9fi personnalis\xE9";
}

export { learnerAttemptIdentifier as a, learnerChallengeSnapshot as b, learnerChallengeFingerprint as c, learnerChallengeLabel as d, learnerQuestionSnapshot as e, learnerFormKey as f, learnerRunIdentifier as l };
//# sourceMappingURL=learner-progress.mjs.map
