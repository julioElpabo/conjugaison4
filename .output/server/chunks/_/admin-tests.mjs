import { a3 as formatConjugationQuestion, c as createError, u as useDatabase } from '../nitro/nitro.mjs';
import { execFile } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { c as listCoaches } from './coaches.mjs';
import { a as createVariedCoachReaction, b as createCoachDialogueState } from './coach-dialogue.mjs';

const COLLECTION_FILE = "Tests conjugaisons - corrig\xE9.postman_collection.json";
const EXPECTATION_PATTERN = /pm\.expect\(data\.(titre|consigne|reponsesPourCorrige|reponses)\)\.to\.(equal|include)\(("(?:\\.|[^"\\])*")\)/gu;
function rulesFor(input, expectedValues) {
  const rules = [];
  const allText = expectedValues.join(" ");
  const compound = Boolean(Number(input.isTempsCompose));
  if (/['’]/u.test(allText)) rules.push({ id: "apostrophe", label: "Apostrophe et \xE9lision" });
  if (compound && input.auxiliaire.trim().toLocaleLowerCase("fr") === "\xEAtre") rules.push({ id: "agreement", label: "Accord du participe pass\xE9" });
  if (["iel", "iels"].includes(input.pronom)) rules.push({ id: "inclusive", label: "Pronoms inclusifs" });
  if (compound) rules.push({ id: "compound", label: "Temps compos\xE9" });
  if (input.modename.toLocaleLowerCase("fr") === "imp\xE9ratif") rules.push({ id: "imperative", label: "Imp\xE9ratif sans pronom" });
  if (/^(s['’]|se\s)/iu.test(input.infinitif)) rules.push({ id: "reflexive", label: "Verbe pronominal" });
  if (!compound) rules.push({ id: "simple", label: "Temps simple" });
  return rules;
}
function purposeFor(input, rules) {
  const checks = [];
  if (rules.some((rule) => rule.id === "apostrophe")) checks.push("l\u2019\xE9lision et l\u2019apostrophe");
  if (rules.some((rule) => rule.id === "agreement")) checks.push(`l\u2019accord du participe pass\xE9 avec \xAB ${input.pronom} \xBB`);
  if (rules.some((rule) => rule.id === "inclusive")) checks.push(`la forme inclusive employ\xE9e avec \xAB ${input.pronom} \xBB`);
  if (rules.some((rule) => rule.id === "imperative")) checks.push("la construction de l\u2019imp\xE9ratif sans pronom sujet");
  if (rules.some((rule) => rule.id === "reflexive")) checks.push("la construction du verbe pronominal");
  if (checks.length === 0) checks.push(`la forme de \xAB ${input.infinitif} \xBB \xE0 la personne \xAB ${input.pronom} \xBB`);
  const modeContext = {
    indicatif: "de l\u2019indicatif",
    subjonctif: "du subjonctif",
    conditionnel: "du conditionnel",
    imp\u00E9ratif: "de l\u2019imp\xE9ratif"
  };
  return `V\xE9rifie ${checks.join(", ainsi que ")} au ${input.tempsname} ${modeContext[input.modename.toLocaleLowerCase("fr")] || `du mode ${input.modename}`}.`;
}
function expectationsForPostmanItem(item) {
  var _a;
  const script = ((_a = item.event) == null ? void 0 : _a.filter((event) => event.listen === "test").flatMap((event) => {
    var _a2;
    return ((_a2 = event.script) == null ? void 0 : _a2.exec) || [];
  }).join("\n")) || "";
  return [...script.matchAll(EXPECTATION_PATTERN)].map((match) => ({
    property: match[1],
    matcher: match[2],
    expected: JSON.parse(match[3])
  }));
}
function sourceRow(input, index) {
  return {
    id: index + 1,
    verbe_id: 1,
    personne_id: 1,
    temp_id: 1,
    conjugaison1: input.conjugaison1,
    conjugaison2: input.conjugaison2 || "",
    conjugaison3: input.conjugaison3 || "",
    infinitif: input.infinitif,
    auxiliaire: input.auxiliaire,
    participe_passe: input.participe_pass\u00E9,
    temps_name: input.tempsname,
    is_compound: Number(input.isTempsCompose),
    mode_name: input.modename
  };
}
async function conjugationScenarioResults() {
  const collectionPath = resolve(process.cwd(), "postman", COLLECTION_FILE);
  const collection = JSON.parse(await readFile(collectionPath, "utf8"));
  return collection.item.map((item, index) => {
    var _a;
    const input = JSON.parse(item.request.body.raw);
    const result = formatConjugationQuestion(sourceRow(input, index), input.pronom);
    const expectations = expectationsForPostmanItem(item);
    const rules = rulesFor(input, expectations.map((expectation) => expectation.expected));
    const displayedForm = ((_a = expectations.find((expectation) => expectation.property === "reponsesPourCorrige")) == null ? void 0 : _a.expected) || item.name;
    const assertions = expectations.map((expectation, assertionIndex) => {
      const actual = result[expectation.property];
      const passed = expectation.matcher === "equal" ? actual === expectation.expected : Array.isArray(actual) && actual.includes(expectation.expected);
      return {
        id: `${index + 1}-${assertionIndex + 1}`,
        ...expectation,
        actual: Array.isArray(actual) ? actual : String(actual != null ? actual : ""),
        passed
      };
    });
    return {
      id: String(index + 1),
      name: displayedForm,
      title: `${input.modename.charAt(0).toLocaleUpperCase("fr")}${input.modename.slice(1)} \u2014 ${input.tempsname} \u2014 \xAB ${displayedForm} \xBB`,
      purpose: purposeFor(input, rules),
      infinitif: input.infinitif,
      pronom: input.pronom,
      mode: input.modename,
      tense: input.tempsname,
      sourceForms: [input.conjugaison1, input.conjugaison2, input.conjugaison3].filter((form) => Boolean(form)),
      rules,
      passed: assertions.length > 0 && assertions.every((assertion) => assertion.passed),
      assertions
    };
  });
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state, 1664525) + 1013904223 >>> 0;
    return state / 4294967296;
  };
}
function unresolvedPlaceholders(texts) {
  return texts.filter((text) => /\{[a-zA-Z]+\}/u.test(text));
}
function immediateDuplicates(values) {
  return values.filter((value, index) => index > 0 && value === values[index - 1]).length;
}
function eventChecks(coach, eventType, seed) {
  const state = createCoachDialogueState();
  const random = seededRandom(seed);
  const context = {
    verb: "manger",
    mode: "indicatif",
    tense: "pass\xE9 compos\xE9",
    expectedAnswer: "nous avons mang\xE9",
    complement: "les pommes",
    participle: "mang\xE9es",
    score: 80,
    correctCount: 16,
    questionCount: 20,
    questionNumber: 3
  };
  const reactions = Array.from({ length: 20 }, () => createVariedCoachReaction(coach, eventType, context, state, {
    random,
    allowMotion: true,
    mediaAllowed: eventType !== "question",
    animatedOnly: eventType === "correct"
  }));
  const texts = reactions.map((reaction) => reaction.text);
  const distinct = new Set(texts).size;
  const maximumFrequency = Math.max(...[...new Set(texts)].map((text) => texts.filter((value) => value === text).length));
  const label = eventType === "question" ? "relances" : eventType === "correct" ? "r\xE9ussites" : "corrections";
  const checks = [
    {
      id: `${eventType}-variety`,
      label: `Diversit\xE9 des ${label}`,
      passed: distinct >= 10,
      expected: "au moins 10 formulations sur 20 interventions",
      actual: `${distinct} formulation(s)`
    },
    {
      id: `${eventType}-frequency`,
      label: `Fr\xE9quence des ${label}`,
      passed: maximumFrequency <= 2,
      expected: "une formulation utilis\xE9e au maximum 2 fois",
      actual: `maximum ${maximumFrequency} fois`
    },
    {
      id: `${eventType}-consecutive`,
      label: `R\xE9p\xE9titions cons\xE9cutives des ${label}`,
      passed: immediateDuplicates(texts) === 0,
      expected: "aucune r\xE9p\xE9tition imm\xE9diate",
      actual: `${immediateDuplicates(texts)} r\xE9p\xE9tition(s)`
    },
    {
      id: `${eventType}-context`,
      label: `Contexte r\xE9solu dans les ${label}`,
      passed: unresolvedPlaceholders(texts).length === 0,
      expected: "aucune variable technique visible",
      actual: `${unresolvedPlaceholders(texts).length} variable(s) non remplac\xE9e(s)`
    }
  ];
  if (eventType === "correct") {
    const mediaIds = reactions.map((reaction) => {
      var _a;
      return (_a = reaction.media) == null ? void 0 : _a.id;
    }).filter((id) => Boolean(id));
    checks.push(
      {
        id: "correct-animation",
        label: "GIF apr\xE8s une r\xE9ussite",
        passed: mediaIds.length === 20,
        expected: "un GIF anim\xE9 valid\xE9 pour chaque r\xE9ussite",
        actual: `${mediaIds.length}/20 r\xE9action(s) avec GIF`
      },
      {
        id: "correct-media-repeat",
        label: "Vari\xE9t\xE9 des GIF",
        passed: immediateDuplicates(mediaIds) === 0,
        expected: "jamais deux fois le m\xEAme GIF de suite",
        actual: `${immediateDuplicates(mediaIds)} r\xE9p\xE9tition(s)`
      }
    );
  }
  return checks;
}
function auditCoachCredibility(coach, seed = 1) {
  const unverifiableCorrections = coach.replies.filter((reply) => reply.isActive && reply.eventType === "incorrect" && /(?:le mode|le temps|la personne) (?:était|est) correct/iu.test(reply.content));
  const checks = [
    ...eventChecks(coach, "question", seed + 11),
    ...eventChecks(coach, "correct", seed + 23),
    ...eventChecks(coach, "incorrect", seed + 37),
    {
      id: "caractere-profile",
      label: "Caract\xE8re identifiable",
      passed: Boolean(coach.caractereName.trim() && coach.pedagogicalStyle.trim()),
      expected: "un caract\xE8re et une mani\xE8re d\u2019aider renseign\xE9s",
      actual: coach.caractereName && coach.pedagogicalStyle ? `${coach.caractereName} \u2014 ${coach.pedagogicalStyle}` : "profil incomplet"
    },
    {
      id: "verifiable-feedback",
      label: "Corrections cr\xE9dibles",
      passed: unverifiableCorrections.length === 0,
      expected: "aucune affirmation sur ce que l\u2019\xE9l\xE8ve aurait correctement identifi\xE9",
      actual: unverifiableCorrections.length ? unverifiableCorrections.map((reply) => `\xAB ${reply.content} \xBB`).join(", ") : "aucune affirmation inv\xE9rifiable"
    }
  ];
  const score = Math.round(checks.filter((check) => check.passed).length / checks.length * 100);
  return {
    coachId: coach.id,
    coachName: `${coach.firstName} ${coach.lastName}`,
    caractereName: coach.caractereName,
    score,
    passed: checks.every((check) => check.passed),
    checks
  };
}

const TEST_DIRECTORY = resolve(process.cwd(), "tests");
const TEST_CATALOG = {
  "postman-conjugation.test.mjs": {
    title: "Formes verbales par mode",
    description: "30 situations de conjugaison : indicatif, subjonctif, conditionnel, imp\xE9ratif, accords et apostrophes.",
    category: "Conjugaison fran\xE7aise"
  },
  "answer.test.mjs": {
    title: "Correcteur, apostrophes et saisie",
    description: "V\xE9rifie les apostrophes droites ou typographiques, les accents, les espaces et les r\xE9ponses alternatives.",
    category: "Conjugaison fran\xE7aise"
  },
  "conjugation-display.test.mjs": {
    title: "Ordre des modes et des temps",
    description: "Contr\xF4le l\u2019ordre de pr\xE9sentation des modes et des temps dans l\u2019\xE9diteur de verbes.",
    category: "Conjugaison fran\xE7aise"
  },
  "conjugation-rules.test.mjs": {
    title: "R\xE8gles du fran\xE7ais et correcteur",
    description: "Formes multiples, compl\xE9ments d\u2019objet, apostrophes, accords, imp\xE9ratif, participe et g\xE9rondif.",
    category: "Conjugaison fran\xE7aise"
  },
  "verb-complements.test.mjs": {
    title: "Catalogue des COD et COI",
    description: "Contr\xF4le la transitivit\xE9, les constructions et les compl\xE9ments naturels COD ou COI propos\xE9s dans les phrases.",
    category: "Conjugaison fran\xE7aise"
  },
  "complement-placement.test.mjs": {
    title: "Position et morphologie des compl\xE9ments",
    description: "Contr\xF4le l\u2019ant\xE9position, les d\xE9terminants, les \xE9lisions, le genre et le nombre des COD.",
    category: "Conjugaison fran\xE7aise"
  },
  "cod-agreement.test.mjs": {
    title: "COD avant/apr\xE8s et accords",
    description: "Teste les COD avant et apr\xE8s le verbe au masculin, f\xE9minin, singulier et pluriel, ainsi que les temps simples, compos\xE9s et l\u2019imp\xE9ratif.",
    category: "Conjugaison fran\xE7aise"
  },
  "conjugation-database.test.mjs": {
    title: "R\xE9f\xE9rences et int\xE9grit\xE9 des 488 verbes",
    description: "Compare les formes sensibles \xE0 des r\xE9f\xE9rences explicites et audite toutes les donn\xE9es du catalogue.",
    category: "Conjugaison fran\xE7aise"
  },
  "verb-search.test.mjs": {
    title: "Recherche et autocompl\xE9tion des verbes",
    description: "V\xE9rifie les accents, le classement des suggestions et la recherche vide dans le catalogue administrateur.",
    category: "Administration"
  },
  "challenge-presets.test.mjs": {
    title: "Catalogue des d\xE9fis",
    description: "Contr\xF4le les s\xE9lections de verbes, de temps et le nombre de questions des d\xE9fis pr\xE9d\xE9finis.",
    category: "Exercices et d\xE9fis"
  },
  "challenge-validation.test.mjs": {
    title: "Validation des d\xE9fis partag\xE9s",
    description: "V\xE9rifie les liens de d\xE9fi, leurs options et la compatibilit\xE9 avec l\u2019ancien format.",
    category: "Exercices et d\xE9fis"
  },
  "admin-users.test.mjs": {
    title: "Validation des utilisateurs",
    description: "Contr\xF4le les adresses \xE9lectroniques, mots de passe, r\xF4les et donn\xE9es de compte.",
    category: "Administration"
  },
  "coach-conversation-scenarios.test.mjs": {
    title: "Conversations et cr\xE9dibilit\xE9 des coaches",
    description: "Simule les \xE9changes, les d\xE9lais, les corrections, les GIFs et 60 interventions par coach pour d\xE9tecter les r\xE9p\xE9titions m\xE9caniques.",
    category: "Exercices et d\xE9fis"
  }
};
const RESULT_GROUP_CATALOG = {
  "autocompl\xE9tion des verbes administr\xE9s": { title: "Autocompl\xE9tion des verbes", description: "Normalisation des accents et classement des meilleures suggestions." },
  "validation des utilisateurs administr\xE9s": { title: "Utilisateurs \u2014 validation des donn\xE9es", description: "Formats, r\xF4les et r\xE8gles appliqu\xE9s lors de la cr\xE9ation ou modification d\u2019un compte." },
  normalizeAnswer: { title: "Apostrophes, accents, casse et espaces", description: "Fa\xE7ons diff\xE9rentes d\u2019\xE9crire une m\xEAme r\xE9ponse sans transformer une faute en bonne r\xE9ponse." },
  getAlternativeCorrections: { title: "Solutions multiples", description: "Autres formes correctes propos\xE9es apr\xE8s une r\xE9ponse juste, par exemple \xAB assieds \xBB et \xAB assois \xBB." },
  isAnswerCorrect: { title: "D\xE9cision du correcteur", description: "R\xE9ponses que le correcteur doit accepter ou refuser." },
  validateAnswer: { title: "Diagnostic du correcteur", description: "Motif pr\xE9cis retourn\xE9 pour une bonne r\xE9ponse, une r\xE9ponse vide ou une erreur." },
  challengePresets: { title: "Catalogue des d\xE9fis", description: "Contenu et coh\xE9rence des d\xE9fis propos\xE9s aux utilisateurs." },
  "conversion du format historique": { title: "Anciens d\xE9fis", description: "Compatibilit\xE9 avec les d\xE9fis cr\xE9\xE9s dans l\u2019ancienne version du site." },
  inspectPresetCompatibility: { title: "Compatibilit\xE9 avec la base", description: "D\xE9tection des verbes ou temps absents de la base de donn\xE9es." },
  "validation des d\xE9fis partag\xE9s": { title: "D\xE9fis partag\xE9s", description: "Lecture, options et s\xE9curit\xE9 des liens de d\xE9fi." },
  "validation des questionnaires": { title: "Questionnaires", description: "Normalisation des param\xE8tres historiques des questionnaires." },
  "ordre d\u2019affichage des conjugaisons": { title: "Ordre des modes et des temps", description: "Pr\xE9sentation des conjugaisons dans l\u2019ordre attendu par l\u2019interface." },
  "collection Postman \u2014 formatage des conjugaisons": { title: "Formes verbales par mode", description: "Sc\xE9narios d\xE9taill\xE9s dans l\u2019interface de conjugaison ci-dessous." },
  "formes multiples reconnues par le correcteur": { title: "Formes multiples", description: "Acceptation et annonce des autres solutions correctes." },
  "apostrophes et \xE9lisions fran\xE7aises": { title: "Apostrophes et \xE9lisions", description: "Voyelles, h muet, h aspir\xE9 et tournures du subjonctif." },
  "compl\xE9ments d\u2019objet dans les questions": { title: "Phrases avec un COD", description: "Pr\xE9sentation de la phrase et acceptation de la forme seule ou de la phrase compl\xE8te." },
  "compl\xE9ments d\u2019objet valid\xE9s": { title: "Donn\xE9es des compl\xE9ments", description: "Quantit\xE9, transitivit\xE9, absence de doublons et coh\xE9rence des associations lexicales." },
  "pr\xE9paration grammaticale des COD ant\xE9pos\xE9s": { title: "COD plac\xE9s avant le verbe", description: "D\xE9terminants, \xE9lisions, genre et nombre n\xE9cessaires \xE0 l\u2019accord." },
  "accords du participe pass\xE9": { title: "Accord du participe pass\xE9", description: "Accords avec \xEAtre, absence d\u2019accord avec avoir et formes inclusives." },
  "imp\xE9ratif et ponctuation": { title: "Imp\xE9ratif, tirets et ponctuation", description: "Absence de pronom sujet, formes pronominales et s euphonique devant y ou en." },
  "participe, infinitif et g\xE9rondif": { title: "Formes non personnelles", description: "Participe pr\xE9sent/pass\xE9 et g\xE9rondif pr\xE9sent/pass\xE9." },
  "couverture de tous les temps personnels": { title: "Tous les modes et temps personnels", description: "Une forme de r\xE9f\xE9rence pour chacun des 17 temps personnels du catalogue." },
  "variantes reconnues par les ouvrages de r\xE9f\xE9rence": { title: "Variantes de r\xE9f\xE9rence", description: "Asseoir, payer, essayer et pouvoir." },
  "familles \xE0 modification orthographique": { title: "Modifications orthographiques", description: "Verbes en -ger, -cer, changements de radical, tr\xE9ma et futur irr\xE9gulier." },
  "verbes irr\xE9guliers fondamentaux": { title: "Verbes irr\xE9guliers", description: "\xCAtre, avoir, aller, faire, dire, venir, tenir et prendre." },
  "verbes d\xE9fectifs et impersonnels": { title: "Verbes d\xE9fectifs", description: "Falloir et pleuvoir sans g\xE9n\xE9ration de personnes inexistantes." },
  "int\xE9grit\xE9 des 488 verbes du catalogue": { title: "Audit complet du catalogue", description: "Doublons, m\xE9tadonn\xE9es, variantes, relations, formes manquantes et auxiliaires." },
  "sc\xE9narios chronologiques du chat": { title: "D\xE9roulement des conversations", description: "Ordre des bulles, consigne finale, correction, d\xE9lai de trois secondes, grammaire et fin du questionnaire." },
  "cr\xE9dibilit\xE9 des douze coaches": { title: "Cr\xE9dibilit\xE9 des coaches", description: "Diversit\xE9 des formulations, absence de r\xE9p\xE9titions imm\xE9diates et vari\xE9t\xE9 des r\xE9actions visuelles." }
};
async function coachCredibilityResults() {
  const coaches = await listCoaches(useDatabase(), true);
  return coaches.map((coach, index) => auditCoachCredibility(coach, 1e4 + index));
}
async function availableAdminTests() {
  const categoryOrder = ["Conjugaison fran\xE7aise", "Exercices et d\xE9fis", "Administration", "Technique"];
  const entries = await readdir(TEST_DIRECTORY, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && /^[a-z0-9-]+\.test\.mjs$/u.test(entry.name)).map((entry) => {
    var _a, _b, _c;
    return {
      id: entry.name,
      title: ((_a = TEST_CATALOG[entry.name]) == null ? void 0 : _a.title) || entry.name.replace(/\.test\.mjs$/u, "").replace(/-/gu, " "),
      description: ((_b = TEST_CATALOG[entry.name]) == null ? void 0 : _b.description) || "Tests techniques automatis\xE9s.",
      category: ((_c = TEST_CATALOG[entry.name]) == null ? void 0 : _c.category) || "Technique"
    };
  }).sort((left, right) => categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category) || left.title.localeCompare(right.title, "fr"));
}
function summaryValue(output, label) {
  return [...output.matchAll(new RegExp(`^# ${label} (\\d+)$`, "gmu"))].reduce((total, match) => total + Number(match[1] || 0), 0);
}
function structuredTestGroups(output, category) {
  const pendingTitles = /* @__PURE__ */ new Map();
  const groups = /* @__PURE__ */ new Map();
  for (const line of output.split("\n")) {
    const subtest = line.match(/^(\s*)# Subtest: (.+)$/u);
    if (subtest) {
      pendingTitles.set(Math.floor(subtest[1].length / 4), subtest[2]);
      continue;
    }
    const status = line.match(/^(\s*)(not )?ok \d+ - (.+?)(?: # (SKIP|TODO).*)?$/u);
    if (!status) continue;
    const depth = Math.floor(status[1].length / 4);
    if (depth === 0) continue;
    const groupTitle = pendingTitles.get(depth - 1) || "Autres contr\xF4les";
    const cases = groups.get(groupTitle) || [];
    cases.push({
      title: status[3],
      passed: !status[2],
      skipped: Boolean(status[4])
    });
    groups.set(groupTitle, cases);
  }
  return [...groups].map(([sourceTitle, cases]) => {
    var _a, _b;
    return {
      title: ((_a = RESULT_GROUP_CATALOG[sourceTitle]) == null ? void 0 : _a.title) || sourceTitle,
      description: ((_b = RESULT_GROUP_CATALOG[sourceTitle]) == null ? void 0 : _b.description) || "Contr\xF4les automatis\xE9s de cette partie du site.",
      category,
      kind: sourceTitle.startsWith("collection Postman") ? "conjugation" : "general",
      passed: cases.every((testCase) => testCase.passed || testCase.skipped),
      cases
    };
  });
}
function repairPrompt(files, groups, scenarios, coachReports, output) {
  const failedGroups = groups.map((group) => ({ ...group, cases: group.cases.filter((testCase) => !testCase.passed && !testCase.skipped) })).filter((group) => group.cases.length > 0);
  const failedScenarios = scenarios.filter((scenario) => !scenario.passed);
  const failedCoaches = coachReports.filter((report) => !report.passed);
  if (failedGroups.length === 0 && failedScenarios.length === 0 && failedCoaches.length === 0) return "";
  const lines = [
    "Analyse et r\xE9pare les tests de conjugaison en \xE9chec dans ce projet.",
    "",
    "Contraintes :",
    "- corriger le code ou les donn\xE9es responsables, sans affaiblir ni supprimer les tests ;",
    "- pr\xE9server les formes alternatives valides ;",
    "- v\xE9rifier les r\xE8gles de conjugaison fran\xE7aise et les accords ;",
    "- relancer les fichiers concern\xE9s puis toute la suite de tests ;",
    "",
    `Fichiers ex\xE9cut\xE9s : ${files.join(", ")}`,
    "",
    "Tests en \xE9chec :"
  ];
  for (const group of failedGroups) {
    lines.push(`- ${group.title}`);
    for (const testCase of group.cases) lines.push(`  - ${testCase.title}`);
  }
  for (const scenario of failedScenarios) {
    lines.push(`- ${scenario.title}`);
    lines.push(`  Objectif : ${scenario.purpose}`);
    for (const assertion of scenario.assertions.filter((assertion2) => !assertion2.passed)) {
      lines.push(`  - ${assertion.property} : attendu ${JSON.stringify(assertion.expected)}, obtenu ${JSON.stringify(assertion.actual)}`);
    }
  }
  for (const report of failedCoaches) {
    lines.push(`- Cr\xE9dibilit\xE9 de ${report.coachName} \u2014 score ${report.score} %`);
    for (const check of report.checks.filter((check2) => !check2.passed)) {
      lines.push(`  - ${check.label} : attendu ${check.expected}, obtenu ${check.actual}`);
    }
  }
  lines.push("", "Journal technique utile :", "```text", output.slice(-14e3), "```");
  return lines.join("\n");
}
async function runAdminTests(requestedFiles) {
  var _a, _b;
  const available = await availableAdminTests();
  const allowed = new Set(available.map((test) => test.id));
  const files = requestedFiles.length > 0 ? [...new Set(requestedFiles)] : [...allowed];
  if (files.length === 0 || files.some((file) => !allowed.has(file))) {
    throw createError({ statusCode: 400, statusMessage: "S\xE9lection de tests invalide" });
  }
  const startedAt = Date.now();
  const testsById = new Map(available.map((test) => [test.id, test]));
  const filesByCategory = /* @__PURE__ */ new Map();
  for (const file of files) {
    const category = ((_a = testsById.get(file)) == null ? void 0 : _a.category) || "Technique";
    filesByCategory.set(category, [...filesByCategory.get(category) || [], file]);
  }
  const executions = [];
  for (const [category, categoryFiles] of filesByCategory) {
    const execution = await new Promise((resolveExecution) => {
      execFile(
        process.execPath,
        ["--env-file-if-exists=.env", "--import", "tsx", "--test", "--test-concurrency=1", "--test-reporter=tap", ...categoryFiles.map((file) => join(TEST_DIRECTORY, file))],
        { cwd: process.cwd(), timeout: 6e4, maxBuffer: 2e6 },
        (error, stdout, stderr) => {
          const exitCode = error && typeof error.code === "number" ? error.code : error ? 1 : 0;
          resolveExecution({
            exitCode,
            stdout: String(stdout || ""),
            stderr: String(stderr || ""),
            timedOut: Boolean(error && "killed" in error && error.killed)
          });
        }
      );
    });
    executions.push({
      category,
      files: categoryFiles,
      exitCode: execution.exitCode,
      output: `${execution.stdout}${execution.stderr ? `
${execution.stderr}` : ""}`,
      timedOut: execution.timedOut
    });
  }
  const output = executions.map((execution) => `# Suite : ${execution.category}
${execution.output}`).join("\n\n").slice(-2e5);
  const totalFor = (label) => executions.reduce((total, execution) => total + summaryValue(execution.output, label), 0);
  const conjugationScenarios = files.includes("postman-conjugation.test.mjs") ? await conjugationScenarioResults() : [];
  const coachCredibility = files.includes("coach-conversation-scenarios.test.mjs") ? await coachCredibilityResults() : [];
  const groups = executions.flatMap((execution) => structuredTestGroups(execution.output, execution.category));
  const suiteResults = executions.map((execution) => ({
    title: execution.category,
    passed: execution.exitCode === 0,
    files: execution.files.length,
    tests: summaryValue(execution.output, "tests"),
    failed: summaryValue(execution.output, "fail")
  }));
  return {
    success: executions.every((execution) => execution.exitCode === 0),
    exitCode: ((_b = executions.find((execution) => execution.exitCode !== 0)) == null ? void 0 : _b.exitCode) || 0,
    timedOut: executions.some((execution) => execution.timedOut),
    durationMs: Date.now() - startedAt,
    files,
    summary: {
      tests: totalFor("tests"),
      suites: totalFor("suites"),
      passed: totalFor("pass"),
      failed: totalFor("fail"),
      skipped: totalFor("skipped")
    },
    suiteResults,
    groups,
    conjugationScenarios,
    coachCredibility,
    repairPrompt: repairPrompt(files, groups, conjugationScenarios, coachCredibility, output),
    output
  };
}

export { availableAdminTests as a, runAdminTests as r };
//# sourceMappingURL=admin-tests.mjs.map
