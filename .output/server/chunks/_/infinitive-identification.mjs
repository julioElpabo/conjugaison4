import { aL as formatAnswer, u as useDatabase } from '../nitro/nitro.mjs';
import { b as buildRadicalReference } from './radical-reference.mjs';
import { g as generatePronominalRow } from './pronominal-formatter.mjs';
import { i as isImpersonalVerb } from './impersonal-verbs.mjs';
import { c as infinitiveFormKey, d as INFINITIVE_IDENTIFICATION_INSTRUCTION, e as infinitiveAnswers } from './infinitive-identification2.mjs';

function normalized(value) {
  return value.trim().toLocaleLowerCase("fr-CH");
}
function upperFirst(value) {
  return value ? value.charAt(0).toLocaleUpperCase("fr-CH") + value.slice(1) : value;
}
function variants(value) {
  return [...new Set(value.split("-").map((part) => part.trim()).filter((part) => part && part !== "-"))];
}
function hasPresentParticiple(verb) {
  return variants(verb.participe_present).length > 0;
}
function formatNonFiniteQuestion(verb, tense) {
  const mode = normalized(tense.mode_name);
  const tenseName = normalized(tense.name);
  const infinitive = upperFirst(verb.infinitif);
  let label;
  let answers;
  if (mode === "participe" && tenseName === "pr\xE9sent") {
    label = "Le participe pr\xE9sent";
    answers = variants(verb.participe_present).map(upperFirst);
  } else if (mode === "participe" && tenseName === "pass\xE9") {
    label = "Le participe pass\xE9";
    answers = variants(verb.participe_passe).map(upperFirst);
  } else if (mode === "g\xE9rondif" && tenseName === "pr\xE9sent" && hasPresentParticiple(verb)) {
    label = "Le g\xE9rondif pr\xE9sent";
    answers = variants(verb.participe_present).map((form) => `En ${form}`);
  } else if (mode === "g\xE9rondif" && tenseName === "pass\xE9" && hasPresentParticiple(verb) && verb.auxiliaire_participe_present) {
    label = "Le g\xE9rondif pass\xE9";
    answers = variants(verb.participe_passe).map((form) => `En ${verb.auxiliaire_participe_present} ${form}`);
  } else if (mode === "infinitif" && tenseName === "pr\xE9sent") {
    label = "L\u2019infinitif pr\xE9sent";
    answers = [upperFirst(verb.infinitif)];
  } else if (mode === "infinitif" && tenseName === "pass\xE9" && verb.auxiliaire_infinitif) {
    label = "L\u2019infinitif pass\xE9";
    const auxiliary = /^s[’']|^se\s/u.test(normalized(verb.infinitif)) ? "s\u2019\xEAtre" : normalized(verb.auxiliaire_infinitif);
    answers = variants(verb.participe_passe).map((form) => upperFirst(`${auxiliary} ${form}`));
  } else {
    return null;
  }
  if (answers.length === 0) return null;
  const radicalReference = buildRadicalReference({
    infinitive: verb.infinitif,
    mode: tense.mode_name,
    tense: tense.name,
    personId: null,
    conjugation: answers[0],
    isCompound: Boolean(tense.is_compound) && !(mode === "participe" && tenseName === "pass\xE9")
  }, verb.present_nous ? [{ mode: "indicatif", tense: "pr\xE9sent", personId: 7, pronoun: "nous", form: verb.present_nous }] : []);
  return {
    id: `n-${verb.id}-${tense.id}`,
    verbeId: Number(verb.id),
    tenseId: Number(tense.id),
    personId: null,
    titre: infinitive,
    consigne: `${label} de ${infinitive}`,
    reponses: answers,
    reponsesPourCorrige: answers,
    infinitif: verb.infinitif,
    temps: tense.name,
    mode: tense.mode_name,
    ...tense.code ? { tenseCode: tense.code } : {},
    ...tense.mode_code ? { modeCode: tense.mode_code } : {},
    isCompound: Boolean(tense.is_compound),
    conjugaison1: answers[0],
    conjugaison2: answers[1] || "",
    conjugaison3: answers[2] || "",
    ...radicalReference ? { radicalReference } : {}
  };
}

let cache;
function invalidateInfinitiveLexicon() {
  cache = void 0;
}
function allowedPersons(value) {
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return Array.isArray(value) && value.length ? value.map(Number) : null;
}
async function loadLexicon() {
  const database = useDatabase();
  const [finite, uses, verbs, tenses] = await Promise.all([
    database.execute(`
      SELECT vc.*, v.infinitif, v.auxiliaire, v.\`participe_pass\xE9\` AS participe_passe,
             v.est_impersonnel, v.type_h_initial, p.pronom,
             t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
      FROM verbesconjugues vc
      JOIN verbes v ON v.id=vc.verbe_id AND v.est_archive=0
      JOIN personnes p ON p.id=vc.personne_id
      JOIN temps t ON t.id=vc.temp_id
      JOIN modes m ON m.id=t.mode_id
      WHERE vc.conjugaison1<>''
        AND m.name NOT IN ('infinitif','participe','g\xE9rondif')
    `),
    database.execute(`SELECT ep.id,ep.verbe_id,ep.infinitif_pronominal,ep.regle_accord,ep.personnes_autorisees
      FROM emplois_pronominaux ep JOIN verbes v ON v.id=ep.verbe_id AND v.est_archive=0
      WHERE ep.actif=1`),
    database.execute(`
      SELECT v.id,v.infinitif,v.type_h_initial,v.\`participe_pr\xE9sent\` AS participe_present,
             v.\`participe_pass\xE9\` AS participe_passe, a.infinitif AS auxiliaire_infinitif,
             a.\`participe_pr\xE9sent\` AS auxiliaire_participe_present
      FROM verbes v LEFT JOIN verbes a ON a.infinitif=v.auxiliaire WHERE v.est_archive=0
    `),
    database.execute(`
      SELECT t.id,t.name,t.isTempsCompose AS is_compound,m.name AS mode_name
      FROM temps t JOIN modes m ON m.id=t.mode_id WHERE m.name IN ('participe','g\xE9rondif')
    `)
  ]);
  const lexicon = /* @__PURE__ */ new Map();
  const add = (form, infinitive, rawForm, personId) => {
    if (!form.trim() || form.trim() === "-") return;
    const key = infinitiveFormKey(form);
    const candidates = lexicon.get(key) || /* @__PURE__ */ new Set();
    candidates.add(infinitive);
    lexicon.set(key, candidates);
    if (rawForm && personId) {
      const rawKey = `form:${personId}:${infinitiveFormKey(rawForm)}`;
      const rawCandidates = lexicon.get(rawKey) || /* @__PURE__ */ new Set();
      rawCandidates.add(infinitive);
      lexicon.set(rawKey, rawCandidates);
    }
  };
  const auxiliaryForms = finite[0].filter((row) => row.infinitif === "\xEAtre");
  const usesByVerb = /* @__PURE__ */ new Map();
  for (const use of uses[0]) usesByVerb.set(Number(use.verbe_id), [...usesByVerb.get(Number(use.verbe_id)) || [], use]);
  for (const row of finite[0]) {
    if (isImpersonalVerb(row.infinitif, row.est_impersonnel) && row.pronom !== "il") continue;
    for (const form of [row.conjugaison1, row.conjugaison2, row.conjugaison3]) {
      if (form == null ? void 0 : form.trim()) add(formatAnswer(row.pronom, form, row.mode_name, row.infinitif), row.infinitif, form, Number(row.personne_id));
    }
    for (const use of usesByVerb.get(Number(row.verbe_id)) || []) {
      const persons = allowedPersons(use.personnes_autorisees);
      if (persons && !persons.includes(Number(row.personne_id))) continue;
      const generated = generatePronominalRow({
        ...row,
        pronominal_use_id: use.id,
        infinitif_pronominal: use.infinitif_pronominal,
        regle_accord: use.regle_accord,
        base_conjugaison1: row.conjugaison1,
        base_conjugaison2: row.conjugaison2,
        base_conjugaison3: row.conjugaison3
      }, auxiliaryForms);
      for (const form of [generated.conjugaison1, generated.conjugaison2, generated.conjugaison3]) {
        if (form == null ? void 0 : form.trim()) add(formatAnswer(row.pronom, form, row.mode_name, generated.infinitif), generated.infinitif, form, Number(row.personne_id));
      }
    }
  }
  for (const verb of verbs[0]) {
    const pronominalVerbs = (usesByVerb.get(Number(verb.id)) || []).map((use) => ({
      ...verb,
      id: -Number(use.id),
      infinitif: use.infinitif_pronominal,
      auxiliaire_infinitif: "\xEAtre",
      auxiliaire_participe_present: "s'\xE9tant",
      participe_present: (verb.participe_present || "").split("-").map((form) => {
        const initial = form.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
        const elide = "aeiouy".includes(initial) || initial === "h" && verb.type_h_initial !== "aspire";
        return form.trim() ? `${elide ? "s'" : "se "}${form.trim()}` : "";
      }).join("-")
    }));
    for (const candidate of [verb, ...pronominalVerbs]) {
      for (const tense of tenses[0]) {
        const question = formatNonFiniteQuestion(candidate, tense);
        for (const form of (question == null ? void 0 : question.reponses) || []) add(form, candidate.infinitif);
      }
    }
  }
  return lexicon;
}
async function infinitiveLexicon() {
  if (!cache || cache.expires < Date.now()) {
    const promise = loadLexicon();
    cache = { expires: Date.now() + 12e4, promise };
    void promise.catch(() => {
      if ((cache == null ? void 0 : cache.promise) === promise) cache = void 0;
    });
  }
  return cache.promise;
}
function infinitiveIdentificationQuestion(question, candidates) {
  var _a;
  const infinitives = [...new Set([question.infinitif || "", ...candidates].filter(Boolean))];
  const { radicalReference: _radical, conjugationConfusions: _confusions, nousForm: _nous, speech: _speech, ...source } = question;
  return {
    ...source,
    id: `i-${question.id}`,
    exerciseKind: "infinitive-identification",
    titre: "Trouver l\u2019infinitif",
    instruction: INFINITIVE_IDENTIFICATION_INSTRUCTION,
    // Un participe passé isolé n’est pas une forme avec auxiliaire.
    isCompound: Boolean(question.isCompound) && ((_a = question.mode) == null ? void 0 : _a.toLocaleLowerCase("fr")) !== "participe",
    reponses: infinitiveAnswers(infinitives),
    reponsesPourCorrige: infinitives
  };
}
async function identifyInfinitives(questions) {
  const lexicon = await infinitiveLexicon();
  const seen = /* @__PURE__ */ new Set();
  return questions.flatMap((question) => {
    const phrase = question.literaryCitation ? formatAnswer(question.pronom || "", question.conjugaison1 || question.literaryCitation.target, question.mode || "", question.infinitif) : question.consigne;
    const key = infinitiveFormKey(phrase);
    const candidates = [...lexicon.get(key) || []];
    if (question.literaryCitation) {
      const target = question.literaryCitation.target;
      const withoutSubject = target.replace(/^(?:que\s+|qu[’'])?(?:je\s+|j[’']|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+)/iu, "");
      for (const form of [target, withoutSubject]) {
        for (const candidate of lexicon.get(`form:${question.personId}:${infinitiveFormKey(form)}`) || []) {
          if (!candidates.includes(candidate)) candidates.push(candidate);
        }
      }
    }
    if (question.literaryCitation && candidates.some((candidate) => candidate !== question.infinitif)) return [];
    const uniqueKey = question.literaryCitation ? String(question.id) : key;
    if (seen.has(uniqueKey)) return [];
    seen.add(uniqueKey);
    return [infinitiveIdentificationQuestion(question, candidates)];
  });
}

const infinitiveIdentification = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  identifyInfinitives: identifyInfinitives,
  infinitiveIdentificationQuestion: infinitiveIdentificationQuestion,
  invalidateInfinitiveLexicon: invalidateInfinitiveLexicon
}, Symbol.toStringTag, { value: 'Module' }));

export { infinitiveIdentification as a, formatNonFiniteQuestion as f, identifyInfinitives as i };
//# sourceMappingURL=infinitive-identification.mjs.map
