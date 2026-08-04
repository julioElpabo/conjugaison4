import { u as useDatabase, D as decodePronominalSelectionId, a3 as indirectRelative, a4 as formatConjugationQuestion, a5 as formatAnswer } from '../nitro/nitro.mjs';
import { b as buildRadicalReference } from './radical-reference.mjs';
import { g as generatePronominalRow, r as resolveVariableAuxiliary } from './pronominal-formatter.mjs';
import { M as MODE_IDENTIFICATION_INSTRUCTION, T as TENSE_IDENTIFICATION_INSTRUCTION } from './exercise-instructions.mjs';
import { i as isNearFutureTense, b as buildNearFutureParadigm, a as isPronominalNearFutureInfinitive, n as nearFutureReflexivePronoun } from './near-future.mjs';

function normalized$1(value) {
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
  const mode = normalized$1(tense.mode_name);
  const tenseName = normalized$1(tense.name);
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
    const auxiliary = /^s[’']|^se\s/u.test(normalized$1(verb.infinitif)) ? "s\u2019\xEAtre" : normalized$1(verb.auxiliaire_infinitif);
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

function conjugationConfusionsFor(row, references) {
  const forms = references.get(Number(row.base_verbe_id || row.verbe_id)) || [];
  return forms.filter((form) => Number(form.personne_id) === Number(row.personne_id) && Number(form.temp_id) !== Number(row.temp_id)).map((form) => ({
    tense: form.temps_name,
    mode: form.mode_name,
    forms: unique([form.conjugaison1, form.conjugaison2, form.conjugaison3])
  })).filter((candidate) => candidate.forms.length);
}
class QuestionnaireSelectionError extends Error {
}
function placeholders(values) {
  return values.map(() => "?").join(", ");
}
function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
function allowedPersons(value) {
  if (Array.isArray(value)) return value.map(Number);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(Number) : null;
  } catch {
    return null;
  }
}
function nearFutureAuxiliaryForms(rows) {
  return rows.map((row) => ({
    personId: Number(row.personne_id),
    pronoun: row.pronom,
    forms: unique([row.conjugaison1, row.conjugaison2, row.conjugaison3])
  }));
}
function nearFutureRows(tense, verbs, pronominalUses, allerRows) {
  const auxiliaryForms = nearFutureAuxiliaryForms(allerRows);
  const sources = [
    ...verbs.map((verb) => ({
      selectionId: Number(verb.id),
      baseVerbId: Number(verb.id),
      infinitive: verb.infinitif,
      typeHInitial: verb.type_h_initial,
      allowedPersonIds: allowedPersons(verb.personnes_disponibles)
    })),
    ...pronominalUses.map((use) => ({
      selectionId: -Number(use.id),
      baseVerbId: Number(use.verbe_id),
      infinitive: use.infinitif_pronominal,
      typeHInitial: use.type_h_initial,
      allowedPersonIds: allowedPersons(use.personnes_autorisees)
    }))
  ];
  return sources.flatMap((source) => {
    var _a, _b;
    const paradigm = buildNearFutureParadigm(
      Number(tense.id),
      source.selectionId,
      source.infinitive,
      auxiliaryForms,
      {
        typeHInitial: source.typeHInitial,
        allowedPersonIds: source.allowedPersonIds
      }
    );
    const nousForm = (_b = (_a = paradigm.find((form) => form.personId === 7)) == null ? void 0 : _a.forms[0]) != null ? _b : null;
    return paradigm.map((form) => {
      var _a2, _b2, _c;
      return {
        id: form.id,
        verbe_id: source.selectionId,
        base_verbe_id: source.baseVerbId,
        personne_id: form.personId,
        temp_id: Number(tense.id),
        conjugaison1: (_a2 = form.forms[0]) != null ? _a2 : "",
        conjugaison2: (_b2 = form.forms[1]) != null ? _b2 : "",
        conjugaison3: (_c = form.forms[2]) != null ? _c : "",
        infinitif: source.infinitive,
        auxiliaire: "aller",
        participe_present: "",
        participe_passe: "",
        auxiliaire_infinitif: null,
        auxiliaire_participe_present: null,
        pronom: form.pronoun,
        temps_name: tense.name,
        tense_code: tense.code,
        is_compound: 0,
        mode_name: tense.mode_name,
        mode_code: tense.mode_code,
        nous_form: nousForm,
        type_h_initial: source.typeHInitial
      };
    });
  });
}
function shuffle(values) {
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values;
}
function randomComplement(rows) {
  var _a;
  const total = rows.reduce((sum, row) => sum + Math.max(1, Number(row.poids)), 0);
  let cursor = Math.random() * total;
  for (const row of rows) {
    cursor -= Math.max(1, Number(row.poids));
    if (cursor < 0) return row;
  }
  return (_a = rows[rows.length - 1]) != null ? _a : null;
}
function normalized(value) {
  return value.trim().toLocaleLowerCase("fr-CH");
}
function radicalReferenceFor(row, references) {
  const forms = references.get(Number(row.base_verbe_id || row.verbe_id)) || [];
  const reference = buildRadicalReference({
    infinitive: row.infinitif,
    mode: row.mode_name,
    tense: row.temps_name,
    personId: Number(row.personne_id),
    conjugation: row.conjugaison1,
    isCompound: Boolean(row.is_compound)
  }, forms.map((form) => ({
    mode: form.mode_name,
    tense: form.temps_name,
    personId: Number(form.personne_id),
    pronoun: form.pronom,
    form: form.conjugaison1
  })));
  if (!reference) return void 0;
  const paradigmForms = forms.filter((form) => normalized(form.mode_name) === normalized(row.mode_name) && normalized(form.temps_name) === normalized(row.temps_name)).sort((left, right) => Number(left.personne_id) - Number(right.personne_id)).map((form) => ({
    subject: form.pronom,
    form: form.conjugaison1,
    personId: Number(form.personne_id)
  }));
  return {
    ...reference,
    ...paradigmForms.length ? { paradigmForms } : {}
  };
}
function futureSimpleFormsFor(row, references) {
  if (!isNearFutureTense({ code: row.tense_code, name: row.temps_name })) return [];
  const forms = references.get(Number(row.base_verbe_id || row.verbe_id)) || [];
  const futureForms = forms.filter((form) => Number(form.personne_id) === Number(row.personne_id) && normalized(form.mode_name) === "indicatif" && normalized(form.temps_name) === "futur").flatMap((form) => unique([form.conjugaison1, form.conjugaison2, form.conjugaison3]));
  if (!isPronominalNearFutureInfinitive(row.infinitif) || Number(row.verbe_id) > 0) {
    return unique(futureForms);
  }
  const proclitic = nearFutureReflexivePronoun(
    Number(row.personne_id),
    row.infinitif,
    row.type_h_initial
  );
  return unique(futureForms.map((form) => `${proclitic}${form}`));
}
function allowsAnteposedComplement(row) {
  return Boolean(row.is_compound) && normalized(row.mode_name) !== "imp\xE9ratif";
}
function hasVisibleAnteposedAgreement(candidate) {
  const gender = candidate.genre ? normalized(candidate.genre).normalize("NFD").replace(/\p{Diacritic}/gu, "") : "";
  const number = candidate.nombre ? normalized(candidate.nombre) : "";
  return candidate.fonction_objet === "cod" && Boolean(candidate.texte_antepose && candidate.genre && candidate.nombre) && (gender === "feminin" || number === "pluriel");
}
function startsWithVowel(value) {
  const first = value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
  return "aeiouy".includes(first);
}
function choosePronoun(pronom, inclusive) {
  if (pronom === "il") {
    return shuffle(inclusive ? ["il", "elle", "iel"] : ["il", "elle"])[0];
  }
  if (pronom === "ils") {
    return shuffle(inclusive ? ["ils", "elles", "iels"] : ["ils", "elles"])[0];
  }
  return pronom;
}
function articleForTense(tense, mode) {
  if (normalized(mode) === "infinitif") {
    return `L'infinitif ${tense}`;
  }
  const article = startsWithVowel(tense) ? "L'" : "Le ";
  const normalizedMode = normalized(mode);
  if (normalizedMode === "indicatif" || normalizedMode === "imp\xE9ratif") {
    return `${article}${tense} de l'${normalizedMode}`;
  }
  return `${article}${tense} du ${normalizedMode}`;
}
function literaryIdentificationQuestion(citation, modeOnly) {
  return identificationQuestion({
    id: citation.id,
    verbe_id: citation.verb_id,
    personne_id: citation.person_id,
    temp_id: citation.tense_id,
    conjugaison1: citation.target_text,
    conjugaison2: "",
    conjugaison3: "",
    infinitif: citation.infinitif,
    pronom: citation.pronom,
    temps_name: citation.tense_name,
    tense_code: citation.tense_code,
    is_compound: citation.is_compound,
    mode_name: citation.mode_name,
    mode_code: citation.mode_code
  }, citation, modeOnly);
}
function identificationQuestion(row, citation, modeOnly = false) {
  const pronoun = row.pronom;
  const phrase = formatAnswer(pronoun, row.conjugaison1, row.mode_name);
  const tense = normalized(row.temps_name);
  const mode = normalized(row.mode_name);
  const modeCorrection = `${startsWithVowel(mode) ? "L'" : "Le "}${mode}`;
  const correction = modeOnly ? modeCorrection : articleForTense(tense, mode);
  const answers = modeOnly ? [mode, `mode ${mode}`, modeCorrection] : [
    `${tense} ${mode}`,
    `${mode} ${tense}`,
    correction,
    `${tense} ${mode === "indicatif" || mode === "imp\xE9ratif" ? "de l'" : "du "}${mode}`
  ];
  if (!modeOnly && tense === "futur" && mode === "indicatif") {
    answers.push("futur simple indicatif", "indicatif futur simple", "futur simple de l'indicatif");
  }
  return {
    id: citation ? `lt-${citation.id}` : `t-${row.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    instruction: modeOnly ? MODE_IDENTIFICATION_INSTRUCTION : TENSE_IDENTIFICATION_INSTRUCTION,
    consigne: phrase,
    reponses: unique(answers),
    reponsesPourCorrige: [correction],
    infinitif: row.infinitif,
    pronom: pronoun,
    temps: row.temps_name,
    mode: row.mode_name,
    conjugaison1: row.conjugaison1,
    conjugaison2: row.conjugaison2 || "",
    conjugaison3: row.conjugaison3 || "",
    nousForm: row.nous_form || null,
    ...citation ? {
      consigne: citation.sentence_text,
      literaryCitation: {
        before: citation.sentence_text.slice(0, Number(citation.target_start)),
        target: citation.sentence_text.slice(Number(citation.target_start), Number(citation.target_end)),
        after: citation.sentence_text.slice(Number(citation.target_end)),
        author: citation.author,
        work: citation.work,
        chapter: citation.chapter,
        sourceUrl: citation.source_url
      }
    } : {}
  };
}
function literaryCitationKey(verbId, tenseId, personId) {
  return `${verbId}:${tenseId}:${personId}`;
}
async function validatedLiteraryCitations(verbIds, tenseIds, literaryRegister = "all") {
  const citations = /* @__PURE__ */ new Map();
  if (!tenseIds.length || verbIds !== null) return citations;
  const database = useDatabase();
  try {
    const register = literaryRegister === "courant" || literaryRegister === "soutenu" ? literaryRegister : "";
    const coverageRegisterClause = register ? `AND coveredSource.language_register='${register}'` : "";
    const randomRegisterClause = register ? `AND source.language_register='${register}'` : "";
    const verbClause = verbIds === null ? "" : `AND target.verb_id IN (${placeholders(verbIds)})`;
    const parameters = verbIds === null ? [...tenseIds] : [...verbIds, ...tenseIds];
    const [coverageRows, randomRows] = await Promise.all([
      database.execute(`
      SELECT target.id,target.verb_id,target.tense_id,target.person_id,
             sentence.sentence_text,target.target_text,target.target_start,target.target_end,
             source.author,source.title AS work,sentence.chapter,COALESCE(sentence.source_url,source.source_url) AS source_url,
             verb.infinitif,person.pronom,tense.name AS tense_name,tense.code AS tense_code,
             tense.isTempsCompose AS is_compound,mode.name AS mode_name,mode.code AS mode_code
      FROM literary_targets target
      INNER JOIN (
        SELECT covered.tense_id, MIN(covered.id) AS id
        FROM literary_targets covered
        INNER JOIN literary_sentences coveredSentence ON coveredSentence.id=covered.sentence_id
        INNER JOIN literary_sources coveredSource ON coveredSource.id=coveredSentence.source_id
        WHERE covered.review_status='validated'
          ${verbIds === null ? "" : `AND covered.verb_id IN (${placeholders(verbIds)})`}
          AND covered.tense_id IN (${placeholders(tenseIds)})
          ${coverageRegisterClause}
        GROUP BY covered.tense_id
      ) coverage ON coverage.id=target.id
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      INNER JOIN verbes verb ON verb.id=target.verb_id
      INNER JOIN personnes person ON person.id=target.person_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      INNER JOIN modes mode ON mode.id=tense.mode_id
    `, parameters),
      database.execute(`
      SELECT target.id,target.verb_id,target.tense_id,target.person_id,
             sentence.sentence_text,target.target_text,target.target_start,target.target_end,
             source.author,source.title AS work,sentence.chapter,COALESCE(sentence.source_url,source.source_url) AS source_url,
             verb.infinitif,person.pronom,tense.name AS tense_name,tense.code AS tense_code,
             tense.isTempsCompose AS is_compound,mode.name AS mode_name,mode.code AS mode_code
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      INNER JOIN verbes verb ON verb.id=target.verb_id
      INNER JOIN personnes person ON person.id=target.person_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      INNER JOIN modes mode ON mode.id=tense.mode_id
      WHERE target.review_status='validated'
        ${verbClause}
        AND target.tense_id IN (${placeholders(tenseIds)})
        ${randomRegisterClause}
      ORDER BY RAND()
      LIMIT 500
    `, parameters)
    ]);
    const seen = /* @__PURE__ */ new Set();
    for (const row of [...coverageRows[0], ...randomRows[0]]) {
      if (seen.has(Number(row.id))) continue;
      seen.add(Number(row.id));
      const key = literaryCitationKey(Number(row.verb_id), Number(row.tense_id), Number(row.person_id));
      const group = citations.get(key) || [];
      group.push(row);
      citations.set(key, group);
    }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code !== "ER_NO_SUCH_TABLE") throw error;
  }
  return citations;
}
function balancedIdentificationQuestions(questions, count) {
  var _a;
  const groupsByMode = /* @__PURE__ */ new Map();
  for (const question of shuffle([...questions])) {
    const mode = normalized(question.mode || "");
    const tense = question.tenseId === void 0 ? normalized(question.temps || "") : String(question.tenseId);
    if (!mode || !tense) continue;
    const modeGroups = groupsByMode.get(mode) || /* @__PURE__ */ new Map();
    modeGroups.set(tense, [...modeGroups.get(tense) || [], question]);
    groupsByMode.set(mode, modeGroups);
  }
  const preferredModeOrder = ["indicatif", "subjonctif", "conditionnel", "imp\xE9ratif", "infinitif"];
  const modes = [...groupsByMode.keys()].sort((left, right) => {
    const leftOrder = preferredModeOrder.indexOf(left);
    const rightOrder = preferredModeOrder.indexOf(right);
    return (leftOrder < 0 ? preferredModeOrder.length : leftOrder) - (rightOrder < 0 ? preferredModeOrder.length : rightOrder);
  });
  const unusedGroupsByMode = new Map(modes.map((mode) => {
    var _a2;
    const groups = [...((_a2 = groupsByMode.get(mode)) == null ? void 0 : _a2.values()) || []].map((group) => ({ group, tieBreaker: Math.random() })).sort((left, right) => left.group.length - right.group.length || left.tieBreaker - right.tieBreaker).map((item) => item.group);
    return [mode, groups];
  }));
  const balanced = [];
  while (balanced.length < count && modes.some((mode) => {
    var _a2;
    return (_a2 = unusedGroupsByMode.get(mode)) == null ? void 0 : _a2.length;
  })) {
    for (const mode of shuffle([...modes])) {
      const group = (_a = unusedGroupsByMode.get(mode)) == null ? void 0 : _a.shift();
      const question = group == null ? void 0 : group.shift();
      if (question) balanced.push(question);
      if (balanced.length >= count) break;
    }
  }
  const repeatedGroups = shuffle([...groupsByMode.values()].flatMap((modeGroups) => [...modeGroups.values()]));
  while (balanced.length < count && repeatedGroups.some((group) => group.length)) {
    for (const group of repeatedGroups) {
      const question = group.shift();
      if (question) balanced.push(question);
      if (balanced.length >= count) break;
    }
  }
  return shuffle(balanced);
}
function balancedModeIdentificationQuestions(questions, count) {
  var _a;
  const groups = /* @__PURE__ */ new Map();
  for (const question of shuffle(questions.filter((item) => item.literaryCitation))) {
    const mode = normalized(question.mode || "");
    groups.set(mode, [...groups.get(mode) || [], question]);
  }
  const modeOrder = ["indicatif", "subjonctif", "conditionnel", "imp\xE9ratif", "infinitif"];
  const balanced = [];
  while (balanced.length < count && modeOrder.some((mode) => {
    var _a2;
    return (_a2 = groups.get(mode)) == null ? void 0 : _a2.length;
  })) {
    for (const mode of shuffle([...modeOrder])) {
      const question = (_a = groups.get(mode)) == null ? void 0 : _a.shift();
      if (question) balanced.push(question);
      if (balanced.length >= count) break;
    }
  }
  return shuffle(balanced);
}
async function validateSelections(request) {
  const database = useDatabase();
  const verbIds = request.verbIds.filter((id) => id > 0);
  const pronominalUseIds = request.verbIds.filter((id) => id < 0).map(decodePronominalSelectionId).filter((id) => id !== null);
  const [verbResult, pronominalResult, tenseResult] = await Promise.all([
    verbIds.length > 0 ? database.execute(
      `SELECT id FROM verbes WHERE id IN (${placeholders(verbIds)}) AND est_archive = 0`,
      verbIds
    ) : Promise.resolve([[]]),
    pronominalUseIds.length > 0 ? database.execute(
      `SELECT id FROM emplois_pronominaux
           WHERE id IN (${placeholders(pronominalUseIds)}) AND actif = 1 AND verbe_id IS NOT NULL`,
      pronominalUseIds
    ) : Promise.resolve([[]]),
    database.execute(
      `SELECT t.id, t.name, t.code, m.name AS mode_name, m.code AS mode_code,
              t.isTempsCompose AS is_compound
       FROM temps t
       INNER JOIN modes m ON m.id = t.mode_id
       WHERE t.id IN (${placeholders(request.tenseIds)})`,
      request.tenseIds
    )
  ]);
  if (verbResult[0].length !== verbIds.length || pronominalResult[0].length !== pronominalUseIds.length || verbIds.length + pronominalUseIds.length !== request.verbIds.length) {
    throw new QuestionnaireSelectionError("Un ou plusieurs verbes sont inconnus");
  }
  if (tenseResult[0].length !== request.tenseIds.length) {
    throw new QuestionnaireSelectionError("Un ou plusieurs temps sont inconnus");
  }
  return tenseResult[0];
}
async function generateQuestionnaire(request) {
  var _a, _b;
  const selectedTenses = await validateSelections(request);
  const nonFiniteModes = ["participe", "g\xE9rondif", "infinitif"];
  const finiteTenses = selectedTenses.filter((row) => !nonFiniteModes.includes(normalized(row.mode_name)));
  const nonFiniteTenses = selectedTenses.filter((row) => nonFiniteModes.includes(normalized(row.mode_name)));
  const database = useDatabase();
  const questions = [];
  const requestedComplementOptions = request.complementOptions || [];
  const onlyBeforeComplements = requestedComplementOptions.length > 0 && requestedComplementOptions.every((option) => option.endsWith("-before"));
  const verbIds = request.verbIds.filter((id) => id > 0);
  const pronominalUseIds = request.verbIds.filter((id) => id < 0).map(decodePronominalSelectionId).filter((id) => id !== null);
  const usesLiteraryCitations = request.exerciseKind === "mode-identification" || request.exerciseKind === "tense-identification" && request.identificationSource === "literary-corpus";
  if (usesLiteraryCitations) {
    const citations = await validatedLiteraryCitations(
      null,
      selectedTenses.map((row) => Number(row.id)),
      (_a = request.literaryRegister) != null ? _a : "all"
    );
    const literaryQuestions = [...citations.values()].flat().map((citation) => literaryIdentificationQuestion(citation, request.exerciseKind === "mode-identification"));
    if (!literaryQuestions.length) {
      throw new QuestionnaireSelectionError("Aucune citation valid\xE9e ne correspond aux temps s\xE9lectionn\xE9s");
    }
    return request.exerciseKind === "mode-identification" ? balancedModeIdentificationQuestions(literaryQuestions, request.questionCount) : balancedIdentificationQuestions(literaryQuestions, request.questionCount);
  }
  if (finiteTenses.length > 0) {
    const nearFutureTenses = usesLiteraryCitations ? [] : finiteTenses.filter(isNearFutureTense);
    const storedFiniteTenses = finiteTenses.filter((tense) => !isNearFutureTense(tense));
    const finiteIds = storedFiniteTenses.map((row) => Number(row.id));
    const pastSimpleClause = request.pastSimplePronouns === "third-person-only" ? "AND (t.name NOT IN ('pass\xE9 simple', 'pass\xE9 ant\xE9rieur') OR p.pronom IN ('il', 'ils'))" : "";
    const rows = [];
    const literaryCitations = usesLiteraryCitations ? await validatedLiteraryCitations(null, finiteIds) : /* @__PURE__ */ new Map();
    const limit = request.exerciseKind === "conjugation" ? Math.min(500, Math.max(request.questionCount * 4, request.questionCount)) : 600;
    const questionVerbIds = usesLiteraryCitations ? [...new Set([...literaryCitations.values()].flat().map((citation) => Number(citation.verb_id)))] : verbIds;
    const literaryCoordinates = usesLiteraryCitations ? [...literaryCitations.keys()].map((key) => {
      const [verbId, tenseId, personId] = key.split(":").map(Number);
      return [verbId, tenseId, personId];
    }) : [];
    const exactLiteraryClause = literaryCoordinates.length ? `AND (vc.verbe_id,vc.temp_id,vc.personne_id) IN (${literaryCoordinates.map(() => "(?,?,?)").join(",")})` : "";
    const literaryOrderClause = literaryCitations.size ? `CASE WHEN EXISTS (
          SELECT 1 FROM literary_targets prioritized
          WHERE prioritized.review_status='validated'
            AND prioritized.verb_id=vc.verbe_id
            AND prioritized.tense_id=vc.temp_id
            AND prioritized.person_id=vc.personne_id
        ) THEN 0 ELSE 1 END,` : "";
    let radicalReferences = /* @__PURE__ */ new Map();
    let etreAuxiliaryForms = [];
    if (questionVerbIds.length > 0 && finiteIds.length > 0) {
      const [storedRows] = await database.execute(`
      SELECT vc.id, vc.verbe_id, vc.personne_id, vc.temp_id,
             vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
             v.infinitif, v.auxiliaire,
             v.\`participe_pr\xE9sent\` AS participe_present,
             v.\`participe_pass\xE9\` AS participe_passe,
             auxiliary.infinitif AS auxiliaire_infinitif,
             auxiliary.\`participe_pr\xE9sent\` AS auxiliaire_participe_present,
             p.pronom, t.name AS temps_name, t.code AS tense_code,
             t.isTempsCompose AS is_compound,
             m.name AS mode_name, m.code AS mode_code,
             (SELECT nous.conjugaison1 FROM verbesconjugues nous
              WHERE nous.verbe_id=vc.verbe_id AND nous.temp_id=vc.temp_id
                AND nous.personne_id=7 AND nous.conjugaison1<>'' LIMIT 1) AS nous_form
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      INNER JOIN personnes p ON p.id = vc.personne_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE vc.verbe_id IN (${placeholders(questionVerbIds)})
        AND vc.temp_id IN (${placeholders(finiteIds)})
        ${exactLiteraryClause}
        AND vc.conjugaison1 <> ''
        ${pastSimpleClause}
      ORDER BY ${literaryOrderClause} RAND()
      LIMIT ${limit}
      `, [...questionVerbIds, ...finiteIds, ...literaryCoordinates.flat()]);
      rows.push(...storedRows);
    }
    if (!usesLiteraryCitations && pronominalUseIds.length > 0 && finiteIds.length > 0) {
      const [sourceRows, auxiliaryForms] = await Promise.all([
        database.execute(`
          SELECT vc.id, -ep.id AS verbe_id, ep.verbe_id AS base_verbe_id, vc.personne_id, vc.temp_id,
                 vc.conjugaison1 AS base_conjugaison1,
                 vc.conjugaison2 AS base_conjugaison2,
                 vc.conjugaison3 AS base_conjugaison3,
                 vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
                 ep.id AS pronominal_use_id, ep.infinitif_pronominal,
                 ep.regle_accord, ep.personnes_autorisees, base.type_h_initial,
                 base.infinitif, base.auxiliaire,
                 base.\`participe_pass\xE9\` AS participe_passe,
                 p.pronom, t.name AS temps_name, t.code AS tense_code,
                 t.isTempsCompose AS is_compound,
                 m.name AS mode_name, m.code AS mode_code,
                 (SELECT nous.conjugaison1 FROM verbesconjugues nous
                  WHERE nous.verbe_id=vc.verbe_id AND nous.temp_id=vc.temp_id
                    AND nous.personne_id=7 AND nous.conjugaison1<>'' LIMIT 1) AS nous_form
          FROM emplois_pronominaux ep
          INNER JOIN verbes base ON base.id = ep.verbe_id
          INNER JOIN verbesconjugues vc ON vc.verbe_id = base.id
          INNER JOIN personnes p ON p.id = vc.personne_id
          INNER JOIN temps t ON t.id = vc.temp_id
          INNER JOIN modes m ON m.id = t.mode_id
          WHERE ep.id IN (${placeholders(pronominalUseIds)})
            AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
            AND vc.temp_id IN (${placeholders(finiteIds)})
            AND vc.conjugaison1 <> ''
            ${pastSimpleClause}
          ORDER BY RAND()
          LIMIT ${limit}
        `, [...pronominalUseIds, ...finiteIds]),
        database.execute(`
          SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
          FROM verbesconjugues vc
          INNER JOIN verbes v ON v.id = vc.verbe_id
          INNER JOIN temps t ON t.id = vc.temp_id
          INNER JOIN modes m ON m.id = t.mode_id
          WHERE v.infinitif = '\xEAtre' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
        `)
      ]);
      etreAuxiliaryForms = auxiliaryForms[0];
      rows.push(...sourceRows[0].filter((row) => {
        const persons = allowedPersons(row.personnes_autorisees);
        return persons === null || persons.includes(Number(row.personne_id));
      }).map((row) => generatePronominalRow(row, auxiliaryForms[0])).filter((row) => row.conjugaison1));
    }
    if (nearFutureTenses.length > 0) {
      const [nearFutureVerbs, nearFutureUses, allerRows] = await Promise.all([
        verbIds.length ? database.execute(`
              SELECT id, infinitif, type_h_initial, personnes_disponibles
              FROM verbes
              WHERE id IN (${placeholders(verbIds)}) AND est_archive = 0
            `, verbIds) : Promise.resolve([[]]),
        pronominalUseIds.length ? database.execute(`
              SELECT ep.id, ep.verbe_id, ep.infinitif_pronominal,
                     ep.personnes_autorisees, base.type_h_initial
              FROM emplois_pronominaux ep
              INNER JOIN verbes base ON base.id = ep.verbe_id AND base.est_archive = 0
              WHERE ep.id IN (${placeholders(pronominalUseIds)})
                AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
            `, pronominalUseIds) : Promise.resolve([[]]),
        database.execute(`
          SELECT vc.personne_id, p.pronom,
                 vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
          FROM verbesconjugues vc
          INNER JOIN verbes v ON v.id = vc.verbe_id
          INNER JOIN personnes p ON p.id = vc.personne_id
          INNER JOIN temps t ON t.id = vc.temp_id
          INNER JOIN modes m ON m.id = t.mode_id
          WHERE v.infinitif = 'aller' AND m.name = 'indicatif'
            AND t.name = 'pr\xE9sent' AND vc.conjugaison1 <> ''
          ORDER BY p.id
        `)
      ]);
      for (const tense of nearFutureTenses) {
        rows.push(...nearFutureRows(tense, nearFutureVerbs[0], nearFutureUses[0], allerRows[0]));
      }
    }
    const radicalReferenceVerbIds = [...new Set(
      rows.map((row) => Number(row.base_verbe_id || row.verbe_id)).filter((id) => id > 0)
    )];
    if (radicalReferenceVerbIds.length > 0) {
      const [referenceRows] = await database.execute(`
        SELECT vc.verbe_id, vc.personne_id, vc.temp_id, p.pronom,
               vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
               m.name AS mode_name, t.name AS temps_name
        FROM verbesconjugues vc
        INNER JOIN personnes p ON p.id = vc.personne_id
        INNER JOIN temps t ON t.id = vc.temp_id
        INNER JOIN modes m ON m.id = t.mode_id
        WHERE vc.verbe_id IN (${placeholders(radicalReferenceVerbIds)})
          AND vc.conjugaison1 <> ''
      `, radicalReferenceVerbIds);
      for (const reference of referenceRows) {
        const candidates = radicalReferences.get(Number(reference.verbe_id)) || [];
        candidates.push(reference);
        radicalReferences.set(Number(reference.verbe_id), candidates);
      }
    }
    if (!etreAuxiliaryForms.length && rows.some((row) => normalized(row.infinitif) === "sortir" && Boolean(row.is_compound))) {
      const [auxiliaryForms] = await database.execute(`
        SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
        FROM verbesconjugues vc
        INNER JOIN verbes v ON v.id = vc.verbe_id
        INNER JOIN temps t ON t.id = vc.temp_id
        INNER JOIN modes m ON m.id = t.mode_id
        WHERE v.infinitif = '\xEAtre' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
      `);
      etreAuxiliaryForms = auxiliaryForms;
    }
    const complementsByVerb = /* @__PURE__ */ new Map();
    if (request.exerciseKind === "conjugation" && request.includeComplements && verbIds.length > 0) {
      const [complements] = await database.execute(`
        SELECT vs.verbe_id, cv.fonction_objet, cv.preposition, c.texte, c.texte_antepose, c.genre, c.nombre, c.poids
        FROM verbe_sens vs
        INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
        INNER JOIN complements_verbaux c ON c.construction_id=cv.id
        WHERE vs.verbe_id IN (${placeholders(verbIds)})
          AND cv.actif=1 AND cv.statut_validation='valide'
          AND cv.fonction_objet IN ('cod', 'coi')
          AND c.actif=1 AND c.statut_validation='valide'
        ORDER BY vs.verbe_id, c.id
      `, verbIds);
      for (const complement of complements) {
        const candidates = (_b = complementsByVerb.get(Number(complement.verbe_id))) != null ? _b : [];
        candidates.push(complement);
        complementsByVerb.set(Number(complement.verbe_id), candidates);
      }
    }
    const eligibleRows = usesLiteraryCitations ? rows.filter((row) => literaryCitations.has(literaryCitationKey(
      Number(row.verbe_id),
      Number(row.temp_id),
      Number(row.personne_id)
    ))) : rows;
    const rowsForQuestions = onlyBeforeComplements ? eligibleRows.filter((row) => normalized(row.mode_name) !== "imp\xE9ratif" && (requestedComplementOptions.includes("coi-before") || Boolean(row.is_compound))) : eligibleRows;
    questions.push(...rowsForQuestions.map((row) => {
      var _a2, _b2;
      const candidates = (_a2 = complementsByVerb.get(Number(row.verbe_id))) != null ? _a2 : [];
      const availableOptions = requestedComplementOptions.flatMap((option2) => {
        const [functionObject, position] = option2.split("-");
        const matching = candidates.filter((candidate) => candidate.fonction_objet === functionObject).filter((candidate) => {
          if (position === "after") return true;
          if (functionObject === "cod") return allowsAnteposedComplement(row) && hasVisibleAnteposedAgreement(candidate);
          return normalized(row.mode_name) !== "imp\xE9ratif" && Boolean(indirectRelative(candidate.texte, candidate.preposition, candidate.genre, candidate.nombre));
        });
        return matching.length ? [{ option: option2, matching }] : [];
      });
      const selectedOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
      const complement = selectedOption ? randomComplement(selectedOption.matching) : null;
      const option = selectedOption == null ? void 0 : selectedOption.option;
      const useBefore = (option == null ? void 0 : option.endsWith("-before")) || false;
      const relative = complement && option === "coi-before" ? indirectRelative(complement.texte, complement.preposition, complement.genre, complement.nombre) : null;
      const canUseComplement = Boolean(complement) && (!useBefore || (option === "cod-before" ? Boolean(complement == null ? void 0 : complement.texte_antepose) : Boolean(relative)));
      const enrichedRow = complement && canUseComplement ? {
        ...row,
        complement_phrase: complement.texte,
        complement_position: useBefore ? "before" : "after",
        complement_anteposed: useBefore ? (relative == null ? void 0 : relative.antecedent) || complement.texte_antepose : null,
        complement_relative_pronoun: (relative == null ? void 0 : relative.relativePronoun) || null,
        complement_gender: option === "cod-before" ? complement.genre : null,
        complement_number: option === "cod-before" ? complement.nombre : null,
        complement_function: complement.fonction_objet,
        complement_preposition: complement.preposition
      } : row;
      const semanticRow = resolveVariableAuxiliary(enrichedRow, etreAuxiliaryForms);
      const radicalReference = isNearFutureTense({ code: row.tense_code, name: row.temps_name }) ? void 0 : radicalReferenceFor(row, radicalReferences);
      const futureSimpleForms = futureSimpleFormsFor(row, radicalReferences);
      const conjugationConfusions = conjugationConfusionsFor(row, radicalReferences);
      return request.exerciseKind === "conjugation" ? formatConjugationQuestion({
        ...semanticRow,
        radical_reference: radicalReference,
        future_simple_forms: futureSimpleForms,
        conjugation_confusions: conjugationConfusions
      }, choosePronoun(row.pronom, request.inclusivePronouns)) : identificationQuestion(
        semanticRow,
        (_b2 = literaryCitations.get(literaryCitationKey(
          Number(row.verbe_id),
          Number(row.temp_id),
          Number(row.personne_id)
        ))) == null ? void 0 : _b2.shift(),
        request.exerciseKind === "mode-identification"
      );
    }));
  }
  if (nonFiniteTenses.length > 0 && request.exerciseKind === "conjugation" && !onlyBeforeComplements) {
    const verbs = [];
    const selectedNonFiniteRequirePresentParticiple = nonFiniteTenses.every((tense) => {
      const mode = normalized(tense.mode_name);
      return mode === "g\xE9rondif" || mode === "participe" && normalized(tense.name) === "pr\xE9sent";
    });
    const presentParticipleClause = selectedNonFiniteRequirePresentParticiple ? "AND NULLIF(NULLIF(TRIM(v.`participe_pr\xE9sent`), ''), '-') IS NOT NULL" : "";
    if (verbIds.length > 0) {
      const [storedVerbs] = await database.execute(`
      SELECT v.id, v.infinitif,
             v.\`participe_pr\xE9sent\` AS participe_present,
             v.\`participe_pass\xE9\` AS participe_passe,
             auxiliary.infinitif AS auxiliaire_infinitif,
             auxiliary.\`participe_pr\xE9sent\` AS auxiliaire_participe_present,
             (SELECT vc.conjugaison1 FROM verbesconjugues vc
              INNER JOIN temps present_tense ON present_tense.id=vc.temp_id
              INNER JOIN modes present_mode ON present_mode.id=present_tense.mode_id
              INNER JOIN personnes present_person ON present_person.id=vc.personne_id
              WHERE vc.verbe_id=v.id AND present_mode.name='indicatif' AND present_tense.name='pr\xE9sent'
                AND present_person.pronom='nous' AND vc.conjugaison1<>'' LIMIT 1) AS present_nous
      FROM verbes v
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      WHERE v.id IN (${placeholders(verbIds)})
        ${presentParticipleClause}
      `, verbIds);
      verbs.push(...storedVerbs);
    }
    if (pronominalUseIds.length > 0) {
      const [uses] = await database.execute(`
        SELECT ep.id, ep.infinitif_pronominal,
               base.\`participe_pr\xE9sent\` AS participe_present,
               base.\`participe_pass\xE9\` AS participe_passe,
               base.type_h_initial,
               (SELECT vc.conjugaison1 FROM verbesconjugues vc
                INNER JOIN temps present_tense ON present_tense.id=vc.temp_id
                INNER JOIN modes present_mode ON present_mode.id=present_tense.mode_id
                INNER JOIN personnes present_person ON present_person.id=vc.personne_id
                WHERE vc.verbe_id=base.id AND present_mode.name='indicatif' AND present_tense.name='pr\xE9sent'
                  AND present_person.pronom='nous' AND vc.conjugaison1<>'' LIMIT 1) AS present_nous
        FROM emplois_pronominaux ep
        INNER JOIN verbes base ON base.id = ep.verbe_id
        WHERE ep.id IN (${placeholders(pronominalUseIds)})
          AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
          ${selectedNonFiniteRequirePresentParticiple ? "AND NULLIF(NULLIF(TRIM(base.`participe_pr\xE9sent`), ''), '-') IS NOT NULL" : ""}
      `, pronominalUseIds);
      for (const use of uses) {
        const participles = use.participe_present.split("-").map((form) => form.trim()).filter(Boolean);
        const pronominalParticiples = participles.map((form) => {
          const first = form.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
          const elide = "aeiouy".includes(first) || first === "h" && use.type_h_initial !== "aspire";
          return `${elide ? "s'" : "se "}${form}`;
        });
        verbs.push({
          id: -Number(use.id),
          infinitif: use.infinitif_pronominal,
          participe_present: pronominalParticiples.join("-"),
          participe_passe: use.participe_passe,
          auxiliaire_infinitif: "\xEAtre",
          auxiliaire_participe_present: "s'\xE9tant",
          present_nous: use.present_nous
        });
      }
    }
    for (const verb of verbs) {
      for (const tense of nonFiniteTenses) {
        const question = formatNonFiniteQuestion(verb, tense);
        if (question) questions.push(question);
      }
    }
  }
  if (usesLiteraryCitations && !questions.length) {
    throw new QuestionnaireSelectionError("Aucune citation valid\xE9e ne correspond aux temps s\xE9lectionn\xE9s");
  }
  if (request.exerciseKind === "mode-identification") {
    return balancedModeIdentificationQuestions(questions, request.questionCount);
  }
  return request.exerciseKind === "tense-identification" ? balancedIdentificationQuestions(questions, request.questionCount) : shuffle(questions).slice(0, request.questionCount);
}

export { QuestionnaireSelectionError as Q, generateQuestionnaire as g };
//# sourceMappingURL=questionnaire.mjs.map
