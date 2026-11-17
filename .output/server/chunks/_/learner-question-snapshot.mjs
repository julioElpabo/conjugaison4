import { b as buildRadicalReference } from './radical-reference.mjs';

function compactLearnerQuestion(question) {
  return {
    exerciseKind: question.exerciseKind,
    titre: question.titre,
    instruction: question.instruction,
    consigne: question.consigne,
    reponses: [...question.reponses],
    reponsesPourCorrige: [...question.reponsesPourCorrige],
    futureSimpleAnswers: question.futureSimpleAnswers ? [...question.futureSimpleAnswers] : void 0,
    conjugationConfusions: question.conjugationConfusions ? question.conjugationConfusions.map((confusion) => ({
      tense: confusion.tense,
      mode: confusion.mode,
      answers: [...confusion.answers]
    })) : void 0,
    verbeId: question.verbeId,
    tenseId: question.tenseId,
    personId: question.personId,
    infinitif: question.infinitif,
    pronom: question.pronom,
    temps: question.temps,
    mode: question.mode,
    isCompound: question.isCompound,
    pastParticiple: question.pastParticiple,
    voice: question.voice,
    passiveSubject: question.passiveSubject,
    passiveAgent: question.passiveAgent,
    auxiliaryChoices: question.auxiliaryChoices ? [...question.auxiliaryChoices] : void 0,
    preferredAuxiliary: question.preferredAuxiliary,
    conjugaison1: question.conjugaison1,
    conjugaison2: question.conjugaison2,
    conjugaison3: question.conjugaison3,
    radicalReference: cloneDiagnosticReference(question.radicalReference),
    complement: question.complement,
    complementPosition: question.complementPosition,
    complementFunction: question.complementFunction,
    saisiePrefixe: question.saisiePrefixe,
    agreementReminder: question.agreementReminder ? { ...question.agreementReminder } : void 0,
    literaryCitation: question.literaryCitation ? { ...question.literaryCitation } : void 0
  };
}
function cloneDiagnosticReference(reference) {
  if (!reference) return void 0;
  return {
    ...reference,
    ...reference.paradigmForms ? { paradigmForms: reference.paradigmForms.map((form) => ({ ...form })) } : {},
    ...reference.imperativePresentReferences ? { imperativePresentReferences: reference.imperativePresentReferences.map((form) => ({ ...form })) } : {},
    ...reference.subjunctivePresentReferences ? { subjunctivePresentReferences: reference.subjunctivePresentReferences.map((form) => ({ ...form })) } : {},
    ...reference.subjunctivePresentForms ? { subjunctivePresentForms: reference.subjunctivePresentForms.map((form) => ({ ...form })) } : {}
  };
}
function restoreDiagnosticReference(question, source) {
  var _a, _b;
  const legacy = question.radicalReference;
  if (!source) return legacy;
  const text = (value) => typeof value === "string" ? value.trim().slice(0, 300) : "";
  const personIds = { je: 4, tu: 5, il: 6, nous: 7, vous: 8, ils: 9 };
  const forms = ((legacy == null ? void 0 : legacy.paradigmForms) || []).map((item) => ({
    ...item,
    mode: question.mode || "",
    tense: question.temps || "",
    pronoun: item.subject
  })).filter((item) => !(Array.isArray(source.subjunctivePresentForms) && item.mode === "subjonctif" && item.tense === "pr\xE9sent"));
  if (Array.isArray(source.subjunctivePresentForms)) {
    for (const item of source.subjunctivePresentForms.slice(0, 12)) {
      if (!item || typeof item !== "object") continue;
      const personId = Number(item.personId);
      if (![4, 5, 6, 7, 8, 9].includes(personId) || !text(item.form)) continue;
      forms.push({ mode: "subjonctif", tense: "pr\xE9sent", personId, pronoun: text(item.subject), form: text(item.form) });
    }
  }
  const referenceSubject = text(source.referenceSubject);
  if (personIds[referenceSubject] && text(source.form)) {
    forms.push({
      mode: text(source.referenceMode),
      tense: text(source.referenceTense),
      personId: personIds[referenceSubject],
      pronoun: referenceSubject,
      form: text(source.form)
    });
  }
  for (const key of ["imperativePresentReferences", "subjunctivePresentReferences"]) {
    if (!Array.isArray(source[key])) continue;
    for (const item of source[key].slice(0, 6)) {
      if (!item || typeof item !== "object") continue;
      const subject = text(item.subject);
      if (!personIds[subject] || !text(item.form)) continue;
      forms.push({ mode: "indicatif", tense: "pr\xE9sent", personId: personIds[subject], pronoun: subject, form: text(item.form) });
    }
  }
  if (!question.conjugaison1 || !question.infinitif) return legacy;
  const rebuilt = buildRadicalReference({
    infinitive: question.infinitif,
    mode: question.mode || "",
    tense: question.temps || "",
    personId: (_a = question.personId) != null ? _a : null,
    conjugation: question.conjugaison1,
    isCompound: question.isCompound
  }, forms);
  return rebuilt ? { ...rebuilt, ...((_b = legacy == null ? void 0 : legacy.paradigmForms) == null ? void 0 : _b.length) ? { paradigmForms: legacy.paradigmForms } : {} } : legacy;
}

export { compactLearnerQuestion as c, restoreDiagnosticReference as r };
//# sourceMappingURL=learner-question-snapshot.mjs.map
