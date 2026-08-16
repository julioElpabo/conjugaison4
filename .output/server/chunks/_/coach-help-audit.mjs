import { i as isNearFutureTense, a as bareNearFutureInfinitive, c as isPronominalNearFutureInfinitive } from './near-future.mjs';
import { a as COACH_HELP_ENGINE_KEYS } from './coach.mjs';

const semanticMeanings = {
  mouvement: "exprime un mouvement ou un d\xE9placement",
  position: "exprime une position ou un changement de position",
  perception: "exprime ce que l\u2019on per\xE7oit avec les sens",
  manipulation: "exprime une action faite sur un objet",
  "creation-transformation": "exprime une cr\xE9ation ou une transformation",
  communication: "sert \xE0 communiquer une parole, une id\xE9e ou une information",
  cognition: "exprime une pens\xE9e, une connaissance ou un apprentissage",
  emotion: "exprime une \xE9motion, un go\xFBt ou une appr\xE9ciation",
  modalite: "pr\xE9cise ce qui est possible, n\xE9cessaire ou souhait\xE9",
  "relation-sociale": "exprime une relation ou une action avec d\u2019autres personnes",
  echange: "exprime un \xE9change, un don ou une transmission",
  corps: "exprime une action ou un besoin du corps",
  nature: "d\xE9crit un ph\xE9nom\xE8ne naturel",
  "action-processus": "exprime une action ou un processus"
};
const particularityLabels = {
  pronominal: "C\u2019est un verbe pronominal : le pronom r\xE9fl\xE9chi change avec la personne.",
  impersonnel: "Ce verbe s\u2019emploie surtout \xE0 la 3e personne du singulier.",
  defectif: "Ce verbe ne poss\xE8de pas toutes les formes de conjugaison.",
  "formes-alternatives": "Plusieurs formes peuvent \xEAtre admises pour cette conjugaison.",
  "auxiliaire-variable": "Selon son sens, ce verbe peut changer d\u2019auxiliaire aux temps compos\xE9s."
};
function normalized$1(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[’]/g, "'").trim().toLocaleLowerCase("fr");
}
function normalizedStrict(value) {
  return (value || "").replace(/[’]/g, "'").replace(/\s+/gu, " ").trim().toLocaleLowerCase("fr");
}
function unique(items) {
  return [...new Set(items.map((item) => item == null ? void 0 : item.trim()).filter((item) => Boolean(item)))];
}
function bareInfinitive(infinitive) {
  return infinitive.replace(/^(?:se\s+|s['’])/iu, "").trim();
}
function lexicalStem(infinitive, termination) {
  const bare = bareInfinitive(infinitive);
  const suffix = termination == null ? void 0 : termination.trim();
  if (suffix && normalized$1(bare).endsWith(normalized$1(suffix))) {
    return bare.slice(0, Math.max(1, bare.length - suffix.length));
  }
  return bare.replace(/(?:er|ir|re|oir)$/iu, "") || bare;
}
function groupLabel(verb) {
  if (!(verb == null ? void 0 : verb.groupeConjugaison)) return "groupe \xE0 v\xE9rifier";
  return `${verb.groupeConjugaison}${verb.groupeConjugaison === 1 ? "er" : "e"} groupe`;
}
function escapedHtml(value) {
  return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#39;");
}
function rememberedFormMarkup(value, capitalize = true) {
  const trimmed = value.trim();
  const displayed = capitalize ? trimmed.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr")) : trimmed;
  return `<mark><strong>${escapedHtml(displayed)}</strong></mark>`;
}
function rememberedFormBadgeMarkup(value) {
  const displayed = value.trim().replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
  return `<samp><strong>${escapedHtml(displayed)}</strong></samp>`;
}
function resultFormMarkup(value, capitalize = true) {
  const trimmed = value.trim();
  const displayed = capitalize ? trimmed.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr")) : trimmed;
  return `<strong>${escapedHtml(displayed)}</strong>`;
}
function startsWithVowelSound(value, verb) {
  const first = normalized$1(value).charAt(0);
  if (first === "h") return (verb == null ? void 0 : verb.typeHInitial) !== "aspire";
  return "aeiouy".includes(first);
}
function isPronominalInfinitive(value, verb) {
  return /^(?:se\s+|s['’])/iu.test(value.trim()) || (verb == null ? void 0 : verb.isPronominalForm) || Boolean((verb == null ? void 0 : verb.typePronominal) && verb.typePronominal !== "aucun");
}
function reflexivePronounForVerb(subject, form, verb) {
  const key = subjectKey(subject);
  const elide = startsWithVowelSound(form, verb);
  if (key === "je") return elide ? "m\u2019" : "me";
  if (key === "tu") return elide ? "t\u2019" : "te";
  if (["il", "elle", "on", "ils", "elles"].includes(key)) return elide ? "s\u2019" : "se";
  if (key === "nous") return "nous";
  if (key === "vous") return "vous";
  return "";
}
function capitalizedDisplay(value) {
  return value.trim().replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
}
function displayedConjugatedForm(subject, form, infinitive, verb) {
  const cleanSubject = subject.trim();
  const cleanForm = form.trim();
  if (!cleanSubject) return capitalizedDisplay(cleanForm);
  if (isPronominalInfinitive(infinitive, verb)) {
    const coreForm = conjugatedCore$1(cleanForm);
    const reflexive = reflexivePronounForVerb(cleanSubject, coreForm, verb);
    const separator = reflexive.endsWith("\u2019") ? "" : " ";
    return capitalizedDisplay(`${cleanSubject} ${reflexive}${separator}${coreForm}`);
  }
  if (subjectKey(cleanSubject) === "je" && startsWithVowelSound(cleanForm)) return `J\u2019${cleanForm}`;
  return capitalizedDisplay(`${cleanSubject} ${cleanForm}`);
}
function displayedAnswerForm(question, infinitive, verb) {
  const answer = (question.conjugaison1 || "").trim();
  if (!answer) return "";
  if (isPronominalInfinitive(infinitive, verb)) {
    return displayedConjugatedForm(question.pronom || question.saisiePrefixe || "", conjugatedCore$1(answer), infinitive, verb);
  }
  return capitalizedDisplay(conjugatedCore$1(answer));
}
function displayedStoredFormOnly(subject, form, infinitive, verb) {
  const core = conjugatedCore$1(form);
  if (!isPronominalInfinitive(infinitive, verb)) return core;
  const reflexive = reflexivePronounForVerb(subject, core, verb);
  const separator = reflexive.endsWith("\u2019") ? "" : " ";
  return `${reflexive}${separator}${core}`;
}
function pronominalAnswerHelp(subject, coreForm, infinitive, verb, storedForm = "", highlight = true) {
  if (!isPronominalInfinitive(infinitive, verb) || !coreForm.trim()) return "";
  const reflexive = reflexivePronounForVerb(subject, coreForm, verb);
  const stored = storedForm.trim();
  const display = stored && subjectKey(stored) === subjectKey(subject) && normalized$1(conjugatedCore$1(stored)) === normalized$1(coreForm) ? stored : displayedStoredFormOnly(subject, coreForm, infinitive, verb);
  if (!reflexive || normalized$1(display) === normalized$1(coreForm)) return "";
  const form = highlight ? rememberedFormMarkup(display) : resultFormMarkup(display);
  return `<p>Avec <strong>${escapedHtml(subjectKey(subject) || subject)}</strong>, le pronom r\xE9fl\xE9chi est <strong>${escapedHtml(reflexive)}</strong>.</p><p>${form}</p>`;
}
function auxiliaryChoicesMarkup(active) {
  const option = (auxiliary) => active === auxiliary ? rememberedFormMarkup(auxiliary) : `<kbd>${escapedHtml(auxiliary.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr")))}</kbd>`;
  return `<p>${option("avoir")}</p><p>${option("\xEAtre")}</p>`;
}
function knowledgeCaption() {
  return "<figcaption>\xC0 savoir par c\u0153ur<i>\u2665</i></figcaption>";
}
function radicalBadge(value, withBoundary = true) {
  const radical = value.trim().replace(/-$/u, "");
  return `<var>${escapedHtml(radical)}${withBoundary ? "-" : ""}</var>`;
}
function endingBadge(value, withBoundary = true) {
  const ending = value.trim().replace(/^-/u, "");
  return `<samp>${withBoundary ? "-" : ""}${escapedHtml(ending)}</samp>`;
}
function removedEndingBadge(value) {
  const ending = value.trim().replace(/^-/u, "");
  return `<kbd>-${escapedHtml(ending)}</kbd>`;
}
function assembledFormBadges(base, ending) {
  return `<span>${radicalBadge(base, false)}${endingBadge(ending, false)}</span>`;
}
function adjustedAssemblyBadges(initialBase, adjustedBase, ending) {
  const initial = initialBase.trim().replace(/-$/u, "");
  const adjusted = adjustedBase.trim().replace(/-$/u, "");
  if (normalized$1(initial) === `${normalized$1(adjusted)}e`) {
    return `<span>${radicalBadge(adjusted, false)}<del>e</del>${endingBadge(ending, false)}</span>`;
  }
  return assembledFormBadges(initial, ending);
}
function verbGroupDescription(verb, infinitive) {
  var _a, _b, _c;
  const group = verb == null ? void 0 : verb.groupeConjugaison;
  const bare = bareInfinitive(infinitive);
  const ending = ((_a = verb == null ? void 0 : verb.terminaison) == null ? void 0 : _a.trim()) || ((_c = (_b = bare.match(/(oir|re|ir|er)$/iu)) == null ? void 0 : _b[1]) == null ? void 0 : _c.toLocaleLowerCase("fr")) || "";
  const groupNames = { 1: "premier groupe", 2: "deuxi\xE8me groupe", 3: "troisi\xE8me groupe" };
  if (!group) return "un verbe dont le groupe n\u2019est pas renseign\xE9";
  return `un verbe${ending ? ` en <strong>-${escapedHtml(ending)}</strong>` : ""} (${groupNames[group]})`;
}
function tenseContext(question, tense) {
  var _a;
  const rawMode = (question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name) || "").trim();
  const rawTense = (question.temps || (tense == null ? void 0 : tense.name) || "").trim();
  const mode = normalized$1(rawMode);
  const time = rawTense.toLocaleLowerCase("fr");
  const normalizedTime = normalized$1(rawTense);
  const timeWithArticle = `${/^(imparfait|imperatif|infinitif)$/u.test(normalizedTime) ? "\xE0 l\u2019" : "au "}${time}`;
  if (!rawMode) return timeWithArticle;
  if (mode === "participe") return `au participe ${time}`;
  if (mode === "gerondif") return `au g\xE9rondif ${time}`;
  if (mode === "infinitif") return `\xE0 l\u2019infinitif ${time}`;
  const modeWithArticle = /^(indicatif|imperatif)$/u.test(mode) ? `de l\u2019${rawMode.toLocaleLowerCase("fr")}` : `du ${rawMode.toLocaleLowerCase("fr")}`;
  return `${timeWithArticle} ${modeWithArticle}`;
}
function endingPronouns(mode, count) {
  const normalizedMode = normalized$1(mode);
  const pronouns = normalizedMode === "imperatif" ? ["tu", "nous", "vous"] : normalizedMode === "subjonctif" ? ["que je", "que tu", "qu\u2019il / elle / on", "que nous", "que vous", "qu\u2019ils / elles"] : ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
  return pronouns.slice(0, count);
}
function withDeArticle(value) {
  const label = value.trim().toLocaleLowerCase("fr");
  const first = normalized$1(label).charAt(0);
  return `${"aeiouy".includes(first) ? "de l\u2019" : "du "}${label}`;
}
function withAArticle(value) {
  const label = value.trim().toLocaleLowerCase("fr");
  const first = normalized$1(label).charAt(0);
  return `${"aeiouy".includes(first) ? "\xE0 l\u2019" : "au "}${label}`;
}
function endingsKnowledgeTitle(question, tense) {
  var _a;
  const tenseName = (question.temps || (tense == null ? void 0 : tense.name) || "").trim();
  const modeName = (question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name) || "").trim();
  const tensePart = tenseName ? withDeArticle(tenseName) : "du temps demand\xE9";
  return `Terminaisons ${tensePart}${modeName ? ` ${withDeArticle(modeName)}` : ""}`;
}
function subjectIndex(question) {
  const subject = normalized$1(question.pronom || question.saisiePrefixe).replace(/^(?:que\s+|qu')/u, "");
  if (/^(je|j')/.test(subject)) return 0;
  if (/^tu\b/.test(subject)) return 1;
  if (/^(il|elle|on)\b/.test(subject)) return 2;
  if (/^nous\b/.test(subject)) return 3;
  if (/^vous\b/.test(subject)) return 4;
  if (/^(ils|elles)\b/.test(subject)) return 5;
  return null;
}
function hasFamilyIndependentEndings(question, verb, tense) {
  var _a;
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  const group = verb == null ? void 0 : verb.groupeConjugaison;
  if (mode === "indicatif" && time === "passe simple" && group !== 1 && group !== 2) return false;
  if (mode === "subjonctif" && time === "present" && group === 3) return false;
  return true;
}
function conjugatedCore$1(form) {
  return form.trim().replace(/[.!?…]+$/gu, "").replace(/^(?:je|j['’]|tu|il|elle|on|nous|vous|ils|elles)\s+/iu, "").replace(/^(?:me|te|se|nous|vous)\s+/iu, "").replace(/^[mts]['’]/iu, "").trim();
}
function subjectKey(value) {
  var _a, _b;
  const subject = normalized$1(value).replace(/^(?:que\s+|qu')/u, "");
  if (/^(?:je|j')/u.test(subject)) return "je";
  if (/^tu\b/u.test(subject)) return "tu";
  if (/^(?:il|elle|on)\b/u.test(subject)) return ((_a = subject.match(/^(?:il|elle|on)/u)) == null ? void 0 : _a[0]) || subject;
  if (/^nous\b/u.test(subject)) return "nous";
  if (/^vous\b/u.test(subject)) return "vous";
  if (/^(?:ils|elles)\b/u.test(subject)) return ((_b = subject.match(/^(?:ils|elles)/u)) == null ? void 0 : _b[0]) || subject;
  return subject;
}
function referenceSubjectGroup(value) {
  const subject = subjectKey(value);
  if (["il", "elle", "on"].includes(subject)) return "third-singular";
  if (["ils", "elles"].includes(subject)) return "third-plural";
  return subject;
}
function requestedFormIsReference(question, reference) {
  const requestedForm = normalizedStrict(conjugatedCore$1(question.conjugaison1 || ""));
  const referenceForm = normalizedStrict(conjugatedCore$1(reference.form));
  const referenceSubject = referenceSubjectGroup(reference.referenceSubject);
  const requestedSubject = referenceSubjectGroup(question.pronom || question.saisiePrefixe);
  return Boolean(requestedForm && requestedForm === referenceForm && (!referenceSubject || requestedSubject === referenceSubject));
}
function stripLeadingHyphen(value) {
  return value.trim().replace(/^-/u, "");
}
function stripTrailingHyphen(value) {
  return value.trim().replace(/-$/u, "");
}
function adjustReferenceStemForEnding(stem, infinitive, ending) {
  const bare = normalized$1(bareInfinitive(infinitive));
  const normalizedEnding = normalized$1(ending);
  if (bare.endsWith("ger") && normalized$1(stem).endsWith("ge") && /^(?:i|e)/u.test(normalizedEnding)) {
    return stem.slice(0, -1);
  }
  if (bare.endsWith("cer") && stem.toLocaleLowerCase("fr").endsWith("\xE7") && /^(?:i|e)/u.test(normalizedEnding)) {
    return `${stem.slice(0, -1)}c`;
  }
  return stem;
}
function pastSimpleSeriesFromReference(form) {
  const normalizedForm = normalized$1(form);
  if (normalizedForm.endsWith("int")) return { stem: form.slice(0, -3), endings: ["ins", "ins", "int", "\xEEnmes", "\xEEntes", "inrent"] };
  if (normalizedForm.endsWith("ut")) return { stem: form.slice(0, -2), endings: ["us", "us", "ut", "\xFBmes", "\xFBtes", "urent"] };
  if (normalizedForm.endsWith("it")) return { stem: form.slice(0, -2), endings: ["is", "is", "it", "\xEEmes", "\xEEtes", "irent"] };
  if (normalizedForm.endsWith("a")) return { stem: form.slice(0, -1), endings: ["ai", "as", "a", "\xE2mes", "\xE2tes", "\xE8rent"] };
  return null;
}
function subjunctiveImperfectRootAndEndings(form) {
  const normalizedForm = normalized$1(form);
  if (normalizedForm.endsWith("int")) return { root: form.slice(0, -3), removable: form.slice(-3), endings: ["insse", "insses", "\xEEnt", "inssions", "inssiez", "inssent"] };
  if (normalizedForm.endsWith("ut")) return { root: form.slice(0, -2), removable: form.slice(-2), endings: ["usse", "usses", "\xFBt", "ussions", "ussiez", "ussent"] };
  if (normalizedForm.endsWith("it")) return { root: form.slice(0, -2), removable: form.slice(-2), endings: ["isse", "isses", "\xEEt", "issions", "issiez", "issent"] };
  if (normalizedForm.endsWith("a")) return { root: form.slice(0, -1), removable: form.slice(-1), endings: ["asse", "asses", "\xE2t", "assions", "assiez", "assent"] };
  return null;
}
function subjunctiveImperfectSeriesFromReference(form) {
  const normalizedForm = normalized$1(form);
  if (normalizedForm.endsWith("int")) {
    const root = form.slice(0, -3);
    return { stem: root, accentedThird: `${root}\xEEnt`, endings: ["insse", "insses", "", "inssions", "inssiez", "inssent"] };
  }
  if (normalizedForm.endsWith("ut")) {
    const root = form.slice(0, -2);
    return { stem: root, accentedThird: `${root}\xFBt`, endings: ["usse", "usses", "", "ussions", "ussiez", "ussent"] };
  }
  if (normalizedForm.endsWith("it")) {
    const root = form.slice(0, -2);
    return { stem: root, accentedThird: `${root}\xEEt`, endings: ["isse", "isses", "", "issions", "issiez", "issent"] };
  }
  if (normalizedForm.endsWith("a")) {
    const root = form.slice(0, -1);
    return { stem: root, accentedThird: `${root}\xE2t`, endings: ["asse", "asses", "", "assions", "assiez", "assent"] };
  }
  return null;
}
function referenceDerivedRows(question, reference, verb, tense, rule) {
  var _a, _b, _c;
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "";
  const requestedPerson = subjectIndex(question);
  const pronouns = endingPronouns(question.mode || ((_b = tense == null ? void 0 : tense.mode) == null ? void 0 : _b.name) || "", 6);
  let stem = "";
  let endings = [];
  let fixedForms = [];
  let lead = "";
  if ((_c = reference.paradigmForms) == null ? void 0 : _c.length) {
    const rows2 = reference.paradigmForms.map(({ subject, form, personId }) => {
      const displayForm = isPronominalInfinitive(infinitive, verb) ? displayedConjugatedForm(subject, form, infinitive, verb) : form;
      const formMarkup = personId === question.personId ? rememberedFormMarkup(displayForm, false) : `<strong>${escapedHtml(displayForm)}</strong>`;
      return `<tr><th><strong>${escapedHtml(subject)}</strong></th><td>${formMarkup}</td></tr>`;
    }).join("");
    return rows2 ? {
      stem: "",
      rows: rows2,
      lead: `Cette forme rep\xE8re te permettra de conjuguer le verbe <strong>${escapedHtml(infinitive || "demand\xE9")}</strong> au m\xEAme temps \xE0 toutes les personnes :`
    } : null;
  }
  if (mode === "indicatif" && time === "passe simple" && reference.kind === "past-simple-il") {
    const series = pastSimpleSeriesFromReference(reference.form);
    if (!series) return null;
    stem = series.stem;
    endings = series.endings;
    if (normalized$1(reference.form).endsWith("ut") || normalized$1(reference.form).endsWith("int")) {
      lead = "Cette forme rep\xE8re est utile car elle te permet de construire toutes les autres formes conjugu\xE9es du pass\xE9 simple de l\u2019indicatif :";
    }
  } else if (mode === "subjonctif" && time === "imparfait" && reference.kind === "past-simple-il") {
    const series = subjunctiveImperfectSeriesFromReference(reference.form);
    if (!series) return null;
    stem = series.stem;
    endings = series.endings;
    fixedForms = [null, null, series.accentedThird, null, null, null];
  } else if (rule.endingItems.length >= 3 && rule.endingsKind === "endings") {
    stem = reference.removableEnding && reference.form.endsWith(reference.removableEnding) ? reference.form.slice(0, -reference.removableEnding.length) : stripTrailingHyphen(reference.radical);
    endings = rule.endingItems.map(stripLeadingHyphen);
  }
  if (!stem || !endings.length) return null;
  const rows = endings.map((ending, index) => {
    const pronoun = pronouns[index] || `forme ${index + 1}`;
    const adjustedStem = adjustReferenceStemForEnding(stem, infinitive, ending);
    const form = fixedForms[index] || `${adjustedStem}${ending}`;
    const displayForm = isPronominalInfinitive(infinitive, verb) ? displayedConjugatedForm(pronoun, form, infinitive, verb) : form;
    const formMarkup = index === requestedPerson ? rememberedFormMarkup(displayForm, false) : `<strong>${escapedHtml(displayForm)}</strong>`;
    return `<tr><th><strong>${escapedHtml(pronoun)}</strong></th><td>${formMarkup}</td></tr>`;
  }).join("");
  return rows ? { stem, rows, lead } : null;
}
function referenceUsefulnessHtml(question, tense, reference, verb) {
  const rule = tenseRule(question, verb, tense);
  const derived = referenceDerivedRows(question, reference, verb, tense, rule);
  if (!derived) return "";
  const context = tenseContext(question, tense);
  const lead = derived.lead || `Cette forme rep\xE8re est utile parce qu\u2019elle donne le point de d\xE9part ${radicalBadge(derived.stem)}. Avec les terminaisons, tu peux construire les formes ${escapedHtml(context)} :`;
  return `<figure><figcaption>En effet</figcaption><blockquote><p>${lead}</p><table><tbody>${derived.rows}</tbody></table></blockquote></figure>`;
}
function requestedReferenceVerificationHtml(question, reference, tense) {
  var _a;
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  if (mode !== "indicatif" || time !== "present") return "";
  if (!reference.removableEnding || reference.targetEnding === void 0) return "";
  const sourceStem = reference.form.endsWith(reference.removableEnding) ? reference.form.slice(0, -reference.removableEnding.length) : stripTrailingHyphen(reference.radical);
  const ending = stripLeadingHyphen(reference.targetEnding);
  if (!sourceStem || !ending) return "";
  const pronoun = question.pronom || question.saisiePrefixe || "cette personne";
  return `<figure><figcaption>V\xE9rifie la r\xE9ponse</figcaption><blockquote><p>Avec <strong>${escapedHtml(pronoun)}</strong> au pr\xE9sent, tu peux v\xE9rifier : radical ${radicalBadge(sourceStem)} + terminaison ${endingBadge(ending)}.</p><b>${assembledFormBadges(sourceStem, ending)}<i>\u2713</i></b></blockquote></figure>`;
}
function requestedReferenceHelpHtml(question, tense, reference, verb) {
  var _a;
  const subject = ((_a = reference.referenceSubject) == null ? void 0 : _a.trim()) || question.pronom || question.saisiePrefixe || "";
  const requestedSubject = question.pronom || question.saisiePrefixe || "";
  const sameDisplayedSubject = referenceSubjectGroup(subject) === referenceSubjectGroup(requestedSubject);
  const display = displayedConjugatedForm(subject, reference.form, question.infinitif || (verb == null ? void 0 : verb.infinitif) || "", verb);
  const intro = sameDisplayedSubject ? `La forme demand\xE9e est justement la <strong>forme rep\xE8re</strong> ${escapedHtml(tenseContext(question, tense))}.` : `La forme demand\xE9e utilise la m\xEAme forme verbale que cette <strong>forme rep\xE8re</strong> ${escapedHtml(tenseContext(question, tense))}.`;
  const decomposition = decomposeConjugationForm(question, verb, tense);
  const construction = decomposition ? `<figure><figcaption>Construis la r\xE9ponse</figcaption><blockquote><p>Tu peux aussi la reconstruire : radical ${radicalBadge(decomposition.base)} + terminaison ${endingBadge(decomposition.ending)}.</p><b>${assembledFormBadges(decomposition.base, decomposition.ending)}<i>\u2713</i></b>${pronominalAnswerHelp(requestedSubject, conjugatedCore$1(question.conjugaison1 || ""), question.infinitif || (verb == null ? void 0 : verb.infinitif) || "", verb, question.conjugaison1 || "")}</blockquote></figure>` : requestedReferenceVerificationHtml(question, reference, tense);
  return `<figure>${knowledgeCaption()}<blockquote><strong>Forme rep\xE8re</strong><p>${intro} Apprends-la par c\u0153ur, c\u2019est tr\xE8s utile :</p><p>${rememberedFormBadgeMarkup(display)}</p></blockquote></figure>${construction}${referenceUsefulnessHtml(question, tense, reference, verb)}`;
}
function shouldUseReferenceMethodForRegularForm(question, reference, verb, tense) {
  var _a;
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "";
  if (isPronominalInfinitive(infinitive, verb)) return true;
  if (mode === "indicatif" && time === "present" && ((verb == null ? void 0 : verb.groupeConjugaison) === 1 || (verb == null ? void 0 : verb.groupeConjugaison) === 2)) {
    return false;
  }
  if (mode === "indicatif" && time === "futur" && reference.kind === "future-stem") {
    const bare = bareInfinitive(infinitive);
    const regularRadical = bare.endsWith("re") ? bare.slice(0, -1) : bare;
    if (normalizedStrict(stripTrailingHyphen(reference.radical)) === normalizedStrict(regularRadical)) return false;
  }
  return true;
}
function nearFutureHelpHtml(question, revealAnswers = true) {
  var _a, _b, _c, _d;
  const infinitive = ((_a = question.infinitif) == null ? void 0 : _a.trim()) || "ce verbe";
  const lexicalInfinitive = bareNearFutureInfinitive(infinitive);
  const subject = ((_b = question.pronom) == null ? void 0 : _b.trim()) || ((_c = question.saisiePrefixe) == null ? void 0 : _c.trim()) || "la personne demand\xE9e";
  const officialForm = ((_d = question.conjugaison1) == null ? void 0 : _d.trim()) || "";
  const allerForm = officialForm.split(/\s+/u)[0] || "";
  const pronominal = isPronominalNearFutureInfinitive(infinitive);
  const allerRows = [
    ["je", "vais"],
    ["tu", "vas"],
    ["il / elle / on", "va"],
    ["nous", "allons"],
    ["vous", "allez"],
    ["ils / elles", "vont"]
  ].map(([pronoun, form]) => `<tr><th>${escapedHtml(pronoun)}</th><td><strong>${escapedHtml(form)}</strong></td></tr>`).join("");
  const construction = pronominal ? `<li>Garde le verbe \xE0 l\u2019infinitif : <strong>${escapedHtml(lexicalInfinitive)}</strong>.</li><li>Place le pronom r\xE9fl\xE9chi adapt\xE9 \u2014 <strong>me, te, se, nous, vous, se</strong> \u2014 juste devant cet infinitif.</li>` : `<li>Garde le verbe \xE0 l\u2019infinitif : <strong>${escapedHtml(lexicalInfinitive)}</strong>.</li>`;
  const chosenAller = revealAnswers && allerForm ? `Avec <strong>${escapedHtml(subject)}</strong>, choisis <strong>${escapedHtml(allerForm)}</strong>.` : `Choisis la forme de <strong>aller</strong> qui correspond \xE0 <strong>${escapedHtml(subject)}</strong>.`;
  const result = revealAnswers && officialForm ? `<blockquote><strong>R\xE9sultat</strong><p>${resultFormMarkup(`${subject} ${officialForm}`)}</p></blockquote>` : "";
  const pronominalReminder = pronominal ? "<blockquote><strong>Attention \xE0 l\u2019ordre</strong><p>Le pronom r\xE9fl\xE9chi ne se place pas devant \xAB aller \xBB : on dit <em>je vais me lever</em>, et non <em>je me vais lever</em>.</p></blockquote>" : "";
  return `<figure>${knowledgeCaption()}<blockquote><strong>\xAB Aller \xBB au pr\xE9sent</strong><p>Le futur proche est une construction : <strong>aller au pr\xE9sent + infinitif</strong>.</p><table><tbody>${allerRows}</tbody></table></blockquote></figure><figure><figcaption>Construis le futur proche</figcaption><ol><li>${chosenAller}</li>${construction}</ol>${result}</figure>${pronominalReminder}`;
}
function imperativePresentHelpHtml(question, reference) {
  const subject = subjectKey(question.pronom || question.saisiePrefixe);
  const references = (reference == null ? void 0 : reference.imperativePresentReferences) || [];
  const requestedReference = references.find((item) => item.subject === subject);
  const referenceRows = references.map((item) => `<tr><th><strong>${escapedHtml(item.subject)}</strong></th><td>${rememberedFormMarkup(`${item.subject} ${item.form}`)}</td></tr>`).join("");
  const referencesMenu = referenceRows ? `<details><summary>Consulter les formes avec tu, nous et vous</summary><table><tbody>${referenceRows}</tbody></table></details>` : "<p>Les formes du pr\xE9sent de l\u2019indicatif ne sont pas disponibles pour ce verbe.</p>";
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>Pr\xE9sent de l\u2019indicatif : tu, nous, vous</strong><p>Apprends par c\u0153ur ces trois formes. Elles servent de formes rep\xE8res pour construire l\u2019imp\xE9ratif.</p>${referencesMenu}</blockquote></figure>`;
  const actualForm = conjugatedCore$1(question.conjugaison1 || "");
  const capitalizedResult = actualForm.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
  const sourceForm = (requestedReference == null ? void 0 : requestedReference.form) || (reference == null ? void 0 : reference.form) || "";
  const regularTarget = subject === "tu" && /(?:es|as)$/iu.test(sourceForm) ? sourceForm.slice(0, -1) : sourceForm;
  const isException = Boolean(sourceForm && normalized$1(regularTarget) !== normalized$1(actualForm));
  const referenceStep = requestedReference ? `Avec <strong>${escapedHtml(subject)}</strong>, pars de la forme du pr\xE9sent de l\u2019indicatif :<br>${rememberedFormMarkup(`${subject} ${requestedReference.form}`)}` : `Choisis la forme du pr\xE9sent de l\u2019indicatif qui correspond \xE0 <strong>${escapedHtml(subject || "la personne demand\xE9e")}</strong>.`;
  const verificationStep = isException ? "Ce verbe fait exception : sa forme \xE0 l\u2019imp\xE9ratif doit aussi \xEAtre apprise par c\u0153ur. Regarde les exceptions plus bas." : subject === "tu" ? "V\xE9rifie s\u2019il faut garder ou enlever le <strong>s</strong>. Regarde le bloc \xAB s ou pas s avec tu \xBB plus bas." : "";
  const result = actualForm ? `<blockquote><strong>R\xE9sultat</strong><p>${resultFormMarkup(capitalizedResult, false)}</p></blockquote>` : "";
  const verificationItem = verificationStep ? `<li>${verificationStep}</li>` : "";
  const construction = `<figure><figcaption>Construis la r\xE9ponse</figcaption><ol><li>${referenceStep}</li><li>Garde la forme verbale, mais n\u2019\xE9cris pas le pronom sujet.</li>${verificationItem}</ol>${result}</figure>`;
  const sRule = subject === "tu" && sourceForm ? normalized$1(sourceForm) !== normalized$1(actualForm) ? `<figure><figcaption>S ou pas s avec tu</figcaption><blockquote><strong>Ici : pas de s final</strong><p>La forme au pr\xE9sent est <strong>${escapedHtml(sourceForm)}</strong>. \xC0 l\u2019imp\xE9ratif avec <strong>tu</strong>, on enl\xE8ve le <strong>s</strong> final : <strong>${escapedHtml(actualForm)}</strong>.</p><p>Si <strong>en</strong> ou <strong>y</strong> vient juste apr\xE8s, le <strong>s</strong> revient : <em>manges-en</em>, <em>vas-y</em>.</p></blockquote></figure>` : `<figure><figcaption>S ou pas s avec tu</figcaption><blockquote><strong>Ici : garde le s final</strong><p>La forme au pr\xE9sent est <strong>${escapedHtml(sourceForm)}</strong>. Pour ce verbe, l\u2019imp\xE9ratif avec <strong>tu</strong> garde cette forme sans le pronom sujet.</p></blockquote></figure>` : "";
  return `${knowledge}${construction}${sRule}`;
}
function subjunctiveImperfectHelpHtml(question, reference, verb, tense, approach) {
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "";
  const requestedPerson = subjectIndex(question);
  const referenceForm = reference.form || "";
  const series = subjunctiveImperfectRootAndEndings(referenceForm);
  const endings = (series == null ? void 0 : series.endings) || ["sse", "sses", "t", "ssions", "ssiez", "ssent"];
  const removableEnding = (series == null ? void 0 : series.removable) || reference.removableEnding || "";
  const rawRadical = (series == null ? void 0 : series.root) || (removableEnding && referenceForm.endsWith(removableEnding) ? referenceForm.slice(0, -removableEnding.length) : reference.radical || "");
  const targetEnding = stripLeadingHyphen(
    reference.targetEnding || (requestedPerson === null ? "" : endings[requestedPerson] || "")
  );
  const radical = targetEnding ? adjustReferenceStemForEnding(rawRadical, infinitive, targetEnding) : reference.radical || rawRadical;
  const referenceSubject = reference.referenceSubject || "il";
  const displayedReference = displayedConjugatedForm(referenceSubject, referenceForm, infinitive, verb);
  const highlightedReference = displayedReference ? rememberedFormMarkup(displayedReference) : "";
  const pronouns = endingPronouns("subjonctif", endings.length);
  const endingRows = endings.map((ending, index) => `<tr><th><strong>${escapedHtml(pronouns[index] || "")}</strong></th><td>${index === requestedPerson ? endingBadge(ending) : `<strong>-${escapedHtml(ending)}</strong>`}</td></tr>`).join("");
  const endingsBlock = `<blockquote><strong>${escapedHtml(endingsKnowledgeTitle(question, tense))}</strong><table><tbody>${endingRows}</tbody></table></blockquote>`;
  const knowledgeBlock = `<figure>${knowledgeCaption()}<blockquote><strong>Forme rep\xE8re</strong><p>Voici la forme rep\xE8re au pass\xE9 simple de l\u2019indicatif. Apprends-la par c\u0153ur, c\u2019est tr\xE8s utile :</p><p>${highlightedReference}</p></blockquote>${endingsBlock}</figure>`;
  const usefulnessBlock = referenceUsefulnessHtml(question, tense, reference, verb);
  const removeInstruction = removableEnding ? `Enl\xE8ve ${removedEndingBadge(removableEnding)} : tu obtiens le point de d\xE9part ${radicalBadge(rawRadical)}.` : `Garde le radical ${radicalBadge(radical)}.`;
  const radicalBlock = approach === "guided-discovery" ? `<figure><figcaption>Trouve le radical</figcaption><details><summary>Indice 1 \xB7 La forme rep\xE8re</summary><p>Prends la forme rep\xE8re :<br>${highlightedReference}</p></details><details><summary>Indice 2 \xB7 Le radical</summary><p>${removeInstruction}</p></details></figure>` : `<figure><figcaption>Trouve le radical</figcaption><ol><li>Prends la forme rep\xE8re :<br>${highlightedReference}</li><li>${removeInstruction}</li></ol></figure>`;
  const answerDisplay = displayedAnswerForm(question, infinitive, verb);
  const answerMarkup = radical && targetEnding ? `<b>${assembledFormBadges(radical, targetEnding)}<i>\u2713</i></b>` : rememberedFormMarkup(answerDisplay || question.conjugaison1 || "");
  const pronominalResult = isPronominalInfinitive(infinitive, verb) && answerDisplay ? pronominalAnswerHelp(question.pronom || question.saisiePrefixe || "", conjugatedCore$1(question.conjugaison1 || ""), infinitive, verb, question.conjugaison1 || "") : "";
  const answerBlock = `<figure><figcaption>Construis la r\xE9ponse</figcaption><blockquote><p>Ajoute ${endingBadge(targetEnding)} au point de d\xE9part ${radicalBadge(radical)} :</p>${answerMarkup}${pronominalResult}</blockquote></figure>`;
  return `${knowledgeBlock}${radicalBlock}${answerBlock}${usefulnessBlock}`;
}
function subjunctivePresentHelpHtml(question, reference, verb) {
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "";
  const requestedPerson = subjectIndex(question);
  const requestedForm = conjugatedCore$1(question.conjugaison1 || "");
  const requestedSubject = question.pronom || question.saisiePrefixe || "";
  const requestedDisplay = displayedStoredFormOnly(requestedSubject, requestedForm, infinitive, verb);
  const endings = ["e", "es", "e", "ions", "iez", "ent"];
  const pronouns = endingPronouns("subjonctif", endings.length);
  const indicativeReferences = (reference == null ? void 0 : reference.subjunctivePresentReferences) || [];
  const ilsReference = indicativeReferences.find((item) => item.subject === "ils");
  const nousReference = indicativeReferences.find((item) => item.subject === "nous");
  const usesVerifiedReference = (reference == null ? void 0 : reference.kind) === "present-ils" || (reference == null ? void 0 : reference.kind) === "present-nous";
  if (!usesVerifiedReference) {
    const storedForms = (reference == null ? void 0 : reference.subjunctivePresentForms) || [];
    const rows = pronouns.map((pronoun, index) => {
      var _a;
      const personId = [4, 5, 6, 7, 8, 9][index];
      const stored = (_a = storedForms.find((item) => item.personId === personId)) == null ? void 0 : _a.form;
      const form = stored || (index === requestedPerson ? requestedForm : "");
      if (!form) return "";
      const display = displayedStoredFormOnly(pronoun, form, infinitive, verb);
      return `<tr><th><strong>${escapedHtml(pronoun)}</strong></th><td>${index === requestedPerson ? rememberedFormMarkup(display) : `<strong>${escapedHtml(display)}</strong>`}</td></tr>`;
    }).join("");
    const knowledge2 = `<figure>${knowledgeCaption()}<blockquote><strong>Formes particuli\xE8res du subjonctif pr\xE9sent</strong><p>Le verbe <strong>${escapedHtml(question.infinitif || "demand\xE9")}</strong> est irr\xE9gulier ici. Les formes avec <strong>ils</strong> et <strong>nous</strong> au pr\xE9sent de l\u2019indicatif ne suffisent pas pour construire s\xFBrement toutes les personnes.</p>${rows ? `<table><tbody>${rows}</tbody></table>` : `<p>${rememberedFormMarkup(requestedForm)}</p>`}</blockquote></figure>`;
    const pronominalHelp = pronominalAnswerHelp(requestedSubject, requestedForm, infinitive, verb, question.conjugaison1 || "", false);
    const answer = `<figure><figcaption>Construis la r\xE9ponse</figcaption><ol><li>Rep\xE8re la personne demand\xE9e.</li><li>Choisis la forme du subjonctif pr\xE9sent dans le tableau et apprends-la par c\u0153ur.</li></ol><blockquote><strong>R\xE9sultat</strong><p>${resultFormMarkup(requestedDisplay || requestedForm)}</p>${pronominalHelp}</blockquote></figure>`;
    return `${knowledge2}${answer}`;
  }
  const referenceRows = `<p>Pour <strong>que je, que tu, qu\u2019il / elle / on</strong> et <strong>qu\u2019ils / elles</strong>, pars de la forme avec <strong>ils</strong> au pr\xE9sent de l\u2019indicatif :</p>${ilsReference ? `<p>${rememberedFormMarkup(displayedConjugatedForm("ils", ilsReference.form, infinitive, verb))}</p>` : ""}<p>Pour <strong>que nous</strong> et <strong>que vous</strong>, pars de la forme avec <strong>nous</strong> au pr\xE9sent de l\u2019indicatif :</p>${nousReference ? `<p>${rememberedFormMarkup(displayedConjugatedForm("nous", nousReference.form, infinitive, verb))}</p>` : ""}`;
  const endingRows = endings.map((ending2, index) => `<tr><th><strong>${escapedHtml(pronouns[index] || "")}</strong></th><td>${index === requestedPerson ? endingBadge(ending2) : `<strong>-${escapedHtml(ending2)}</strong>`}</td></tr>`).join("");
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>Deux formes rep\xE8res</strong><p>Apprends ces deux formes. Elles permettent de construire toutes les personnes du subjonctif pr\xE9sent.</p>${referenceRows}</blockquote><blockquote><strong>Terminaisons du subjonctif pr\xE9sent</strong><table><tbody>${endingRows}</tbody></table></blockquote></figure>`;
  const sourceSubject = (reference == null ? void 0 : reference.referenceSubject) || (requestedPerson === 3 || requestedPerson === 4 ? "nous" : "ils");
  const sourceForm = (reference == null ? void 0 : reference.form) || (sourceSubject === "nous" ? nousReference == null ? void 0 : nousReference.form : ilsReference == null ? void 0 : ilsReference.form) || "";
  const removableEnding = (reference == null ? void 0 : reference.removableEnding) || (sourceSubject === "nous" ? "ons" : "ent");
  const sourceDisplay = displayedConjugatedForm(sourceSubject, sourceForm, infinitive, verb);
  const requestedIsSource = Boolean(sourceForm) && referenceSubjectGroup(sourceSubject) === referenceSubjectGroup(requestedSubject) && normalized$1(sourceForm) === normalized$1(requestedForm);
  if (requestedIsSource) {
    const result = requestedDisplay || displayedStoredFormOnly(requestedSubject, requestedForm, infinitive, verb) || requestedForm;
    const construction2 = `<figure><figcaption>Construis la r\xE9ponse</figcaption><blockquote><p>La forme demand\xE9e est une <strong>forme rep\xE8re</strong>. Apprends-la par c\u0153ur.</p><p>Au subjonctif, \xE9cris-la apr\xE8s <strong>que</strong> quand la phrase le demande.</p><p>${rememberedFormMarkup(result)}</p></blockquote></figure>`;
    return `${knowledge}${referenceUsefulnessHtml(question, void 0, reference, verb)}${construction2}`;
  }
  const rawRadical = sourceForm.endsWith(removableEnding) ? sourceForm.slice(0, -removableEnding.length) : (reference == null ? void 0 : reference.radical) || "";
  const radical = (reference == null ? void 0 : reference.radical) || rawRadical;
  const ending = (reference == null ? void 0 : reference.targetEnding) || (requestedPerson === null ? "" : endings[requestedPerson] || "");
  const bare = normalized$1(bareInfinitive(question.infinitif || ""));
  const adjustmentExplanation = bare.endsWith("ger") && normalized$1(rawRadical).endsWith("ge") && normalized$1(radical).endsWith("g") ? "Si la lettre <strong>g</strong> est suivie de <strong>i</strong>, pas besoin de <strong>e</strong>. Regarde l\u2019explication plus bas." : bare.endsWith("cer") && rawRadical.toLocaleLowerCase("fr").endsWith("\xE7") && normalized$1(radical).endsWith("c") ? "Devant <strong>i</strong>, la c\xE9dille ne sert pas. Regarde l\u2019explication plus bas." : "Le radical s\u2019adapte devant cette terminaison.";
  const adjustment = normalized$1(rawRadical) !== normalized$1(radical) ? `<li>${adjustmentExplanation} ${radicalBadge(rawRadical)} devient ${radicalBadge(radical)}.</li>` : "";
  const assembly = radical && ending ? assembledFormBadges(radical, ending) : resultFormMarkup(requestedForm);
  const pronominalResult = pronominalAnswerHelp(requestedSubject, requestedForm, infinitive, verb, question.conjugaison1 || "", false);
  const construction = `<figure><figcaption>Construis la r\xE9ponse</figcaption><ol><li>Pars de la forme avec <strong>${escapedHtml(sourceSubject)}</strong> au pr\xE9sent de l\u2019indicatif :<br>${rememberedFormMarkup(sourceDisplay)}</li><li>Enl\xE8ve ${removedEndingBadge(removableEnding)} : il reste le radical ${radicalBadge(rawRadical)}.</li>${adjustment}<li>Ajoute ${endingBadge(ending)}.</li></ol><blockquote><strong>R\xE9sultat</strong><p>${assembly}</p>${pronominalResult}</blockquote></figure>`;
  return `${knowledge}${construction}`;
}
function conditionalPresentHelpHtml(question, verb, reference, revealAnswers = true) {
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe";
  const bare = bareInfinitive(infinitive);
  const requestedPerson = subjectIndex(question);
  const endings = ["ais", "ais", "ait", "ions", "iez", "aient"];
  const ending = (reference == null ? void 0 : reference.targetEnding) || (requestedPerson === null ? "" : endings[requestedPerson] || "");
  const actualForm = conjugatedCore$1(question.conjugaison1 || "");
  const decomposedRadical = ending && normalized$1(actualForm).endsWith(normalized$1(ending)) ? actualForm.slice(0, -ending.length) : "";
  const futureRadical = (reference == null ? void 0 : reference.radical) || decomposedRadical;
  const regularRadical = normalized$1(bare).endsWith("re") ? bare.slice(0, -1) : bare;
  const regularRadicalKey = stripTrailingHyphen(regularRadical);
  const futureRadicalKey = stripTrailingHyphen(futureRadical);
  const isRegularRadical = Boolean(futureRadical && normalizedStrict(futureRadicalKey) === normalizedStrict(regularRadicalKey));
  const isAccentAlternation = Boolean(
    futureRadical && normalized$1(futureRadicalKey) === normalized$1(regularRadicalKey) && normalizedStrict(futureRadicalKey) !== normalizedStrict(regularRadicalKey)
  );
  const referenceSubject = (reference == null ? void 0 : reference.referenceSubject) || "je";
  const referenceDisplay = (reference == null ? void 0 : reference.form) ? displayedConjugatedForm(referenceSubject, reference.form, infinitive, verb) : "";
  const endingRows = endings.map((item, index) => `<tr><th><strong>${escapedHtml(endingPronouns("conditionnel", endings.length)[index] || "")}</strong></th><td>${revealAnswers && index === requestedPerson ? endingBadge(item) : `<strong>-${escapedHtml(item)}</strong>`}</td></tr>`).join("");
  const exampleIndex = requestedPerson != null ? requestedPerson : 0;
  const exampleSubject = (question.pronom || question.saisiePrefixe || endingPronouns("conditionnel", endings.length)[exampleIndex] || "je").trim();
  const exampleVerb = normalized$1(bare) === "prendre" ? { radical: "chanter" } : { radical: "prendr" };
  const exampleEnding = endings[exampleIndex] || endings[0];
  const answerFreeExample = `<p><strong>Exemple :</strong><br><strong>${escapedHtml(exampleSubject)}</strong> ${assembledFormBadges(exampleVerb.radical, exampleEnding)}</p>`;
  const referenceKnowledge = referenceDisplay && !isRegularRadical ? `<blockquote><strong>Forme rep\xE8re du futur</strong><p>Apprends par c\u0153ur cette forme rep\xE8re. Elle donne le radical du futur :</p><p>${rememberedFormMarkup(referenceDisplay)}</p></blockquote>` : "";
  const knowledge = `<figure>${knowledgeCaption()}<blockquote><strong>La formule</strong><p><strong>Conditionnel pr\xE9sent</strong> = ${radicalBadge("radical du futur")} + ${endingBadge("terminaisons de l\u2019imparfait", false)}.</p></blockquote>${referenceKnowledge}<blockquote><strong>Terminaisons de l\u2019imparfait</strong><table><tbody>${endingRows}</tbody></table></blockquote></figure>`;
  const radicalConstruction = !revealAnswers ? `<ol><li>Pars de l\u2019infinitif : <strong>${escapedHtml(bare)}</strong>.</li></ol>` : isRegularRadical ? normalized$1(bare).endsWith("re") ? `<ol><li>Pars de l\u2019infinitif : <strong>${escapedHtml(bare)}</strong>.</li><li>Enl\xE8ve le <strong>e</strong> final : tu obtiens ${radicalBadge(futureRadical)}.</li></ol>` : `<ol><li>Pars de l\u2019infinitif : <strong>${escapedHtml(bare)}</strong>.</li><li>Garde tout l\u2019infinitif : le radical du futur est ${radicalBadge(futureRadical)}.</li></ol>` : isAccentAlternation ? `<ol><li>Pars de l\u2019infinitif : <strong>${escapedHtml(bare)}</strong>.</li><li>Le radical du futur change d\u2019accent : ${radicalBadge(regularRadical)} devient ${radicalBadge(futureRadical)}.</li></ol>` : referenceDisplay ? `<ol><li>Pars de la forme rep\xE8re au futur :<br>${rememberedFormMarkup(referenceDisplay)}</li><li>Enl\xE8ve ${removedEndingBadge((reference == null ? void 0 : reference.removableEnding) || "ai")} : tu obtiens ${radicalBadge(futureRadical)}.</li></ol>` : `<p>Pour ce verbe, apprends le radical du futur : ${radicalBadge(futureRadical)}.</p>`;
  const radicalBlock = `<figure><figcaption>Trouve le radical du futur</figcaption>${radicalConstruction}</figure>`;
  const assembly = futureRadical && ending ? assembledFormBadges(futureRadical, ending) : rememberedFormMarkup(actualForm);
  const answer = revealAnswers ? `<figure><figcaption>Construis la r\xE9ponse</figcaption><blockquote><p>Ajoute la terminaison de l\u2019imparfait ${endingBadge(ending)} au radical du futur ${radicalBadge(futureRadical)} :</p><b>${assembly}<i>\u2713</i></b></blockquote></figure>` : `<figure><figcaption>Construis la r\xE9ponse</figcaption><blockquote><p>Ajoute au radical du futur la terminaison de l\u2019imparfait qui correspond \xE0 la personne demand\xE9e.</p>${answerFreeExample}</blockquote></figure>`;
  return `${knowledge}${radicalBlock}${answer}`;
}
function futureStem(infinitive) {
  const bare = normalized$1(bareInfinitive(infinitive));
  const known = {
    etre: "ser-",
    avoir: "aur-",
    aller: "ir-",
    faire: "fer-",
    venir: "viendr-",
    tenir: "tiendr-",
    voir: "verr-",
    pouvoir: "pourr-",
    vouloir: "voudr-",
    savoir: "saur-",
    devoir: "devr-",
    recevoir: "recevr-",
    envoyer: "enverr-",
    courir: "courr-",
    mourir: "mourr-",
    falloir: "faudr-",
    pleuvoir: "pleuvr-",
    valoir: "vaudr-",
    asseoir: "assi\xE9r- ou assoir-",
    acqu\u00E9rir: "acquerr-"
  };
  if (known[bare]) return known[bare];
  const visible = bareInfinitive(infinitive);
  return `${visible.endsWith("re") ? visible.slice(0, -1) : visible}-`;
}
function requestedFormLabel(question, tense) {
  var _a;
  const rawMode = (question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name) || "").trim();
  const mode = normalized$1(rawMode);
  const displayedMode = rawMode.toLocaleLowerCase("fr");
  const time = (question.temps || (tense == null ? void 0 : tense.name) || "").trim();
  const normalizedTime = normalized$1(time);
  const timeWithArticle = `${/^(imparfait|imperatif|infinitif)$/u.test(normalizedTime) ? "l\u2019" : "le "}${time}`;
  if (!mode) return `La question demande ${timeWithArticle}.`;
  if (mode === "participe" || mode === "gerondif" || mode === "infinitif") {
    return `La question demande ${mode === "participe" ? "le participe" : mode === "gerondif" ? "le g\xE9rondif" : "l\u2019infinitif"} ${time}.`;
  }
  const modeWithArticle = /^(indicatif|imperatif)$/u.test(mode) ? `de l\u2019${displayedMode}` : `du ${displayedMode}`;
  return `La question demande ${timeWithArticle} ${modeWithArticle}.`;
}
function compoundAuxiliaryForms(auxiliary, time, mode) {
  const key = `${mode}:${time}:${auxiliary}`;
  const forms = {
    "indicatif:passe compose:avoir": "ai, as, a, avons, avez, ont",
    "indicatif:passe compose:etre": "suis, es, est, sommes, \xEAtes, sont",
    "indicatif:plus-que-parfait:avoir": "avais, avais, avait, avions, aviez, avaient",
    "indicatif:plus-que-parfait:etre": "\xE9tais, \xE9tais, \xE9tait, \xE9tions, \xE9tiez, \xE9taient",
    "indicatif:futur anterieur:avoir": "aurai, auras, aura, aurons, aurez, auront",
    "indicatif:futur anterieur:etre": "serai, seras, sera, serons, serez, seront",
    "indicatif:passe anterieur:avoir": "eus, eus, eut, e\xFBmes, e\xFBtes, eurent",
    "indicatif:passe anterieur:etre": "fus, fus, fut, f\xFBmes, f\xFBtes, furent",
    "subjonctif:passe:avoir": "aie, aies, ait, ayons, ayez, aient",
    "subjonctif:passe:etre": "sois, sois, soit, soyons, soyez, soient",
    "subjonctif:plus-que-parfait:avoir": "eusse, eusses, e\xFBt, eussions, eussiez, eussent",
    "subjonctif:plus-que-parfait:etre": "fusse, fusses, f\xFBt, fussions, fussiez, fussent",
    "conditionnel:passe 1:avoir": "aurais, aurais, aurait, aurions, auriez, auraient",
    "conditionnel:passe 1:etre": "serais, serais, serait, serions, seriez, seraient",
    "conditionnel:passe 2:avoir": "eusse, eusses, e\xFBt, eussions, eussiez, eussent",
    "conditionnel:passe 2:etre": "fusse, fusses, f\xFBt, fussions, fussiez, fussent"
  };
  return forms[key] || null;
}
const AUXILIARY_SIMPLE_TENSES = [
  { mode: "indicatif", tense: "pr\xE9sent", pronouns: ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"], forms: { avoir: ["ai", "as", "a", "avons", "avez", "ont"], \u00EAtre: ["suis", "es", "est", "sommes", "\xEAtes", "sont"] } },
  { mode: "indicatif", tense: "imparfait", pronouns: ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"], forms: { avoir: ["avais", "avais", "avait", "avions", "aviez", "avaient"], \u00EAtre: ["\xE9tais", "\xE9tais", "\xE9tait", "\xE9tions", "\xE9tiez", "\xE9taient"] } },
  { mode: "indicatif", tense: "futur", pronouns: ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"], forms: { avoir: ["aurai", "auras", "aura", "aurons", "aurez", "auront"], \u00EAtre: ["serai", "seras", "sera", "serons", "serez", "seront"] } },
  { mode: "indicatif", tense: "pass\xE9 simple", pronouns: ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"], forms: { avoir: ["eus", "eus", "eut", "e\xFBmes", "e\xFBtes", "eurent"], \u00EAtre: ["fus", "fus", "fut", "f\xFBmes", "f\xFBtes", "furent"] } },
  { mode: "conditionnel", tense: "pr\xE9sent", pronouns: ["je", "tu", "il / elle / on", "nous", "vous", "ils / elles"], forms: { avoir: ["aurais", "aurais", "aurait", "aurions", "auriez", "auraient"], \u00EAtre: ["serais", "serais", "serait", "serions", "seriez", "seraient"] } },
  { mode: "subjonctif", tense: "pr\xE9sent", pronouns: ["que j\u2019", "que tu", "qu\u2019il / elle / on", "que nous", "que vous", "qu\u2019ils / elles"], forms: { avoir: ["aie", "aies", "ait", "ayons", "ayez", "aient"], \u00EAtre: ["sois", "sois", "soit", "soyons", "soyez", "soient"] } },
  { mode: "subjonctif", tense: "imparfait", pronouns: ["que j\u2019", "que tu", "qu\u2019il / elle / on", "que nous", "que vous", "qu\u2019ils / elles"], forms: { avoir: ["eusse", "eusses", "e\xFBt", "eussions", "eussiez", "eussent"], \u00EAtre: ["fusse", "fusses", "f\xFBt", "fussions", "fussiez", "fussent"] } },
  { mode: "imp\xE9ratif", tense: "pr\xE9sent", pronouns: ["tu", "nous", "vous"], forms: { avoir: ["aie", "ayons", "ayez"], \u00EAtre: ["sois", "soyons", "soyez"] } },
  { mode: "infinitif", tense: "pr\xE9sent", pronouns: ["forme"], forms: { avoir: ["avoir"], \u00EAtre: ["\xEAtre"] } },
  { mode: "participe", tense: "pr\xE9sent", pronouns: ["forme"], forms: { avoir: ["ayant"], \u00EAtre: ["\xE9tant"] } }
];
function compoundSimpleTense(mode, tense) {
  const key = `${normalized$1(mode)}:${normalized$1(tense)}`;
  const mappings = {
    "indicatif:passe compose": { mode: "indicatif", tense: "pr\xE9sent" },
    "indicatif:plus-que-parfait": { mode: "indicatif", tense: "imparfait" },
    "indicatif:futur anterieur": { mode: "indicatif", tense: "futur" },
    "indicatif:passe anterieur": { mode: "indicatif", tense: "pass\xE9 simple" },
    "conditionnel:passe": { mode: "conditionnel", tense: "pr\xE9sent" },
    "conditionnel:passe 1": { mode: "conditionnel", tense: "pr\xE9sent" },
    "conditionnel:passe 2": { mode: "subjonctif", tense: "imparfait" },
    "subjonctif:passe": { mode: "subjonctif", tense: "pr\xE9sent" },
    "subjonctif:plus-que-parfait": { mode: "subjonctif", tense: "imparfait" },
    "imperatif:passe": { mode: "imp\xE9ratif", tense: "pr\xE9sent" },
    "infinitif:passe": { mode: "infinitif", tense: "pr\xE9sent" },
    "participe:passe": { mode: "participe", tense: "pr\xE9sent" },
    "gerondif:passe": { mode: "participe", tense: "pr\xE9sent" }
  };
  return mappings[key] || null;
}
function inferCompoundAuxiliary(question, verb) {
  const words = new Set(normalized$1(question.conjugaison1).split(/[^a-z]+/u).filter(Boolean));
  const etreForms = new Set(AUXILIARY_SIMPLE_TENSES.flatMap((item) => item.forms.\u00EAtre.map(normalized$1)));
  const avoirForms = new Set(AUXILIARY_SIMPLE_TENSES.flatMap((item) => item.forms.avoir.map(normalized$1)));
  if ([...words].some((word) => etreForms.has(word))) return "\xEAtre";
  if ([...words].some((word) => avoirForms.has(word))) return "avoir";
  return normalized$1(verb == null ? void 0 : verb.auxiliaire) === "etre" ? "\xEAtre" : "avoir";
}
function auxiliaryConjugationHtml(auxiliary, target, requestedPerson, highlightRequested = true) {
  const selected = target ? AUXILIARY_SIMPLE_TENSES.find((item) => normalized$1(item.mode) === normalized$1(target.mode) && normalized$1(item.tense) === normalized$1(target.tense)) : void 0;
  if (!selected) return "<p>La conjugaison de l\u2019auxiliaire n\u2019est pas disponible pour cette forme.</p>";
  const rows = selected.forms[auxiliary].map((form, index) => {
    const isRequested = index === requestedPerson || requestedPerson === null && selected.forms[auxiliary].length === 1;
    return `<tr><th><strong>${escapedHtml(selected.pronouns[index] || `personne ${index + 1}`)}</strong></th><td>${highlightRequested && isRequested ? `<mark><strong>${escapedHtml(form)}</strong></mark>` : `<strong>${escapedHtml(form)}</strong>`}</td></tr>`;
  }).join("");
  const summary = (target == null ? void 0 : target.tense) ? `${target.tense} ${withDeArticle(target.mode)} du verbe ${auxiliary}` : `Temps simples du verbe ${auxiliary}`;
  return `<details><summary>${escapedHtml(summary)}</summary><table><tbody>${rows}</tbody></table></details>`;
}
function auxiliaryPersonIndex(question, target) {
  if (normalized$1(target == null ? void 0 : target.mode) !== "imperatif") return subjectIndex(question);
  const subject = normalized$1(question.pronom || question.saisiePrefixe);
  if (subject === "tu") return 0;
  if (subject === "nous") return 1;
  if (subject === "vous") return 2;
  return null;
}
function compoundAuxiliaryPart(form, participle) {
  const source = form.trim();
  if (!source || !participle) return source;
  const escaped = participle.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return source.replace(new RegExp(`\\s+${escaped}(?:e|s|es)?$`, "iu"), "").replace(/^en\s+/iu, "").replace(/^(?:me|te|se|nous|vous|m['’]|t['’]|s['’])\s*/iu, "").trim();
}
function agreedParticipleFromCompound(form, baseParticiple) {
  if (!baseParticiple) return "";
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = form.match(new RegExp(`(?:^|\\s)(${escaped}(?:e|s|es)?)(?=$|\\s|[.,!?;:])`, "iu"));
  return (match == null ? void 0 : match[1]) || baseParticiple;
}
function officialCompoundForm(question, baseParticiple) {
  var _a, _b, _c;
  const source = ((_a = question.conjugaison1) == null ? void 0 : _a.trim()) || "";
  const expectedParticiple = (_c = (_b = question.agreementReminder) == null ? void 0 : _b.participle) == null ? void 0 : _c.trim();
  if (!source || !baseParticiple || !expectedParticiple) return source;
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return source.replace(new RegExp(`${escaped}(?:e|s|es)?(?=$|[\\s.,!?;:\u2019'])`, "iu"), expectedParticiple);
}
function buildPassiveVoiceHelpHtml(question, _verb, _tense, _revealAnswers = true, condensed = false) {
  const subject = question.passiveSubject || question.pronom || "le sujet qui subit l\u2019action";
  if (condensed) {
    return `<p>La voix passive met en avant ce qui <strong>subit l\u2019action</strong>.</p><p>Par exemple :<br>Le facteur a distribu\xE9 les lettres ce matin<br>Les lettres ont \xE9t\xE9 distribu\xE9es ce matin.</p><p>sujet + <strong>\xEAtre au temps demand\xE9</strong> + participe pass\xE9 accord\xE9.</p><p>Ici, le sujet est <strong>${escapedHtml(subject)}</strong>. Le participe pass\xE9 s\u2019accorde avec lui.</p>`;
  }
  return `<p>La voix passive sert \xE0 mettre en avant la personne ou la chose qui <strong>subit l\u2019action</strong>. L\u2019auteur de l\u2019action devient secondaire et peut parfois \xEAtre omis.</p><p>Par exemple :<br>Le facteur a distribu\xE9 les lettres ce matin<br>Les lettres ont \xE9t\xE9 distribu\xE9es ce matin.</p><p><strong>sujet qui subit l\u2019action</strong> + <strong>\xEAtre conjugu\xE9</strong> + <strong>participe pass\xE9 accord\xE9</strong>.</p><p><strong>Attention au temps</strong><br>C\u2019est le verbe <strong>\xEAtre</strong> qui porte le mode et le temps demand\xE9s. Le verbe \xE9tudi\xE9 reste au participe pass\xE9.</p>`;
}
function buildPassiveVoiceMethodHtml(question, verb, tense, revealAnswers = true) {
  var _a;
  const subject = question.passiveSubject || question.pronom || "le sujet qui subit l\u2019action";
  const agent = question.passiveAgent || "par quelqu\u2019un";
  const participle = ((_a = verb == null ? void 0 : verb.participePasse) == null ? void 0 : _a.trim()) || "le participe pass\xE9 du verbe";
  const auxiliary = compoundAuxiliaryPart(question.conjugaison1 || "", participle);
  const agreed = agreedParticipleFromCompound(question.conjugaison1 || "", participle);
  const context = tenseContext(question, tense);
  if (!revealAnswers) {
    return `<ol><li>Rep\xE8re le sujet qui subit l\u2019action : <strong>${escapedHtml(subject)}</strong>.</li><li>Conjugue <strong>\xEAtre</strong> ${escapedHtml(context)}.</li><li>Ajoute le participe pass\xE9 de <strong>${escapedHtml(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe")}</strong>.</li><li>Accorde ce participe avec le sujet, puis relis la phrase avec \xAB ${escapedHtml(agent)} \xBB.</li></ol>`;
  }
  return `<ol><li>Le COD de la phrase active devient le sujet : <strong>${escapedHtml(subject)}</strong>.</li><li>Conjugue <strong>\xEAtre</strong> ${escapedHtml(context)} : <strong>${escapedHtml(auxiliary)}</strong>.</li><li>Ajoute le participe pass\xE9 et accorde-le avec ce sujet : <strong>${escapedHtml(agreed)}</strong>.</li><li>Relis la phrase compl\xE8te avec \xAB ${escapedHtml(agent)} \xBB.</li></ol><p><strong>R\xE9sultat</strong><br>${resultFormMarkup(question.reponsesPourCorrige[0] || question.conjugaison1 || "")}</p>`;
}
function compoundAgreementHtml(auxiliary, subject, baseParticiple = "", answer = "", question, verb) {
  var _a, _b;
  if (auxiliary === "\xEAtre") {
    if (isPronominalInfinitive((question == null ? void 0 : question.infinitif) || (verb == null ? void 0 : verb.infinitif) || "", verb)) {
      return "<figure><figcaption>Accord du participe pass\xE9</figcaption><blockquote><strong>Avec un verbe pronominal</strong><p>L\u2019accord d\xE9pend de la fonction du pronom r\xE9fl\xE9chi et de la pr\xE9sence \xE9ventuelle d\u2019un COD.</p><p>Si le pronom r\xE9fl\xE9chi est COD plac\xE9 avant, le participe pass\xE9 s\u2019accorde avec ce qu\u2019il repr\xE9sente. S\u2019il est COI, il ne commande pas l\u2019accord.</p></blockquote></figure>";
    }
    const tuNote = subjectKey(subject) === "tu" ? "<p>Avec <strong>tu</strong>, la forme peut changer selon la personne \xE0 qui l\u2019on parle : <em>sois n\xE9</em> ou <em>sois n\xE9e</em>. L\u2019exercice attend ici la forme enregistr\xE9e dans la r\xE9ponse.</p>" : "";
    const agreed = agreedParticipleFromCompound(answer, baseParticiple);
    const key = subjectKey(subject);
    const pluralNote = ["nous", "vous", "ils", "elles"].includes(key) && agreed && normalized$1(agreed) !== normalized$1(baseParticiple) ? key === "vous" ? `<p>Ici, l\u2019exercice attend <strong>${escapedHtml(agreed)}</strong>. Avec <strong>vous</strong>, l\u2019accord d\xE9pend du contexte : une personne polie, plusieurs personnes, masculin ou f\xE9minin.</p>` : `<p>Ici, <strong>${escapedHtml(key)}</strong> d\xE9signe plusieurs personnes : le participe pass\xE9 s\u2019accorde au pluriel. <strong>${escapedHtml(baseParticiple)}</strong> devient <strong>${escapedHtml(agreed)}</strong>.</p>` : "";
    return `<figure><figcaption>Accord du participe pass\xE9</figcaption><blockquote><strong>Avec \xEAtre</strong><p>Le participe pass\xE9 s\u2019accorde avec le sujet.</p><p><em>Elle est arriv\xE9e. \xB7 Ils sont arriv\xE9s.</em></p>${pluralNote}${tuNote}</blockquote></figure>`;
  }
  const contextualReminder = ((_a = question == null ? void 0 : question.agreementReminder) == null ? void 0 : _a.kind) === "coi" ? `<blockquote><strong>Dans cette question : COI</strong><p>\xAB ${escapedHtml(question.agreementReminder.complement)} \xBB est un compl\xE9ment d\u2019objet indirect. Un COI ne commande pas l\u2019accord du participe pass\xE9.</p></blockquote>` : ((_b = question == null ? void 0 : question.agreementReminder) == null ? void 0 : _b.kind) === "cod-after" ? `<blockquote><strong>Dans cette question : COD plac\xE9 apr\xE8s</strong><p>\xAB ${escapedHtml(question.agreementReminder.complement)} \xBB est plac\xE9 apr\xE8s le verbe : il ne commande pas l\u2019accord du participe pass\xE9.</p></blockquote>` : "";
  return `<figure><figcaption>Accord du participe pass\xE9</figcaption><blockquote><strong>Cas g\xE9n\xE9ral avec avoir</strong><p>Le participe pass\xE9 ne s\u2019accorde pas avec le sujet.</p><p><em>Elle a mang\xE9. \xB7 Ils ont mang\xE9.</em></p></blockquote><blockquote><strong>Si le COD est plac\xE9 avant</strong><p>Le participe pass\xE9 s\u2019accorde avec le compl\xE9ment d\u2019objet direct plac\xE9 avant le verbe.</p><p><em>Les pommes qu\u2019elle a mang\xE9es. \xB7 Les livres qu\u2019il a lus.</em></p></blockquote>${contextualReminder}</figure>`;
}
function buildCompoundConjugationHtml(question, verb, tense, revealAnswers = true) {
  var _a, _b, _c, _d, _e;
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe";
  const auxiliary = inferCompoundAuxiliary(question, verb);
  const participle = ((_a = verb == null ? void 0 : verb.participePasse) == null ? void 0 : _a.trim()) || ((_c = (_b = question.agreementReminder) == null ? void 0 : _b.participle) == null ? void 0 : _c.trim()) || "participe pass\xE9 \xE0 v\xE9rifier";
  const simpleTense = compoundSimpleTense(question.mode || ((_d = tense == null ? void 0 : tense.mode) == null ? void 0 : _d.name) || "", question.temps || (tense == null ? void 0 : tense.name) || "");
  const person = auxiliaryPersonIndex(question, simpleTense);
  const subject = question.pronom || question.saisiePrefixe || "la personne demand\xE9e";
  const auxiliaryForm = compoundAuxiliaryPart(question.conjugaison1 || "", participle);
  const officialForm = officialCompoundForm(question, participle);
  const auxiliaryContext = simpleTense ? `${withAArticle(simpleTense.tense)} ${withDeArticle(simpleTense.mode)}` : "au temps simple correspondant";
  const auxiliaryKnowledge = revealAnswers ? auxiliaryConjugationHtml(auxiliary, simpleTense, person) : `${auxiliaryConjugationHtml("avoir", simpleTense, person, false)}${auxiliaryConjugationHtml("\xEAtre", simpleTense, person, false)}`;
  const participleKnowledge = revealAnswers ? rememberedFormMarkup(participle) : `<strong>${escapedHtml(participle)}</strong>`;
  const auxiliaryChoice = revealAnswers ? `<blockquote><strong>Quel verbe auxiliaire pour ${escapedHtml(infinitive)} ?</strong>${auxiliaryChoicesMarkup(auxiliary)}</blockquote>` : `<blockquote><strong>Auxiliaire \xE0 utiliser</strong><p>Pour <strong>${escapedHtml(infinitive)}</strong>, utilise l\u2019auxiliaire <strong>${escapedHtml(auxiliary)}</strong>.</p></blockquote>`;
  const knowledge = `<figure>${knowledgeCaption()}${auxiliaryChoice}${auxiliaryKnowledge}<blockquote><strong>Le participe pass\xE9 de ${escapedHtml(infinitive)}</strong><p>${participleKnowledge}</p></blockquote></figure>`;
  const conjugatedAuxiliary = auxiliaryForm ? `<br><mark><strong>${escapedHtml(auxiliaryForm)}</strong></mark>` : "";
  const nonPersonal = ["participe", "gerondif"].includes(normalized$1(question.mode || ((_e = tense == null ? void 0 : tense.mode) == null ? void 0 : _e.name)));
  const auxiliaryInstruction = nonPersonal ? `Utilise le verbe auxiliaire <strong>${escapedHtml(auxiliary)}</strong> ${escapedHtml(auxiliaryContext)} :${conjugatedAuxiliary}` : `Conjugue le verbe auxiliaire <strong>${escapedHtml(auxiliary)}</strong> ${escapedHtml(auxiliaryContext)} avec <strong>${escapedHtml(subject)}</strong> :${conjugatedAuxiliary}`;
  const result = officialForm ? `<blockquote><strong>R\xE9sultat</strong><p>${resultFormMarkup(officialForm, false)}</p></blockquote>` : "";
  const answer = revealAnswers ? `<figure><figcaption>Construis la r\xE9ponse</figcaption><ol><li>${auxiliaryInstruction}</li><li>Ajoute le participe pass\xE9 :<br>${rememberedFormMarkup(participle)}</li><li>V\xE9rifie l\u2019accord du participe pass\xE9. Regarde plus bas pour plus de d\xE9tails.</li></ol>${result}</figure>` : `<figure><figcaption>Construis la r\xE9ponse</figcaption><ol><li>Conjugue le verbe auxiliaire ${escapedHtml(auxiliaryContext)} avec <strong>${escapedHtml(subject)}</strong>.</li><li>Ajoute le participe pass\xE9.</li><li>V\xE9rifie l\u2019accord du participe pass\xE9. Regarde plus bas pour plus de d\xE9tails.</li></ol></figure>`;
  return `${knowledge}${answer}${compoundAgreementHtml(auxiliary, subject, participle, officialForm, question, verb)}`;
}
function tenseRule(question, verb, tense) {
  var _a, _b;
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  const group = verb == null ? void 0 : verb.groupeConjugaison;
  const person = subjectIndex(question);
  let rule = "";
  let endings = null;
  let endingsText = null;
  let endingsKind = "endings";
  let auxiliaryLabel = "";
  let exception = null;
  if (isNearFutureTense({ code: question.tenseCode || (tense == null ? void 0 : tense.code), name: question.temps || (tense == null ? void 0 : tense.name) })) {
    endings = ["vais", "vas", "va", "allons", "allez", "vont"];
    endingsKind = "auxiliary";
    auxiliaryLabel = "aller";
    endingsText = "Formes de \xAB aller \xBB au pr\xE9sent : vais, vas, va, allons, allez, vont.";
    rule = "Conjugue \xAB aller \xBB au pr\xE9sent, puis ajoute l\u2019infinitif du verbe. Avec un verbe pronominal, place le pronom r\xE9fl\xE9chi devant l\u2019infinitif.";
  } else if (question.isCompound || (tense == null ? void 0 : tense.isCompound)) {
    const auxiliaryLabelFromVerb = ((_b = verb == null ? void 0 : verb.auxiliaire) == null ? void 0 : _b.trim()) || "avoir ou \xEAtre selon le verbe";
    const auxiliary = normalized$1(auxiliaryLabelFromVerb);
    auxiliaryLabel = auxiliaryLabelFromVerb;
    const auxiliaryTime = {
      "passe compose": "au pr\xE9sent",
      "plus-que-parfait": "\xE0 l\u2019imparfait",
      "futur anterieur": "au futur",
      "passe anterieur": "au pass\xE9 simple",
      passe: mode === "gerondif" ? "au participe pr\xE9sent" : "au temps simple correspondant",
      "passe 1": "au conditionnel pr\xE9sent",
      "passe 2": "au subjonctif imparfait"
    };
    rule = `Conjugue l\u2019auxiliaire ${auxiliary} ${auxiliaryTime[time] || "au temps demand\xE9"}, puis ajoute le participe pass\xE9.`;
    const auxiliaryForms = compoundAuxiliaryForms(auxiliary, time, mode);
    if (auxiliaryForms) {
      endings = auxiliaryForms.split(",").map((form) => form.trim());
      endingsKind = "auxiliary";
      endingsText = `Formes de l\u2019auxiliaire : ${auxiliaryForms}.`;
    }
  } else if (mode === "indicatif" && time === "present") {
    if (group === 1) endings = ["-e", "-es", "-e", "-ons", "-ez", "-ent"];
    else if (group === 2) endings = ["-is", "-is", "-it", "-issons", "-issez", "-issent"];
    rule = group === 3 ? "Au pr\xE9sent, les verbes du 3e groupe changent souvent de radical : appuie-toi sur leur famille." : "Pars du radical du verbe et ajoute la terminaison du pr\xE9sent.";
    if (group === 3) exception = "Ce verbe appartient au 3e groupe : il ne suit pas une s\xE9rie unique de terminaisons et son radical peut changer selon la personne.";
  } else if (mode === "indicatif" && time === "imparfait") {
    endings = ["-ais", "-ais", "-ait", "-ions", "-iez", "-aient"];
    rule = "Prends la forme avec \xAB nous \xBB au pr\xE9sent, enl\xE8ve -ons, puis ajoute la terminaison de l\u2019imparfait.";
    if (normalized$1(verb == null ? void 0 : verb.infinitif) === "etre") {
      exception = "\xAB \xCAtre \xBB utilise le radical \xE9t-. C\u2019est le seul verbe dont l\u2019imparfait ne se construit pas \xE0 partir de la forme avec \xAB nous \xBB au pr\xE9sent.";
    }
  } else if (mode === "indicatif" && time === "futur") {
    endings = ["-ai", "-as", "-a", "-ons", "-ez", "-ont"];
    rule = `Utilise le radical du futur ${futureStem(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "")}, puis ajoute la terminaison.`;
    const bare = bareInfinitive(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "");
    const expectedFutureRadical = bare.endsWith("re") ? bare.slice(0, -1) : bare;
    if ((verb == null ? void 0 : verb.groupeConjugaison) === 3 && normalized$1(futureStem(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "").replace(/-$/u, "")) !== normalized$1(expectedFutureRadical)) {
      exception = `Le radical ${futureStem(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "")} est irr\xE9gulier : il ne se forme pas simplement en conservant l\u2019infinitif.`;
    }
  } else if (mode === "indicatif" && time === "passe simple") {
    endings = group === 1 ? ["-ai", "-as", "-a", "-\xE2mes", "-\xE2tes", "-\xE8rent"] : ["-is", "-is", "-it", "-\xEEmes", "-\xEEtes", "-irent"];
    rule = group === 3 ? "Au pass\xE9 simple, le radical et parfois la s\xE9rie de terminaisons varient selon la famille du verbe." : "Pars du radical et ajoute la terminaison du pass\xE9 simple.";
    if (group === 3) exception = "Au 3e groupe, le pass\xE9 simple peut employer un radical et une voyelle de terminaison particuliers ; il faut suivre la famille du verbe.";
  } else if (mode === "conditionnel" && time === "present") {
    endings = ["-ais", "-ais", "-ait", "-ions", "-iez", "-aient"];
    rule = `Utilise le radical du futur ${futureStem(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "")}, puis une terminaison de l\u2019imparfait.`;
    const bare = bareInfinitive(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "");
    const expectedFutureRadical = bare.endsWith("re") ? bare.slice(0, -1) : bare;
    if ((verb == null ? void 0 : verb.groupeConjugaison) === 3 && normalized$1(futureStem(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "").replace(/-$/u, "")) !== normalized$1(expectedFutureRadical)) {
      exception = `Le radical ${futureStem(question.infinitif || (verb == null ? void 0 : verb.infinitif) || "")} est irr\xE9gulier : le conditionnel reprend le m\xEAme radical particulier que le futur.`;
    }
  } else if (mode === "subjonctif" && time === "present") {
    endings = ["-e", "-es", "-e", "-ions", "-iez", "-ent"];
    rule = "Pars g\xE9n\xE9ralement de la forme avec \xAB ils \xBB au pr\xE9sent, enl\xE8ve -ent, puis ajoute la terminaison. N\u2019oublie pas \xAB que \xBB.";
  } else if (mode === "subjonctif" && time === "imparfait") {
    rule = "Pars de la 3e personne du singulier au pass\xE9 simple, puis construis le subjonctif imparfait. N\u2019oublie pas \xAB que \xBB.";
  } else if (mode === "imperatif" && time === "present") {
    rule = "Utilise la forme du pr\xE9sent pour tu, nous ou vous, sans \xE9crire le pronom sujet.";
    if ((verb == null ? void 0 : verb.groupeConjugaison) === 1 && subjectIndex(question) === 1) {
      exception = "\xC0 la 2e personne du singulier, les verbes du 1er groupe perdent normalement le -s final : \xAB mange ! \xBB. Le -s revient devant \xAB en \xBB ou \xAB y \xBB : \xAB manges-en ! \xBB.";
    }
  } else if (mode === "participe" && time === "present") {
    rule = normalized$1(verb == null ? void 0 : verb.infinitif) === "etre" || normalized$1(verb == null ? void 0 : verb.infinitif) === "avoir" || normalized$1(verb == null ? void 0 : verb.infinitif) === "savoir" ? "C\u2019est une forme particuli\xE8re \xE0 m\xE9moriser." : "Prends la forme avec \xAB nous \xBB au pr\xE9sent, enl\xE8ve -ons, puis ajoute -ant.";
  } else if (mode === "participe" && time === "passe") {
    rule = "Utilise le participe pass\xE9 du verbe et v\xE9rifie s\u2019il doit s\u2019accorder.";
  } else if (mode === "gerondif" && time === "present") {
    rule = "\xC9cris \xAB en \xBB suivi du participe pr\xE9sent : base de \xAB nous \xBB au pr\xE9sent sans -ons, puis -ant.";
  } else if (mode === "gerondif" && time === "passe") {
    rule = "\xC9cris \xAB en ayant \xBB ou \xAB en \xE9tant \xBB, puis le participe pass\xE9 du verbe.";
  } else {
    rule = "Rep\xE8re d\u2019abord le mode, le temps et la personne, puis choisis le radical et la terminaison correspondants.";
  }
  const actualForm = normalized$1(question.conjugaison1);
  if (!exception && actualForm.includes("\xE7")) {
    exception = "Le radical prend une c\xE9dille devant a ou o afin que la lettre c conserve le son [s].";
  } else if (!exception && /ge[ao]/u.test(actualForm)) {
    exception = "Un e est ajout\xE9 apr\xE8s g devant a ou o afin de conserver le son doux [j].";
  } else if (!exception && normalized$1(question.infinitif).endsWith("guer") && actualForm.includes("gu")) {
    exception = "Le u de -gu- appartient au radical : il reste \xE9crit m\xEAme lorsqu\u2019on ne l\u2019entend pas s\xE9par\xE9ment.";
  } else if (!exception && /(?:eler|eter)$/u.test(normalized$1(question.infinitif)) && /(?:ll|tt|è)/u.test(actualForm)) {
    exception = "Devant une terminaison muette, ce verbe modifie son radical : selon sa famille, la consonne double ou le e devient \xE8.";
  } else if (!exception && normalized$1(question.infinitif).endsWith("yer") && actualForm.includes("i")) {
    exception = "Devant une terminaison muette, le y du radical devient ici i.";
  }
  return {
    rule,
    endingItems: endings || [],
    endingsKind,
    auxiliaryLabel,
    endings: endingsText || (endings ? `${endings.join(", ")}${person === null ? "" : ` \u2014 ici, la terminaison attendue est ${endings[person]}`}` : null),
    exception
  };
}
function decomposeConjugationForm(question, verb, tense) {
  if (question.isCompound || (tense == null ? void 0 : tense.isCompound) || !question.conjugaison1) return null;
  const rule = tenseRule(question, verb, tense);
  if (rule.endingsKind !== "endings" || !hasFamilyIndependentEndings(question, verb, tense)) return null;
  const person = subjectIndex(question);
  const displayedEnding = person === null ? "" : rule.endingItems[person] || "";
  if (!/^-[\p{L}]+$/u.test(displayedEnding)) return null;
  const ending = displayedEnding.slice(1);
  const form = conjugatedCore$1(question.conjugaison1);
  if (!form || form.length <= ending.length || !form.toLocaleLowerCase("fr").endsWith(ending.toLocaleLowerCase("fr"))) {
    return null;
  }
  const base = form.slice(0, -ending.length);
  if (!base || /[\s-]/u.test(base)) return null;
  return {
    base,
    ending,
    baseLabel: "Base pour cette forme",
    confidence: "high",
    source: "stored-form"
  };
}
function buildConjugationBaseHtml(question, verb, tense, approach = "grammatical-technical") {
  var _a, _b, _c, _d, _e, _f;
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe";
  const context = tenseContext(question, tense);
  const subject = question.pronom || question.saisiePrefixe || "la personne demand\xE9e";
  const decomposition = decomposeConjugationForm(question, verb, tense);
  const lexical = lexicalStem(infinitive, verb == null ? void 0 : verb.terminaison);
  const actualForm = conjugatedCore$1(question.conjugaison1 || "");
  const rule = tenseRule(question, verb, tense);
  const family = ((_a = verb == null ? void 0 : verb.familleConjugaison) == null ? void 0 : _a.replaceAll("-", " ").trim()) || "";
  const normalizedInfinitive = normalized$1(infinitive);
  const isSuppletive = normalizedInfinitive === "aller" || normalizedInfinitive === "etre";
  const isCompound = Boolean(question.isCompound || (tense == null ? void 0 : tense.isCompound));
  const reference = ((_b = question.radicalReference) == null ? void 0 : _b.validated) === false ? void 0 : question.radicalReference;
  const referenceSubject = ((_c = reference == null ? void 0 : reference.referenceSubject) == null ? void 0 : _c.trim()) || ((reference == null ? void 0 : reference.label.startsWith("nous")) ? "nous" : (reference == null ? void 0 : reference.label.startsWith("ils")) ? "ils" : "");
  const rawReferenceRadical = (reference == null ? void 0 : reference.removableEnding) && reference.form.endsWith(reference.removableEnding) ? reference.form.slice(0, -reference.removableEnding.length) : (reference == null ? void 0 : reference.radical) || "";
  const displayedReference = reference ? displayedConjugatedForm(referenceSubject, reference.form, infinitive, verb) : "";
  const highlightedReference = displayedReference ? rememberedFormMarkup(displayedReference) : "";
  const normalizedMode = normalized$1(question.mode || ((_d = tense == null ? void 0 : tense.mode) == null ? void 0 : _d.name));
  const normalizedTense = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  if (question.voice === "passive") {
    return `${buildPassiveVoiceMethodHtml(question, verb, tense)}${buildPassiveVoiceHelpHtml(question)}`;
  }
  if (isNearFutureTense({ code: question.tenseCode || (tense == null ? void 0 : tense.code), name: question.temps || (tense == null ? void 0 : tense.name) })) {
    return nearFutureHelpHtml(question);
  }
  if (normalizedMode === "participe" && normalizedTense === "passe") {
    const participle = ((_e = verb == null ? void 0 : verb.participePasse) == null ? void 0 : _e.trim()) || actualForm;
    if (approach === "concise") return `<p>Le participe pass\xE9 est <strong>${escapedHtml(participle)}</strong> : apprends cette forme.</p>`;
    if (approach === "guided-discovery") return `<details><summary>Indice 1 \xB7 La famille</summary><p>Observe la famille de <strong>${escapedHtml(infinitive)}</strong>.</p></details><details><summary>Indice 2 \xB7 La forme</summary><p>Le participe pass\xE9 n\u2019est pas toujours pr\xE9visible \xE0 partir de l\u2019infinitif.</p></details><details><summary>Indice 3 \xB7 \xC0 retenir</summary><p>La forme rep\xE8re est ${rememberedFormMarkup(participle)}. V\xE9rifie ensuite son accord.</p></details>`;
    if (approach === "cif-falc") return `<ol><li>Rep\xE8re le verbe <strong>${escapedHtml(infinitive)}</strong>.</li><li>Apprends son participe pass\xE9 : <strong>${escapedHtml(participle)}</strong>.</li><li>V\xE9rifie s\u2019il faut l\u2019accorder.</li></ol>`;
    return `<p>Le participe pass\xE9 <strong>${escapedHtml(participle)}</strong> est une <strong>forme lexicale</strong> enregistr\xE9e avec le verbe <strong>${escapedHtml(infinitive)}</strong>.</p><p>Il ne faut pas lui inventer un radical productif : sa formation d\xE9pend de la famille et comporte de nombreuses irr\xE9gularit\xE9s. L\u2019\xE9tape suivante est la v\xE9rification de l\u2019accord.</p>`;
  }
  if (isCompound) {
    return buildCompoundConjugationHtml(question, verb, tense);
  }
  if (normalizedMode === "imperatif" && normalizedTense === "present") {
    return imperativePresentHelpHtml(question, reference);
  }
  if (normalizedMode === "subjonctif" && normalizedTense === "present") {
    return subjunctivePresentHelpHtml(question, reference, verb);
  }
  if (normalizedMode === "subjonctif" && normalizedTense === "imparfait" && (reference == null ? void 0 : reference.kind) === "past-simple-il") {
    return subjunctiveImperfectHelpHtml(question, reference, verb, tense, approach);
  }
  if (normalizedMode === "conditionnel" && normalizedTense === "present") {
    return conditionalPresentHelpHtml(question, verb, reference);
  }
  if (reference && requestedFormIsReference(question, reference) && shouldUseReferenceMethodForRegularForm(question, reference, verb, tense)) {
    return requestedReferenceHelpHtml(question, tense, reference, verb);
  }
  if (decomposition) {
    const base = radicalBadge(decomposition.base);
    const ending = endingBadge(decomposition.ending);
    const assembledForm = assembledFormBadges(decomposition.base, decomposition.ending);
    const alternates = normalized$1(lexical) !== normalized$1(decomposition.base);
    const alternation = alternates ? ` Elle diff\xE8re du radical lexical ${radicalBadge(lexical)} : cette conjugaison commande une alternance.` : ` Elle correspond ici au radical lexical ${radicalBadge(lexical)}.`;
    const bare = normalized$1(bareInfinitive(infinitive));
    const hasDedicatedLetterHelp = bare.endsWith("ger") || bare.endsWith("guer") || bare.endsWith("cer");
    const exception = rule.exception && !hasDedicatedLetterHelp ? `<p>${escapedHtml(rule.exception)}</p>` : "";
    if (reference && normalized$1(reference.radical) === normalized$1(decomposition.base) && shouldUseReferenceMethodForRegularForm(question, reference, verb, tense)) {
      const referenceEnding = reference.removableEnding ? removedEndingBadge(reference.removableEnding) : "";
      const removeInstruction = referenceEnding ? normalized$1(rawReferenceRadical) === normalized$1(reference.radical) ? `Enl\xE8ve ${referenceEnding} : il reste le radical ${base}.` : `Enl\xE8ve ${referenceEnding} : tu obtiens d\u2019abord le radical ${radicalBadge(rawReferenceRadical)}.` : `Garde le radical ${base}.`;
      const changesBeforeEnding = normalized$1(rawReferenceRadical) !== normalized$1(decomposition.base);
      const firstAssembly = changesBeforeEnding ? assembledFormBadges(rawReferenceRadical, decomposition.ending) : assembledForm;
      const crossedAssembly = changesBeforeEnding ? adjustedAssemblyBadges(rawReferenceRadical, decomposition.base, decomposition.ending) : "";
      const adjustmentNote = bare.endsWith("ger") && normalized$1(rawReferenceRadical).endsWith("ge") && normalized$1(decomposition.base).endsWith("g") ? "Si la lettre <strong>g</strong> est suivie de <strong>i</strong>, pas besoin de <strong>e</strong>. Regarde l\u2019explication plus bas." : bare.endsWith("cer") && rawReferenceRadical.toLocaleLowerCase("fr").endsWith("\xE7") && normalized$1(decomposition.base).endsWith("c") ? "Devant <strong>i</strong>, la c\xE9dille ne sert pas. Regarde l\u2019explication plus bas." : "Le radical s\u2019adapte devant cette terminaison. Regarde l\u2019explication plus bas.";
      const assembly = changesBeforeEnding ? `${firstAssembly}<small>${adjustmentNote}</small>${crossedAssembly}<strong>R\xE9sultat</strong><b>${assembledForm}<i>\u2713</i></b>` : assembledForm;
      const requestedPersonIndex = subjectIndex(question);
      const endingRows = rule.endingItems.map((item, index) => {
        var _a2;
        return `<tr><th><strong>${escapedHtml(endingPronouns(question.mode || ((_a2 = tense == null ? void 0 : tense.mode) == null ? void 0 : _a2.name) || "", rule.endingItems.length)[index] || `forme ${index + 1}`)}</strong></th><td>${index === requestedPersonIndex ? endingBadge(item) : `<strong>${escapedHtml(item)}</strong>`}</td></tr>`;
      }).join("");
      const endingsContent = endingRows ? `<table><tbody>${endingRows}</tbody></table>` : `<p>${escapedHtml(rule.rule)}</p>`;
      const inferredReferenceTense = reference.kind.startsWith("present-") ? "pr\xE9sent" : reference.kind === "future-stem" ? "futur" : reference.kind === "past-simple-il" ? "pass\xE9 simple" : reference.kind === "infinitive" ? "pr\xE9sent" : "";
      const inferredReferenceMode = /^(?:present-|future-stem|past-simple-il)/u.test(reference.kind) ? "indicatif" : "";
      const referenceTenseName = (reference.referenceTense || inferredReferenceTense || question.temps || (tense == null ? void 0 : tense.name) || "").trim();
      const referenceModeName = (reference.referenceMode || inferredReferenceMode || question.mode || ((_f = tense == null ? void 0 : tense.mode) == null ? void 0 : _f.name) || "").trim();
      const referenceContext = `${referenceTenseName ? withAArticle(referenceTenseName) : ""}${referenceModeName ? ` ${withDeArticle(referenceModeName)}` : ""}`.trim();
      const referenceInstruction = `Voici la forme rep\xE8re${referenceContext ? ` ${escapedHtml(referenceContext)}` : ""}. Apprends-la par c\u0153ur, c\u2019est tr\xE8s utile :`;
      const knowledgeBlock = `<figure>${knowledgeCaption()}<blockquote><strong>Forme rep\xE8re</strong><p>${referenceInstruction}</p><p>${highlightedReference}</p></blockquote><blockquote><strong>${escapedHtml(endingsKnowledgeTitle(question, tense))}</strong>${endingsContent}</blockquote></figure>`;
      const usefulnessBlock = referenceUsefulnessHtml(question, tense, reference, verb);
      const radicalBlock = approach === "guided-discovery" ? `<figure><figcaption>Trouve le radical</figcaption><details><summary>Indice 1 \xB7 La forme rep\xE8re</summary><p>Prends la forme rep\xE8re :<br>${highlightedReference}</p></details><details><summary>Indice 2 \xB7 Le radical</summary><p>${removeInstruction}</p></details></figure>` : `<figure><figcaption>Trouve le radical</figcaption><ol><li>Prends la forme rep\xE8re :<br>${highlightedReference}</li><li>${removeInstruction}</li></ol></figure>`;
      const answerDisplay = displayedAnswerForm(question, infinitive, verb);
      const pronominalResult = isPronominalInfinitive(infinitive, verb) && answerDisplay && normalized$1(answerDisplay) !== normalized$1(actualForm) ? `<p>Ajoute aussi le pronom r\xE9fl\xE9chi adapt\xE9 :</p><b>${rememberedFormMarkup(answerDisplay)}<i>\u2713</i></b>` : "";
      const answerBlock = `<figure><figcaption>Construis la r\xE9ponse</figcaption><blockquote><p>Ajoute ${ending} au radical ${changesBeforeEnding ? radicalBadge(rawReferenceRadical) : base} :</p>${assembly}${pronominalResult}</blockquote></figure>`;
      if (approach === "concise") {
        return `${knowledgeBlock}${radicalBlock}${answerBlock}${usefulnessBlock}`;
      }
      if (approach === "guided-discovery") {
        return `${knowledgeBlock}${radicalBlock}${answerBlock}${usefulnessBlock}${exception}`;
      }
      if (approach === "cif-falc") {
        return `${knowledgeBlock}${radicalBlock}${answerBlock}${usefulnessBlock}${exception}`;
      }
      const familyFact3 = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : "";
      return `${knowledgeBlock}${radicalBlock}${answerBlock}${usefulnessBlock}${familyFact3}${exception}`;
    }
    if (approach === "concise") {
      return `<p>Avec <strong>${escapedHtml(subject)}</strong> ${escapedHtml(context)}, utilise le radical ${base}, puis ajoute ${ending}.</p><p><strong>R\xE9sultat</strong><br>${resultFormMarkup(actualForm)}</p>`;
    }
    if (approach === "guided-discovery") {
      return `<details><summary>Indice 1 \xB7 L\u2019infinitif</summary><p>Pars de l\u2019infinitif <strong>${escapedHtml(infinitive)}</strong> et identifie sa famille.</p></details><details><summary>Indice 2 \xB7 Le radical</summary><p>Ici, cette famille utilise le radical ${base}. Il faut le conna\xEEtre comme radical rep\xE8re, sans partir de la r\xE9ponse.</p></details><details><summary>Indice 3 \xB7 Assemble</summary><p>Ajoute la terminaison ${ending} demand\xE9e avec ${escapedHtml(subject)}.</p><p><strong>R\xE9sultat</strong><br>${resultFormMarkup(actualForm)}</p></details>${exception}`;
    }
    if (approach === "cif-falc") {
      const answerDisplay = displayedAnswerForm(question, infinitive, verb) || actualForm;
      return `<ol><li>Pars de l\u2019infinitif <strong>${escapedHtml(infinitive)}</strong>.</li><li>Pour ce temps, utilise le radical ${base}.</li><li>Ajoute la terminaison ${ending}.</li></ol><p><strong>R\xE9sultat</strong><br>${resultFormMarkup(answerDisplay)}</p>${exception}`;
    }
    const familyFact2 = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : "";
    const suppletism = isSuppletive ? "<p>Le paradigme pr\xE9sente du <strong>suppl\xE9tisme</strong> : plusieurs radicaux historiquement distincts coexistent.</p>" : "";
    return `<p>Pour <strong>${escapedHtml(infinitive)}</strong> avec <strong>${escapedHtml(subject)}</strong> ${escapedHtml(context)}, le paradigme fournit le <strong>radical contextuel</strong> ${base}; on lui ajoute la <strong>d\xE9sinence</strong> ${ending}.</p><p><strong>R\xE9sultat</strong><br>${resultFormMarkup(actualForm)}</p><p>Ce radical est appris avec la famille du verbe, et non extrait de la r\xE9ponse attendue.${alternation}</p>${familyFact2}${suppletism}${exception}`;
  }
  if (reference) {
    const referenceKnowledge = highlightedReference ? `<figure>${knowledgeCaption()}<blockquote><strong>Forme rep\xE8re</strong><p>Apprends par c\u0153ur cette forme rep\xE8re ${escapedHtml(tenseContext(question, tense))} :</p><p>${highlightedReference}</p></blockquote></figure>` : "";
    const answerDisplay = displayedAnswerForm(question, infinitive, verb);
    const displayedAnswerCore = conjugatedCore$1(answerDisplay || actualForm);
    const pastSimpleUSeries = reference.kind === "past-simple-il" && normalized$1(reference.form).endsWith("ut");
    const pastSimpleURadical = pastSimpleUSeries ? reference.form.slice(0, -1) : "";
    const normalizedAnswer = normalized$1(displayedAnswerCore);
    const normalizedURadical = normalized$1(pastSimpleURadical);
    const uSeriesRadicalInAnswer = pastSimpleUSeries && normalizedAnswer.startsWith(normalizedURadical) ? displayedAnswerCore.slice(0, pastSimpleURadical.length) : pastSimpleURadical;
    const uSeriesEndingInAnswer = pastSimpleUSeries && normalizedAnswer.startsWith(normalizedURadical) ? displayedAnswerCore.slice(pastSimpleURadical.length) : "";
    const transformation = reference.kind === "memorized-form" ? "M\xE9morise cette forme rep\xE8re." : pastSimpleUSeries ? `\xC0 partir de cette forme rep\xE8re, retiens le radical du pass\xE9 simple ${radicalBadge(pastSimpleURadical)}.${normalized$1(uSeriesRadicalInAnswer) !== normalized$1(pastSimpleURadical) ? ` Dans la r\xE9ponse, il s\u2019\xE9crit ${radicalBadge(uSeriesRadicalInAnswer)}.` : ""}` : reference.removableEnding ? `Retire ${removedEndingBadge(reference.removableEnding)} pour obtenir le radical ${radicalBadge(reference.radical)}.` : `Le radical rep\xE8re est ${radicalBadge(reference.radical)}.`;
    const assemble = reference.targetEnding !== void 0 ? pastSimpleUSeries && uSeriesEndingInAnswer ? `Ajoute ${endingBadge(uSeriesEndingInAnswer)} pour former <strong>${escapedHtml(displayedAnswerCore)}</strong>.` : reference.targetEnding ? `Ajoute la terminaison <code>-${escapedHtml(reference.targetEnding)}</code> pour former <strong>${escapedHtml(displayedAnswerCore || actualForm)}</strong>.` : `Avec <strong>${escapedHtml(subject)}</strong>, garde cette forme : elle s\u2019\xE9crit <strong>${escapedHtml(displayedAnswerCore || actualForm)}</strong>.` : `Utilise cette forme avec ${escapedHtml(subject)} pour obtenir <strong>${escapedHtml(displayedAnswerCore || actualForm)}</strong>.`;
    if (approach === "concise") return `${referenceKnowledge}<p>${transformation} ${assemble}</p>`;
    if (approach === "guided-discovery") return `${referenceKnowledge}<details><summary>Indice 1 \xB7 La forme rep\xE8re</summary><p>Pars de ${highlightedReference}.</p></details><details><summary>Indice 2 \xB7 Le radical</summary><p>${transformation}</p></details><details><summary>Indice 3 \xB7 La forme demand\xE9e</summary><p>${assemble}</p></details>`;
    if (approach === "cif-falc") return `${referenceKnowledge}<figure><figcaption>Construis la r\xE9ponse</figcaption><ol><li>Pars de la forme rep\xE8re :<br>${highlightedReference}</li><li>${transformation}</li><li>${assemble}</li></ol></figure>`;
    return `<p>La forme rep\xE8re est ${highlightedReference}. ${transformation}</p><p>Cette forme rep\xE8re a \xE9t\xE9 v\xE9rifi\xE9e contre le paradigme enregistr\xE9 avant d\u2019\xEAtre propos\xE9e.</p>`;
  }
  const strongIrregularity = isSuppletive ? "Ce verbe est tr\xE8s irr\xE9gulier : son paradigme est suppl\xE9tif et ne repose pas sur un radical unique." : `Le radical varie avec la famille du verbe et parfois avec la personne ${escapedHtml(context)}.`;
  if (approach === "concise") {
    return `<p><strong>${escapedHtml(infinitive)}</strong> est tr\xE8s irr\xE9gulier ici : apprends cette forme avec son temps et sa personne.</p><p>${rememberedFormMarkup(actualForm)}</p>`;
  }
  if (approach === "guided-discovery") {
    return `<details><summary>Indice 1 \xB7 L\u2019infinitif</summary><p>Pars de <strong>${escapedHtml(infinitive)}</strong> et identifie sa famille.</p></details><details><summary>Indice 2 \xB7 Les formes rep\xE8res</summary><p>Ce verbe emploie plusieurs radicaux${family ? ` dans la famille \xAB ${escapedHtml(family)} \xBB` : ""}. Il n\u2019existe pas de retrait m\xE9canique fiable.</p></details><details><summary>Indice 3 \xB7 Conclusion</summary><p>Apprends cette forme, puis r\xE9utilise-la comme mod\xE8le :</p><p>${rememberedFormMarkup(actualForm)}</p></details>`;
  }
  if (approach === "cif-falc") {
    return `<ol><li>Pars de l\u2019infinitif <strong>${escapedHtml(infinitive)}</strong>.</li><li>Ce verbe change beaucoup : il n\u2019a pas toujours le m\xEAme radical.</li><li>Apprends cette forme comme un mod\xE8le :<br>${rememberedFormMarkup(actualForm)}</li></ol>`;
  }
  const lexicalFact = isSuppletive ? "" : `<p>Le radical lexical indicatif est ${radicalBadge(lexical)}, mais il ne suffit pas \xE0 pr\xE9dire s\xFBrement cette forme.</p>`;
  const familyFact = family ? `<p><strong>Famille de conjugaison :</strong> ${escapedHtml(family)}.</p>` : "";
  return `<p>${strongIrregularity}</p><p>Aucune r\xE8gle de retrait fond\xE9e sur la r\xE9ponse attendue n\u2019est propos\xE9e : elle serait circulaire. Il faut rattacher cette forme \xE0 son paradigme ou \xE0 sa famille.</p><p>La forme \xE0 retenir est ${rememberedFormMarkup(actualForm)}.</p>${lexicalFact}${familyFact}`;
}
function buildConjugationEndingsHtml(question, verb, tense, approach = "grammatical-technical") {
  var _a, _b, _c;
  if (question.voice === "passive") {
    return `${buildPassiveVoiceMethodHtml(question, verb, tense)}${buildPassiveVoiceHelpHtml(question)}`;
  }
  if (isNearFutureTense({ code: question.tenseCode || (tense == null ? void 0 : tense.code), name: question.temps || (tense == null ? void 0 : tense.name) })) {
    return nearFutureHelpHtml(question);
  }
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe";
  const rule = tenseRule(question, verb, tense);
  const endingsAreFamilyDependent = !hasFamilyIndependentEndings(question, verb, tense);
  const endingItems = endingsAreFamilyDependent ? [] : rule.endingItems;
  const context = tenseContext(question, tense);
  const decomposition = decomposeConjugationForm(question, verb, tense);
  const requestedEnding = subjectIndex(question) === null ? "" : endingItems[subjectIndex(question)] || "";
  const introduction = `<p>Le verbe <strong>${escapedHtml(infinitive)}</strong> est ${verbGroupDescription(verb, infinitive)}.</p>`;
  const reference = ((_a = question.radicalReference) == null ? void 0 : _a.validated) === false ? void 0 : question.radicalReference;
  const referenceSubject = ((_b = reference == null ? void 0 : reference.referenceSubject) == null ? void 0 : _b.trim()) || "";
  const referenceDisplay = (reference == null ? void 0 : reference.form) ? displayedConjugatedForm(referenceSubject, reference.form, infinitive, verb) : "";
  const referenceReminder = referenceDisplay ? `<p><strong>${(reference == null ? void 0 : reference.kind) === "memorized-stem" ? "Radical rep\xE8re" : "Forme rep\xE8re"} :</strong> ${(reference == null ? void 0 : reference.kind) === "memorized-stem" ? `<mark>${escapedHtml(referenceDisplay)}</mark>` : rememberedFormMarkup(referenceDisplay)}.</p>` : "";
  if (reference && requestedFormIsReference(question, reference) && shouldUseReferenceMethodForRegularForm(question, reference, verb, tense)) {
    return requestedReferenceHelpHtml(question, tense, reference, verb);
  }
  if (approach === "concise") {
    if (decomposition) {
      return `${referenceReminder}<p><strong>${escapedHtml(infinitive)}</strong> : prends <code>${escapedHtml(decomposition.base)}-</code>, puis ajoute <code>-${escapedHtml(decomposition.ending)}</code>.</p>`;
    }
    if (requestedEnding) {
      return `${referenceReminder}<p><strong>${escapedHtml(infinitive)}</strong> ${escapedHtml(context)} : cherche la base de cette forme et ajoute ${endingBadge(requestedEnding)}.</p>`;
    }
    return `${referenceReminder}<p><strong>${escapedHtml(infinitive)}</strong> change beaucoup ici : appuie-toi sur sa forme et sa famille.</p>`;
  }
  if (approach === "guided-discovery") {
    const baseClue = decomposition ? `Observe la forme demand\xE9e : quelle partie reste si tu retires ${endingBadge(decomposition.ending)} ?` : `Compare les formes de la famille de <strong>${escapedHtml(infinitive)}</strong>. Quelle partie retrouves-tu ?`;
    const endingClue = requestedEnding ? `Pour ${escapedHtml(question.pronom || question.saisiePrefixe || "cette personne")}, la terminaison attendue est ${endingBadge(requestedEnding)}.` : `Quelle forme de cette famille correspond \xE0 ${escapedHtml(question.pronom || question.saisiePrefixe || "la personne demand\xE9e")} ?`;
    return `<p>Ouvre les indices un par un et essaie de r\xE9pondre avant de lire le suivant.</p><details><summary>Indice 1 \xB7 Le temps</summary><p>La forme est demand\xE9e ${escapedHtml(context)}. Quelle forme connue peux-tu utiliser comme point de d\xE9part ?</p>${referenceReminder}</details><details><summary>Indice 2 \xB7 La base</summary><p>${baseClue}</p></details><details><summary>Indice 3 \xB7 La terminaison</summary><p>${endingClue}</p></details><details><summary>Derni\xE8re v\xE9rification</summary><p>Assemble les deux parties, puis relis la phrase avec son sujet.</p></details>`;
  }
  if (approach === "cif-falc") {
    const baseStep = rule.endingsKind === "auxiliary" ? `Choisis l\u2019auxiliaire <strong>${escapedHtml(rule.auxiliaryLabel)}</strong>.` : decomposition ? `Trouve la base : ${radicalBadge(decomposition.base)}.` : `Trouve la base en regardant la famille du verbe <strong>${escapedHtml(infinitive)}</strong>.`;
    const endingStep = rule.endingsKind === "auxiliary" && requestedEnding ? `Conjugue-le : ${endingBadge(requestedEnding)}. Ajoute le participe pass\xE9, puis relis.` : decomposition ? `Ajoute ${endingBadge(decomposition.ending)}, puis relis la phrase.` : requestedEnding ? `Ajoute ${endingBadge(requestedEnding)}, puis relis la phrase.` : "Choisis la forme qui va avec le sujet, puis relis la phrase.";
    const referenceStep = referenceDisplay ? ` Appuie-toi sur la forme rep\xE8re ${rememberedFormMarkup(referenceDisplay)}.` : "";
    return `<ol><li>Regarde le temps : ${escapedHtml(context)}.${referenceStep}</li><li>${baseStep}</li><li>${endingStep}</li></ol>`;
  }
  if (!endingItems.length) {
    const normalizedInfinitive2 = normalized$1(infinitive);
    const suppl\u00E9tive = normalizedInfinitive2 === "aller" || normalizedInfinitive2 === "etre" ? " Son paradigme comporte du suppl\xE9tisme : certaines formes proviennent de radicaux historiquement diff\xE9rents." : "";
    return `${introduction}${referenceReminder}<p>Il n\u2019existe pas de s\xE9rie unique de d\xE9sinences ${escapedHtml(context)} pour ce verbe. Le radical d\xE9pend de sa famille et parfois de la personne.${suppl\u00E9tive}</p><p>Il faut donc partir de la forme attest\xE9e, puis identifier sa d\xE9sinence.</p>`;
  }
  const lead = rule.endingsKind === "auxiliary" ? `<p>${context.replace(/^./u, (character) => character.toLocaleUpperCase("fr"))}, le verbe se construit avec l\u2019auxiliaire <strong>${escapedHtml(rule.auxiliaryLabel)}</strong>. Les formes de cet auxiliaire sont :</p>` : `<p>Ses terminaisons ${escapedHtml(context)} sont :</p>`;
  const pronouns = endingPronouns(question.mode || ((_c = tense == null ? void 0 : tense.mode) == null ? void 0 : _c.name) || "", endingItems.length);
  const rows = endingItems.map((ending, index) => `<tr><th>${escapedHtml(pronouns[index] || `forme ${index + 1}`)}</th><td>${escapedHtml(ending)}</td></tr>`).join("");
  const construction = decomposition ? `<p><strong>${escapedHtml(decomposition.baseLabel)}</strong> : ${assembledFormBadges(decomposition.base, decomposition.ending)}. Cette construction associe un <strong>radical contextuel</strong> et une <strong>d\xE9sinence</strong>.</p>` : "";
  const stem = lexicalStem(infinitive, verb == null ? void 0 : verb.terminaison);
  const alternation = decomposition && normalized$1(stem) !== normalized$1(decomposition.base) ? `<p>Le radical contextuel diff\xE8re du radical lexical ${radicalBadge(stem)} : il s\u2019agit d\u2019une alternance command\xE9e par cette conjugaison.</p>` : "";
  const normalizedInfinitive = normalized$1(infinitive);
  const suppl\u00E9tism = normalizedInfinitive === "aller" || normalizedInfinitive === "etre" ? "<p>Ce paradigme pr\xE9sente aussi du <strong>suppl\xE9tisme</strong> : plusieurs radicaux d\u2019origines diff\xE9rentes coexistent.</p>" : "";
  return `${introduction}${referenceReminder}${construction}${alternation}${suppl\u00E9tism}${lead}<table><tbody>${rows}</tbody></table>`;
}
function hideConstructionAnswerBadges(html) {
  return html.replace(
    /<figure><figcaption>(Construis la réponse|Trouve le radical|Trouve le radical du futur|Réponse)<\/figcaption>([\s\S]*?)<\/figure>/gu,
    (_figure, caption, rawBody) => {
      const body = rawBody.replace(/<span>[\s\S]*?<\/span>/gu, "").replace(/pour former\s*<strong>[\s\S]*?<\/strong>/gu, "pour former la r\xE9ponse").replace(/Ajoute\s+<samp>[\s\S]*?<\/samp>/gu, "Ajoute la terminaison qui correspond \xE0 la personne demand\xE9e").replace(/il reste le radical\s*<var>[\s\S]*?<\/var>/gu, "il reste le radical").replace(/tu obtiens(?: d’abord)? le radical\s*<var>[\s\S]*?<\/var>/gu, "tu obtiens le radical \xE0 utiliser").replace(/tu obtiens\s*<var>[\s\S]*?<\/var>/gu, "tu obtiens le radical \xE0 utiliser").replace(/point de départ\s*<var>[\s\S]*?<\/var>/gu, "point de d\xE9part \xE0 trouver").replace(/radical du futur\s*<var>[\s\S]*?<\/var>/gu, "radical du futur \xE0 trouver").replace(/au radical\s*<var>[\s\S]*?<\/var>/gu, "au radical que tu as trouv\xE9").replace(/le radical\s*<var>[\s\S]*?<\/var>/gu, "le radical \xE0 trouver").replace(/<var>[\s\S]*?<\/var>/gu, "le radical \xE0 trouver").replace(/<samp>[\s\S]*?<\/samp>/gu, "la terminaison \xE0 trouver").replace(/\s*:\s*<\/p>/gu, ".</p>");
      return `<figure><figcaption>${caption}</figcaption>${body}</figure>`;
    }
  );
}
function answerFreeNonPersonalHelpHtml(question, verb, tense) {
  var _a;
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe";
  const irregularPresentParticiple = ["avoir", "etre", "savoir"].includes(normalized$1(bareInfinitive(infinitive)));
  if (mode === "participe" && time === "present") {
    const method = irregularPresentParticiple ? "<li>Ce verbe a un participe pr\xE9sent irr\xE9gulier : retrouve la forme apprise par c\u0153ur.</li><li>V\xE9rifie qu\u2019elle se termine bien par <strong>-ant</strong>.</li>" : "<li>Prends la forme avec <strong>nous</strong> au pr\xE9sent.</li><li>Enl\xE8ve <strong>-ons</strong>, puis ajoute <strong>-ant</strong>.</li>";
    return `<figure><figcaption>Participe pr\xE9sent</figcaption><ol><li>Rep\xE8re le verbe <strong>${escapedHtml(infinitive)}</strong>.</li>${method}</ol></figure>`;
  }
  if (mode === "participe" && time === "passe") {
    return `<figure><figcaption>Participe pass\xE9</figcaption><ol><li>Rep\xE8re le verbe <strong>${escapedHtml(infinitive)}</strong>.</li><li>Retrouve son participe pass\xE9 dans les formes apprises : il n\u2019est pas toujours pr\xE9visible \xE0 partir de l\u2019infinitif.</li><li>V\xE9rifie ensuite s\u2019il faut l\u2019accorder.</li></ol></figure>`;
  }
  if (mode === "gerondif" && time === "present") {
    const participle = irregularPresentParticiple ? "Retrouve le participe pr\xE9sent irr\xE9gulier de ce verbe dans les formes apprises." : "Construis le participe pr\xE9sent : forme avec \xAB nous \xBB au pr\xE9sent, sans <strong>-ons</strong>, puis <strong>-ant</strong>.";
    return `<figure><figcaption>G\xE9rondif pr\xE9sent</figcaption><ol><li>${participle}</li><li>Place <strong>en</strong> devant le participe pr\xE9sent.</li><li>Relis l\u2019ensemble dans la phrase.</li></ol></figure>`;
  }
  if (mode === "gerondif" && time === "passe") {
    return `<figure><figcaption>G\xE9rondif pass\xE9</figcaption><ol><li>Choisis l\u2019auxiliaire <strong>avoir</strong> ou <strong>\xEAtre</strong> qui convient au verbe.</li><li>Mets cet auxiliaire au participe pr\xE9sent.</li><li>Ajoute le participe pass\xE9 du verbe et v\xE9rifie son accord.</li><li>Place <strong>en</strong> devant l\u2019ensemble.</li></ol></figure>`;
  }
  return "";
}
function buildCompleteConjugationAdviceHtml(question, verb, tense) {
  var _a, _b;
  if (question.voice === "passive") {
    return `${buildPassiveVoiceMethodHtml(question, verb, tense, false)}${buildPassiveVoiceHelpHtml(question, verb, tense, false)}`;
  }
  if (isNearFutureTense({ code: question.tenseCode || (tense == null ? void 0 : tense.code), name: question.temps || (tense == null ? void 0 : tense.name) })) {
    return nearFutureHelpHtml(question, false);
  }
  if (question.isCompound || (tense == null ? void 0 : tense.isCompound)) {
    return buildCompoundConjugationHtml(question, verb, tense, false);
  }
  const mode = normalized$1(question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name));
  const time = normalized$1(question.temps || (tense == null ? void 0 : tense.name));
  const nonPersonalHelp = answerFreeNonPersonalHelpHtml(question, verb, tense);
  if (nonPersonalHelp) return nonPersonalHelp;
  const reference = ((_b = question.radicalReference) == null ? void 0 : _b.validated) === false ? void 0 : question.radicalReference;
  if (mode === "conditionnel" && time === "present") {
    return conditionalPresentHelpHtml(question, verb, reference, false);
  }
  let html = buildConjugationBaseHtml(question, verb, tense, "cif-falc");
  html = html.replace(/<blockquote><strong>Résultat<\/strong>[\s\S]*?<\/blockquote>/gu, "").replace(/<p><strong>Résultat<\/strong><br>[\s\S]*?<\/p>/gu, "").replace(/<strong>Résultat<\/strong><b>[\s\S]*?<i>✓<\/i><\/b>/gu, "").replace(/<b>[\s\S]*?<i>✓<\/i><\/b>/gu, "").replace(/<mark>([\s\S]*?)<\/mark>/gu, "$1").replace(/<td><samp>([\s\S]*?)<\/samp><\/td>/gu, "<td><strong>$1</strong></td>");
  html = hideConstructionAnswerBadges(html);
  return html.replace(/<p>\s*…?\s*<\/p>/gu, "").replace(/<b>\s*…?\s*<\/b>/gu, "").replace(/<blockquote>\s*<\/blockquote>/gu, "").replace(/<figure><figcaption>(?:Réponse|Résultat)<\/figcaption>\s*<\/figure>/gu, "");
}
function meaningFor(question, verb) {
  var _a;
  if ((_a = verb == null ? void 0 : verb.meaning) == null ? void 0 : _a.trim()) return verb.meaning.trim();
  const descriptions = unique(((verb == null ? void 0 : verb.categoriesSemantiques) || []).map((category) => semanticMeanings[category]));
  if (descriptions.length) return `Ce verbe ${descriptions.join(" et ")}.`;
  if (question.complement) return `Dans cette question, son sens se comprend avec \xAB ${question.complement} \xBB.`;
  return "Observe la phrase enti\xE8re pour d\xE9terminer le sens pr\xE9cis du verbe dans ce contexte.";
}
function targetedWarnings(question, verb) {
  const warnings = [];
  const infinitive = normalized$1(question.infinitif || (verb == null ? void 0 : verb.infinitif));
  const particularities = new Set(((verb == null ? void 0 : verb.particularites) || []).map(normalized$1));
  if (question.voice === "passive") {
    warnings.push("\xC0 la voix passive, le participe pass\xE9 s\u2019accorde avec le sujet qui subit l\u2019action.");
  }
  if (infinitive.endsWith("ger") || particularities.has("ger")) {
    warnings.push("Verbe en -ger : devant a ou o, on garde le son doux de g en ajoutant e, par exemple \xAB nous mangeons \xBB.");
  }
  if (infinitive.endsWith("cer") || particularities.has("cer")) {
    warnings.push("Verbe en -cer : devant a ou o, c devient \xE7 pour garder le son [s], par exemple \xAB nous commen\xE7ons \xBB.");
  }
  if (infinitive.endsWith("guer")) {
    warnings.push("Verbe en -guer : le u appartient au radical et se conserve, par exemple \xAB nous naviguons \xBB.");
  }
  if (infinitive.endsWith("yer")) {
    warnings.push("Verbe en -yer : le y peut devenir i devant un e muet ; certaines formes admettent deux graphies.");
  }
  if (/(?:eler|eter)$/.test(infinitive)) {
    warnings.push("V\xE9rifie la famille du verbe : selon le verbe, la consonne double ou le e devient \xE8 devant une syllabe muette.");
  }
  if ((verb == null ? void 0 : verb.isPronominalForm) || (verb == null ? void 0 : verb.typePronominal) === "essentiel" || particularities.has("pronominal")) {
    warnings.push(particularityLabels.pronominal);
  }
  if ((verb == null ? void 0 : verb.estImpersonnel) || particularities.has("impersonnel")) warnings.push(particularityLabels.impersonnel);
  if ((verb == null ? void 0 : verb.estDefectif) || particularities.has("defectif")) warnings.push(particularityLabels.defectif);
  for (const key of ["formes-alternatives", "auxiliaire-variable"]) {
    if (particularities.has(key)) warnings.push(particularityLabels[key]);
  }
  if (question.agreementReminder) {
    const reminder = question.agreementReminder;
    if (reminder.kind === "cod-before") {
      warnings.push(`Le COD \xAB ${reminder.complement} \xBB est plac\xE9 avant : avec avoir, v\xE9rifie l\u2019accord du participe pass\xE9.`);
    } else if (reminder.kind === "cod-after") {
      warnings.push(`Le COD \xAB ${reminder.complement} \xBB est plac\xE9 apr\xE8s : avec avoir, le participe pass\xE9 ne s\u2019accorde pas avec lui.`);
    } else {
      warnings.push(`\xAB ${reminder.complement} \xBB est un COI : il ne commande pas l\u2019accord du participe pass\xE9.`);
    }
  } else if ((question.isCompound || false) && normalized$1(verb == null ? void 0 : verb.auxiliaire) === "etre") {
    warnings.push("Avec l\u2019auxiliaire \xEAtre, le participe pass\xE9 s\u2019accorde g\xE9n\xE9ralement avec le sujet.");
  }
  if (question.mode && normalized$1(question.mode) === "subjonctif" && !normalized$1(question.saisiePrefixe).startsWith("que")) {
    warnings.push("Au subjonctif, pense \xE0 introduire la forme par \xAB que \xBB lorsque la phrase le demande.");
  }
  return unique(warnings);
}
function buildTargetedConjugationHelp(question, verb, tense, localizedLabels = {}) {
  var _a, _b;
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "ce verbe";
  const stem = lexicalStem(infinitive, verb == null ? void 0 : verb.terminaison);
  const tenseName = [question.temps || (tense == null ? void 0 : tense.name), question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name)].filter(Boolean).join(" \xB7 ");
  const rule = tenseRule(question, verb, tense);
  const decomposition = decomposeConjugationForm(question, verb, tense);
  const warnings = targetedWarnings(question, verb);
  const subject = question.pronom || question.saisiePrefixe;
  const rawMode = question.mode || ((_b = tense == null ? void 0 : tense.mode) == null ? void 0 : _b.name) || "";
  const displayedTense = localizedLabels.tense || question.temps || (tense == null ? void 0 : tense.name) || "";
  const displayedMode = localizedLabels.mode || rawMode;
  const helpTitle = [
    subject,
    infinitive,
    displayedMode && normalized$1(rawMode) !== "indicatif" ? `${displayedTense} (${displayedMode})` : displayedTense
  ].filter(Boolean).join(" | ");
  const method = [
    question.voice === "passive" ? `Rep\xE8re le sujet qui subit l\u2019action : ${question.passiveSubject || subject}.` : subject ? `Rep\xE8re la personne : ${subject}.` : "Rep\xE8re la personne demand\xE9e.",
    question.voice === "passive" ? "Conjugue \xEAtre au temps demand\xE9, puis ajoute le participe pass\xE9 du verbe." : question.isCompound || (tense == null ? void 0 : tense.isCompound) ? "Conjugue d\u2019abord l\u2019auxiliaire, puis ajoute le participe pass\xE9." : "Choisis le bon radical, puis ajoute la terminaison de cette personne.",
    question.voice === "passive" ? "Accorde le participe pass\xE9 avec le sujet de la phrase passive." : question.complement ? `Relis la phrase avec \xAB ${question.complement} \xBB pour v\xE9rifier le sens et l\u2019accord.` : "Relis la forme obtenue \xE0 voix basse pour v\xE9rifier qu\u2019elle convient."
  ];
  return {
    title: helpTitle || `Aide pour \xAB ${infinitive} \xBB`,
    subtitle: tenseName || "Question en cours",
    requestedForm: requestedFormLabel(question, tense),
    meaning: meaningFor(question, verb),
    verbFacts: [
      { label: "Groupe", value: groupLabel(verb) },
      { label: (decomposition == null ? void 0 : decomposition.baseLabel) || "Radical lexical", value: `${(decomposition == null ? void 0 : decomposition.base) || stem}-` },
      ...(verb == null ? void 0 : verb.familleConjugaison) ? [{ label: "Famille", value: verb.familleConjugaison.replaceAll("-", " ") }] : [],
      ...(verb == null ? void 0 : verb.participePasse) && (question.isCompound || (tense == null ? void 0 : tense.isCompound)) ? [{ label: "Participe pass\xE9", value: verb.participePasse }] : []
    ],
    formation: question.voice === "passive" ? ["Voix passive = sujet + \xEAtre conjugu\xE9 + participe pass\xE9 accord\xE9."] : [rule.rule],
    endings: question.voice === "passive" ? null : rule.endings,
    exception: rule.exception,
    warnings,
    method,
    decomposition
  };
}

const COACH_HELP_PROFILES = {
  "complete-avec-reponses": {
    id: "complete-avec-reponses",
    label: "Compl\xE8te avec r\xE9ponses",
    description: "Explication d\xE9taill\xE9e avec r\xE9ponses et surlignages.",
    blocks: ["definition", "complete-with-answers"],
    revealsAnswers: true,
    highlightsTarget: true,
    conditionalBlocks: ["pronominal", "orthography"],
    legacyPresentation: "cif-falc"
  },
  complete: {
    id: "complete",
    label: "Compl\xE8te sans r\xE9ponses",
    description: "Explication d\xE9taill\xE9e et conseils, sans r\xE9v\xE9ler la r\xE9ponse.",
    blocks: ["definition", "complete-advice"],
    revealsAnswers: false,
    highlightsTarget: false,
    conditionalBlocks: ["pronominal", "orthography", "cod-before"],
    legacyPresentation: "cif-falc"
  },
  "tres-condensee": {
    id: "tres-condensee",
    label: "Tr\xE8s condens\xE9e",
    description: "Un rappel du groupe et une r\xE8gle courte adapt\xE9e au mode et au temps.",
    blocks: ["definition", "condensed-verb-group", "condensed-tense-rule"],
    revealsAnswers: false,
    highlightsTarget: false,
    conditionalBlocks: ["pronominal", "participle-agreement"],
    legacyPresentation: "concise"
  },
  allophone: {
    id: "allophone",
    label: "Allophone",
    description: "Une aide pas \xE0 pas, avec les r\xE9ponses, pens\xE9e pour les personnes qui apprennent le fran\xE7ais et le parlent depuis peu.",
    blocks: ["definition", "complete-with-answers"],
    revealsAnswers: true,
    highlightsTarget: true,
    conditionalBlocks: ["pronominal", "orthography"],
    legacyPresentation: "cif-falc"
  }
};
const LEGACY_ENGINE_KEYS = {
  "cif-falc": "complete-avec-reponses",
  concise: "tres-condensee",
  "grammatical-technical": "complete",
  "guided-discovery": "allophone"
};
function normalizeCoachHelpEngineKey(value) {
  if (typeof value === "string" && COACH_HELP_ENGINE_KEYS.includes(value)) return value;
  if (typeof value === "string" && LEGACY_ENGINE_KEYS[value]) return LEGACY_ENGINE_KEYS[value];
  return "complete-avec-reponses";
}
function coachHelpProfile(value) {
  return COACH_HELP_PROFILES[normalizeCoachHelpEngineKey(value)];
}

function reportedAuditErrors(value) {
  if (!value || typeof value !== "object") return [];
  const issues = value.issues;
  if (!Array.isArray(issues)) return [];
  return issues.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const item = candidate;
    if (item.severity !== "error" || typeof item.code !== "string") return [];
    return [{
      code: item.code.slice(0, 120),
      severity: "error",
      title: typeof item.title === "string" ? item.title.slice(0, 200) : "Erreur d\xE9tect\xE9e dans le navigateur",
      detail: typeof item.detail === "string" ? item.detail.slice(0, 500) : "Le navigateur a remplac\xE9 l\u2019aide par son affichage s\xE9curis\xE9."
    }];
  });
}
function automaticHelpErrorsForRecording(serverAudit, clientAudit) {
  const serverErrors = serverAudit.issues.filter((item) => item.severity === "error");
  if (serverErrors.length) return serverErrors;
  const clientErrors = reportedAuditErrors(clientAudit);
  if (!clientErrors.length) return [];
  const codes = [...new Set(clientErrors.map((item) => item.code))].join(", ");
  return [issue(
    "client-server-audit-mismatch",
    "error",
    "Audits client et serveur diff\xE9rents",
    `Le navigateur a affich\xE9 l\u2019aide s\xE9curis\xE9e pour \xAB ${codes} \xBB, mais le serveur n\u2019a pas reproduit cette erreur.`
  )];
}
function normalized(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[’]/gu, "'").replace(/\s+/gu, " ").trim().toLocaleLowerCase("fr");
}
function decodeHtmlEntities(value) {
  return value.replace(/&nbsp;/giu, " ").replace(/&#(?:0*39);|&#x0*27;|&apos;/giu, "'").replace(/&quot;/giu, '"').replace(/&amp;/giu, "&").replace(/&lt;/giu, "<").replace(/&gt;/giu, ">");
}
function renderedContainsForm(renderedHtml, target) {
  const decoded = decodeHtmlEntities(renderedHtml);
  const visible = decoded.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
  const joinedBadges = decoded.replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
  return normalized(visible).includes(normalized(target)) || normalized(joinedBadges).includes(normalized(target));
}
function conjugatedCore(value) {
  return (value || "").trim().replace(/[.!?…]+$/gu, "").replace(/^(?:je|j['’]|tu|il|elle|on|nous|vous|ils|elles)\s+/iu, "").replace(/^(?:me|te|se|nous|vous)\s+/iu, "").replace(/^[mts]['’]/iu, "").trim();
}
function expectedCompoundCore(question, verb) {
  var _a, _b, _c, _d;
  const source = ((_a = question.conjugaison1) == null ? void 0 : _a.trim()) || "";
  const baseParticiple = ((_b = verb.participePasse) == null ? void 0 : _b.trim()) || "";
  const expectedParticiple = ((_d = (_c = question.agreementReminder) == null ? void 0 : _c.participle) == null ? void 0 : _d.trim()) || "";
  if (!source || !baseParticiple || !expectedParticiple) return "";
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return source.replace(new RegExp(`${escaped}(?:e|s|es)?(?=$|[\\s.,!?;:\u2019'])`, "iu"), expectedParticiple);
}
function deniesAnteposedCodAgreement(value) {
  const statement = String.raw`[^.!?]{0,160}`;
  const denial = String.raw`(?:ne s['’]accorde pas|pas d['’]accord)`;
  const anteposedCod = String.raw`cod[^.!?]{0,90}place avant`;
  return new RegExp(`${anteposedCod}${statement}${denial}`, "u").test(value) || new RegExp(`${denial}${statement}${anteposedCod}`, "u").test(value);
}
function blockContents(blocks) {
  return blocks.map((block) => `${block.isActive ? block.content : ""}
${blockContents(block.children || [])}`).join("\n");
}
function issue(code, severity, title, detail) {
  return { code, severity, title, detail };
}
function auditRenderedCoachHelp(input) {
  var _a, _b, _c;
  const { renderedHtml, blocks, question, verb, tense } = input;
  const issues = [];
  const configuredContent = blockContents(blocks);
  const visibleText = decodeHtmlEntities(renderedHtml).replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
  const normalizedVisibleText = normalized(visibleText);
  const profile = coachHelpProfile((_a = blocks.find((block) => block.profileId)) == null ? void 0 : _a.profileId);
  const usesContextualBase = configuredContent.includes("{contextualBaseHelp}");
  const usesEndings = configuredContent.includes("{endingsHelp}") || usesContextualBase;
  const usesDefinition = configuredContent.includes("{definitionHelp}") || configuredContent.includes("{definition}");
  if (!blocks.some((block) => block.isActive)) {
    issues.push(issue("no-active-block", "error", "Aucun bloc actif", "Cette aide ne pr\xE9sente aucun contenu \xE0 l\u2019utilisateur."));
  }
  if (!visibleText) {
    issues.push(issue("empty-render", "error", "Rendu vide", "Le composant ne produit aucun texte visible pour cette forme."));
  }
  if (/\{[A-Za-z][A-Za-z0-9_]*\}/u.test(renderedHtml)) {
    issues.push(issue("unresolved-variable", "error", "Variable non remplac\xE9e", "Le rendu contient encore une variable entre accolades."));
  }
  if (/\b(?:undefined|null|NaN)\b/u.test(visibleText)) {
    issues.push(issue("invalid-value", "error", "Valeur technique visible", "Le rendu expose une valeur technique telle que \xAB undefined \xBB, \xAB null \xBB ou \xAB NaN \xBB."));
  }
  if (usesDefinition && !((_b = verb.meaning) == null ? void 0 : _b.trim())) {
    issues.push(issue("missing-definition", "warning", "D\xE9finition absente", `Le verbe \xAB ${verb.infinitif} \xBB n\u2019a pas de d\xE9finition utilisable dans ce bloc.`));
  }
  const reference = ((_c = question.radicalReference) == null ? void 0 : _c.validated) === false ? void 0 : question.radicalReference;
  const decomposition = decomposeConjugationForm(question, verb, tense);
  if (usesContextualBase && !question.isCompound && !reference) {
    issues.push(issue("missing-reference", "warning", "Forme rep\xE8re absente", "Aucune forme rep\xE8re valid\xE9e n\u2019a \xE9t\xE9 trouv\xE9e pour expliquer cette conjugaison."));
  }
  if (reference) {
    if (reference.removableEnding && !normalized(reference.form).endsWith(normalized(reference.removableEnding))) {
      issues.push(issue("invalid-reference-ending", "error", "Retrait impossible", `La forme rep\xE8re \xAB ${reference.form} \xBB ne se termine pas par \xAB ${reference.removableEnding} \xBB.`));
    }
    const sameContext = normalized(reference.referenceMode) === normalized(question.mode) && normalized(reference.referenceTense) === normalized(question.temps) && normalized(reference.referenceSubject) === normalized(question.pronom || question.saisiePrefixe);
    const requestedFormIsReference = sameContext && normalized(reference.form) === normalized(conjugatedCore(question.conjugaison1));
    const removalBadge = reference.removableEnding ? new RegExp(`<(?:kbd|samp)>-${reference.removableEnding.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}</(?:kbd|samp)>`, "iu") : void 0;
    const explicitReferenceMemorization = /\bforme demandee (?:est justement la|est une) forme repere\b/u.test(normalized(visibleText)) && /apprends(?:-la| la)? par c(?:oe|œ)ur/u.test(normalized(visibleText));
    const circularOperation = /\b(?:pars|prends) de la forme repere\b/u.test(normalized(visibleText)) || /\b(?:enleve|retire)\b/u.test(normalized(visibleText));
    if (requestedFormIsReference && (removalBadge == null ? void 0 : removalBadge.test(renderedHtml)) && circularOperation && !explicitReferenceMemorization) {
      issues.push(issue("circular-reference", "warning", "Forme rep\xE8re identique \xE0 la r\xE9ponse", "L\u2019explication doit pr\xE9senter cette forme comme un rep\xE8re \xE0 m\xE9moriser et ne pas pr\xE9tendre la reconstruire \xE0 partir d\u2019elle-m\xEAme."));
    }
    if (!reference.referenceTense || !reference.referenceMode) {
      issues.push(issue("reference-context-missing", "warning", "Contexte de la forme rep\xE8re incomplet", "Le temps ou le mode de la forme rep\xE8re n\u2019est pas explicitement renseign\xE9."));
    }
  }
  if (decomposition) {
    const reconstructed = `${decomposition.base}${decomposition.ending}`;
    if (normalized(reconstructed) !== normalized(conjugatedCore(question.conjugaison1))) {
      issues.push(issue("invalid-assembly", "error", "Assemblage incorrect", `L\u2019assemblage \xAB ${reconstructed} \xBB ne correspond pas \xE0 \xAB ${question.conjugaison1} \xBB.`));
    }
    const requestedFormIsReference = reference && normalized(reference.referenceMode) === normalized(question.mode) && normalized(reference.referenceTense) === normalized(question.temps) && normalized(reference.referenceSubject) === normalized(question.pronom || question.saisiePrefixe) && normalized(reference.form) === normalized(conjugatedCore(question.conjugaison1));
    if (profile.highlightsTarget && usesEndings && (reference == null ? void 0 : reference.kind) !== "memorized-stem" && !requestedFormIsReference && !renderedHtml.includes(`<samp>-${decomposition.ending}</samp>`)) {
      issues.push(issue("target-ending-not-highlighted", "warning", "Terminaison demand\xE9e non mise en \xE9vidence", `La terminaison \xAB -${decomposition.ending} \xBB n\u2019est pas identifiable dans le rendu.`));
    }
  }
  const target = conjugatedCore(question.conjugaison1);
  if (profile.revealsAnswers && target && usesContextualBase && !renderedContainsForm(renderedHtml, target)) {
    issues.push(issue("target-form-missing", "warning", "Forme attendue absente", `La forme \xAB ${target} \xBB n\u2019appara\xEEt pas dans l\u2019explication automatique.`));
  }
  if (question.agreementReminder) {
    const officialForm = expectedCompoundCore(question, verb);
    if (profile.revealsAnswers && officialForm && !renderedContainsForm(renderedHtml, officialForm)) {
      issues.push(issue(
        "official-compound-answer-missing",
        "error",
        "R\xE9ponse officielle absente de l\u2019aide",
        `L\u2019aide n\u2019affiche pas la forme officielle \xAB ${officialForm} \xBB alors que l\u2019accord attendu porte sur \xAB ${question.agreementReminder.participle} \xBB.`
      ));
    }
    if (question.agreementReminder.kind === "cod-before") {
      if (deniesAnteposedCodAgreement(normalizedVisibleText)) {
        issues.push(issue(
          "cod-before-agreement-contradiction",
          "error",
          "R\xE8gle d\u2019accord contradictoire",
          "Le COD est plac\xE9 avant le verbe, mais l\u2019aide affirme qu\u2019il ne commande pas l\u2019accord."
        ));
      }
    }
  }
  const status = issues.some((item) => item.severity === "error") ? "failed" : issues.length ? "warning" : "passed";
  return { status, issues };
}

export { auditRenderedCoachHelp as a, automaticHelpErrorsForRecording as b, coachHelpProfile as c, buildTargetedConjugationHelp as d, decomposeConjugationForm as e, buildConjugationEndingsHtml as f, buildConjugationBaseHtml as g, buildPassiveVoiceHelpHtml as h, buildPassiveVoiceMethodHtml as i, buildCompleteConjugationAdviceHtml as j, normalizeCoachHelpEngineKey as n };
//# sourceMappingURL=coach-help-audit.mjs.map
