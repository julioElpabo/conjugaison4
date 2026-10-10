import { af as normalizeAnswer } from '../nitro/nitro.mjs';

const INFINITIVE_IDENTIFICATION_INSTRUCTION = "Quel est l\u2019infinitif du verbe surlign\xE9\xA0?";
const INFINITIVE_AMBIGUITY_NOTICE = "Cette forme peut correspondre \xE0 plusieurs verbes. Un infinitif possible suffit.";
function infinitiveFormKey(form) {
  return normalizeAnswer(form.replace(/[.!?…]+\s*$/u, ""));
}
function infinitiveAnswers(infinitives) {
  const answers = [...new Set(infinitives.map((value) => value.trim()).filter(Boolean))];
  if (answers.includes("asseoir")) answers.push("assoir");
  return [...new Set(answers)];
}
const french = (message, parameters = {}) => message.replace(/\{(\w+)\}/gu, (_, key) => {
  var _a;
  return String((_a = parameters[key]) != null ? _a : `{${key}}`);
});
function infinitiveHelpVerb(infinitive, verbs) {
  const key = normalizeAnswer(infinitive, { ignoreWhitespace: false });
  const verbKey = (verb) => normalizeAnswer(verb.infinitif, { ignoreWhitespace: false });
  return verbs.find((verb) => verbKey(verb) === key) || verbs.find((verb) => verbKey(verb) === key.replace(/^(?:se\s+|s')/u, ""));
}
function infinitiveIdentificationGroupHints(question, verbs, translate = french) {
  return [...new Set(question.reponsesPourCorrige.map((infinitive) => {
    const verb = infinitiveHelpVerb(infinitive, verbs);
    const group = verb == null ? void 0 : verb.groupeConjugaison;
    const groupLabel = group === 1 ? translate("1er groupe") : group === 2 ? translate("2e groupe") : group === 3 ? translate("3e groupe") : "";
    return groupLabel ? translate("Ce verbe fait partie du {group}.", { group: groupLabel }) : "";
  }).filter(Boolean))];
}
function infinitiveIdentificationEndingHints(question, translate = french) {
  return [...new Set(question.reponsesPourCorrige.map((infinitive) => {
    var _a;
    const ending = (_a = infinitive.match(/(?:oir|er|[iï]r|re)$/u)) == null ? void 0 : _a[0];
    return ending ? translate("Son infinitif se termine par \xAB -{ending} \xBB.", { ending }) : "";
  }).filter(Boolean))];
}
function infinitiveIdentificationHint(question, translate = french) {
  var _a;
  if (question.reponsesPourCorrige.length > 1) return translate(INFINITIVE_AMBIGUITY_NOTICE);
  if (/^(?:se\s|s[’'])/iu.test(question.infinitif || "")) {
    return translate("C\u2019est un verbe pronominal : conserve \xAB se \xBB ou \xAB s\u2019 \xBB devant son infinitif.");
  }
  if (question.isCompound) {
    return translate("Rep\xE8re le participe pass\xE9. Cherche l\u2019infinitif du verbe principal, pas celui de l\u2019auxiliaire.");
  }
  const infinitive = question.reponsesPourCorrige[0] || "";
  const ending = (_a = infinitive.match(/(?:oir|er|[iï]r|re)$/u)) == null ? void 0 : _a[0];
  return ending ? translate("Son infinitif se termine par \xAB -{ending} \xBB.", { ending }) : translate("L\u2019infinitif est la forme du verbe donn\xE9e dans le dictionnaire.");
}
function infinitiveIdentificationFeedback(question, answer, translate = french) {
  if (question.reponsesPourCorrige.length > 1) {
    return translate("Sans autre contexte, plusieurs infinitifs conviennent. Une seule de ces r\xE9ponses suffit.");
  }
  if (/^(?:se\s|s[’'])/iu.test(question.infinitif || "")) {
    return translate("Le pronom fait partie du verbe pronominal : on le conserve sous la forme \xAB se \xBB ou \xAB s\u2019 \xBB \xE0 l\u2019infinitif.");
  }
  if (question.isCompound) {
    return ["avoir", "\xEAtre"].includes(normalizeAnswer(answer || "")) ? translate("Tu as donn\xE9 l\u2019infinitif de l\u2019auxiliaire. Ici, on cherche celui du verbe principal, port\xE9 par le participe pass\xE9.") : translate("\xC0 un temps compos\xE9, l\u2019auxiliaire accompagne le verbe principal. C\u2019est l\u2019infinitif de ce dernier qu\u2019on cherche.");
  }
  return translate("L\u2019infinitif est la forme du verbe donn\xE9e dans le dictionnaire.");
}

export { INFINITIVE_AMBIGUITY_NOTICE as I, infinitiveIdentificationGroupHints as a, infinitiveIdentificationEndingHints as b, infinitiveFormKey as c, INFINITIVE_IDENTIFICATION_INSTRUCTION as d, infinitiveAnswers as e, infinitiveIdentificationHint as f, infinitiveIdentificationFeedback as g, infinitiveHelpVerb as i };
//# sourceMappingURL=infinitive-identification2.mjs.map
