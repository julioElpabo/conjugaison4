const NEAR_FUTURE_TENSE_CODE = "near-future";
const NEAR_FUTURE_TENSE_NAME = "futur proche";
function normalized(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[’]/gu, "'").trim().toLocaleLowerCase("fr");
}
function isNearFutureTense(tense) {
  return normalized(tense.code) === NEAR_FUTURE_TENSE_CODE || normalized(tense.name) === NEAR_FUTURE_TENSE_NAME;
}
function isPronominalNearFutureInfinitive(infinitive) {
  return /^(?:se\s+|s['’])/iu.test(infinitive.trim());
}
function bareNearFutureInfinitive(infinitive) {
  return infinitive.trim().replace(/^(?:se\s+|s['’]\s*)/iu, "");
}
function startsWithElidableSound(value, typeHInitial) {
  const first = normalized(value).charAt(0);
  if ("aeiouy".includes(first)) return true;
  return first === "h" && normalized(typeHInitial) !== "aspire";
}
function nearFutureReflexivePronoun(personId, infinitive, typeHInitial) {
  const elided = startsWithElidableSound(bareNearFutureInfinitive(infinitive), typeHInitial);
  if (personId === 4) return elided ? "m'" : "me ";
  if (personId === 5) return elided ? "t'" : "te ";
  if (personId === 7) return "nous ";
  if (personId === 8) return "vous ";
  return elided ? "s'" : "se ";
}
function buildNearFutureForm(allerForm, infinitive, personId, typeHInitial) {
  const auxiliary = allerForm.trim();
  const lexicalInfinitive = bareNearFutureInfinitive(infinitive);
  if (!auxiliary || !lexicalInfinitive) return "";
  if (!isPronominalNearFutureInfinitive(infinitive)) {
    return `${auxiliary} ${lexicalInfinitive}`;
  }
  return `${auxiliary} ${nearFutureReflexivePronoun(personId, infinitive, typeHInitial)}${lexicalInfinitive}`;
}
function buildNearFutureParadigm(tenseId, verbId, infinitive, auxiliaryForms, options = {}) {
  var _a;
  const allowed = ((_a = options.allowedPersonIds) == null ? void 0 : _a.length) ? new Set(options.allowedPersonIds.map(Number)) : null;
  return auxiliaryForms.filter((form) => !allowed || allowed.has(Number(form.personId))).map((form) => ({
    id: nearFutureSyntheticId(tenseId, verbId, form.personId),
    personId: Number(form.personId),
    tenseId: Number(tenseId),
    pronoun: form.pronoun,
    forms: [...new Set(form.forms.map((allerForm) => buildNearFutureForm(allerForm, infinitive, form.personId, options.typeHInitial)).filter(Boolean))]
  })).filter((form) => form.forms.length > 0);
}
function nearFutureSyntheticId(tenseId, verbId, personId) {
  const absoluteVerbId = Math.abs(Number(verbId));
  const verbPart = absoluteVerbId % 5e6 + (Number(verbId) < 0 ? 5e6 : 0);
  return -(Number(tenseId) * 1e8 + verbPart * 10 + Number(personId));
}

export { isPronominalNearFutureInfinitive as a, buildNearFutureParadigm as b, bareNearFutureInfinitive as c, isNearFutureTense as i, nearFutureReflexivePronoun as n };
//# sourceMappingURL=near-future.mjs.map
