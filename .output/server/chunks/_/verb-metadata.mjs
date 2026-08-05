const schoolVerbSeeds = {
  "5P": ["\xEAtre", "avoir", "aller", "chanter", "finir", "dire", "faire", "joindre", "savoir", "vouloir"],
  "6P": ["\xEAtre", "avoir", "aller", "aimer", "finir", "dire", "faire", "rendre", "savoir", "vouloir", "manger", "commencer", "mettre", "pouvoir", "oublier", "prendre", "sortir", "courir", "voir", "venir"],
  "7H": ["\xEAtre", "avoir", "aller", "chanter", "finir", "dire", "faire", "entendre", "savoir", "vouloir", "manger", "commencer", "mettre", "pouvoir", "oublier", "prendre", "sortir", "voir", "venir", "employer", "payer", "acheter", "peler"],
  "8H": ["\xEAtre", "avoir", "aller", "aimer", "finir", "dire", "faire", "rendre", "savoir", "vouloir", "manger", "commencer", "mettre", "pouvoir", "oublier", "prendre", "sortir", "courir", "voir", "venir", "employer", "payer", "acheter", "peler", "appeler", "jeter", "craindre", "plaire", "fuir", "valoir", "falloir", "boire", "ouvrir", "vivre"],
  "9H": ["\xEAtre", "avoir", "faire", "dire", "pouvoir", "aller", "voir", "savoir", "vouloir", "falloir", "devoir", "croire", "prendre", "comprendre", "reprendre", "apprendre", "aimer", "mettre", "tenir", "venir", "rendre", "entendre", "r\xE9pondre", "perdre", "descendre", "conna\xEEtre", "para\xEEtre", "sentir", "sortir", "partir", "vivre", "\xE9crire", "placer", "commencer", "avancer", "suivre", "mourir", "couvrir", "ouvrir", "offrir", "souffrir", "lire", "acheter"],
  "10H": ["servir", "jeter", "recevoir", "peser", "rire", "finir", "appr\xE9cier", "courir", "envoyer", "manger", "valoir", "plaire", "dormir", "c\xE9der", "cuire", "craindre", "payer", "asseoir"],
  "11H": ["acqu\xE9rir", "assi\xE9ger", "battre", "boire", "broyer", "conclure", "cr\xE9er", "cro\xEEtre", "cueillir", "fuir", "ha\xEFr", "modeler", "mouvoir", "na\xEEtre", "vaincre"]
};
const cifVerbSeeds = {
  CIF1: ["\xEAtre", "aller", "faire", "avoir"],
  CIF2: ["acheter", "aimer", "aller", "avoir", "chanter", "dire", "\xEAtre", "faire", "lire", "travailler"],
  CIF3: ["apprendre", "tenir", "venir"],
  CIF4: ["savoir", "falloir", "valoir", "boire"]
};
const rareVerbSeeds = ["acqu\xE9rir", "absoudre", "assaillir", "d\xE9choir", "g\xE9sir", "ou\xEFr", "pourvoir", "requ\xE9rir", "conqu\xE9rir", "cranter", "oindre", "ceindre", "surseoir", "se mouvoir"];
const difficultVerbSeeds = ["craindre", "accro\xEEtre", "ha\xEFr", "joindre", "moudre", "r\xE9soudre", "peler", "acqu\xE9rir", "mourir", "bouillir", "dormir", "vaincre", "v\xEAtir", "cueillir", "c\xE9der", "cro\xEEtre", "clore", "nourrir", "convaincre", "se baigner"];
const canonicalInfinitives = {
  caracteriser: "caract\xE9riser",
  celebrer: "c\xE9l\xE9brer",
  considerer: "consid\xE9rer",
  controler: "contr\xF4ler",
  deborder: "d\xE9border",
  deboucher: "d\xE9boucher",
  debuter: "d\xE9buter",
  decaler: "d\xE9caler",
  decoller: "d\xE9coller",
  decouper: "d\xE9couper",
  decoupler: "d\xE9coupler",
  dedier: "d\xE9dier",
  defier: "d\xE9fier",
  defiler: "d\xE9filer",
  dejeuner: "d\xE9jeuner",
  demarrer: "d\xE9marrer",
  denicher: "d\xE9nicher",
  denommer: "d\xE9nommer",
  deposer: "d\xE9poser",
  deriver: "d\xE9river",
  desactiver: "d\xE9sactiver",
  designer: "d\xE9signer",
  detourner: "d\xE9tourner",
  developper: "d\xE9velopper"
};
const semanticVerbSeeds = {
  "etat-existence": ["\xEAtre", "avoir", "rester", "demeurer", "sembler", "para\xEEtre", "appara\xEEtre", "devenir", "vivre", "exister", "g\xE9sir", "suffire", "valoir"],
  mouvement: ["aller", "venir", "partir", "arriver", "entrer", "sortir", "rentrer", "retourner", "avancer", "reculer", "courir", "marcher", "nager", "voyager", "naviguer", "fuir", "tomber", "monter", "descendre", "passer", "traverser", "sauter", "plonger", "se d\xE9placer", "se diriger", "se mouvoir", "tourner"],
  position: ["asseoir", "s'asseoir", "lever", "se lever", "coucher", "se coucher", "poser", "se poser", "tenir", "se tenir", "placer", "aligner", "accrocher", "attacher", "tourner", "se tourner"],
  transformation: ["changer", "devenir", "grandir", "affaiblir", "s'affaiblir", "am\xE9liorer", "adapter", "augmenter", "baisser", "allonger", "m\xE9langer", "se m\xE9langer", "br\xFBler", "casser", "se casser", "d\xE9molir", "vider", "remplir"],
  manipulation: ["prendre", "mettre", "porter", "apporter", "couper", "se couper", "ouvrir", "fermer", "couvrir", "se couvrir", "tirer", "pousser", "jeter", "attraper", "saisir", "se saisir", "joindre", "plier", "coudre", "moudre", "broyer", "cuire", "coller", "brancher"],
  corps: ["manger", "boire", "dormir", "mourir", "na\xEEtre", "souffrir", "respirer", "se laver", "se doucher", "se raser", "se brosser", "se nourrir", "se reposer", "se r\xE9veiller", "fatiguer", "blesser", "se blesser", "mordre", "se mordre", "avaler", "go\xFBter"],
  perception: ["voir", "regarder", "se regarder", "observer", "apercevoir", "s'apercevoir", "entendre", "ou\xEFr", "\xE9couter", "s'\xE9couter", "sentir", "go\xFBter", "examiner"],
  cognition: ["penser", "r\xE9fl\xE9chir", "savoir", "croire", "comprendre", "apprendre", "conna\xEEtre", "imaginer", "s'imaginer", "oublier", "se souvenir", "se rappeler", "consid\xE9rer", "d\xE9cider", "se d\xE9cider", "r\xE9soudre", "se r\xE9soudre", "choisir", "comparer"],
  communication: ["dire", "parler", "demander", "se demander", "r\xE9pondre", "raconter", "expliquer", "\xE9crire", "lire", "communiquer", "appeler", "s'appeler", "annoncer", "avouer", "citer", "commenter", "prononcer", "sugg\xE9rer", "saluer", "crier", "s'\xE9crier"],
  emotion: ["aimer", "adorer", "pr\xE9f\xE9rer", "appr\xE9cier", "craindre", "ha\xEFr", "plaire", "souhaiter", "rire", "sourire", "rigoler", "amuser", "affoler", "s'affoler", "\xE9mouvoir", "s'\xE9mouvoir", "calmer", "apaiser", "agacer"],
  modalite: ["vouloir", "pouvoir", "devoir", "falloir", "souhaiter", "oser", "essayer", "tenter", "faillir", "forcer", "se forcer"],
  relations: ["aider", "accompagner", "rencontrer", "inviter", "collaborer", "assister", "affronter", "se battre", "saluer", "\xE9pouser", "se marier", "prot\xE9ger", "se prot\xE9ger", "accuser", "approuver", "convaincre"],
  echange: ["avoir", "donner", "se donner", "recevoir", "acheter", "vendre", "payer", "offrir", "pr\xEAter", "emprunter", "commander", "allouer", "accorder", "acqu\xE9rir", "poss\xE9der"],
  "creation-travail": ["faire", "cr\xE9er", "fabriquer", "construire", "produire", "travailler", "bricoler", "cuisiner", "dessiner", "peindre", "colorier", "\xE9crire", "filmer", "photocopier", "copier", "cliquer", "archiver", "classer", "organiser", "r\xE9parer", "cultiver"],
  nature: ["pleuvoir", "briller", "couler", "br\xFBler", "geler", "neiger", "fleurir", "pousser", "bouillir", "d\xE9border"]
};

const normalize = (value) => value.trim().toLocaleLowerCase("fr").normalize("NFC");
const searchable = (value) => normalize(value).normalize("NFD").replace(/\p{Diacritic}/gu, "");
const bare = (value) => normalize(value).replace(/^se\s+/u, "").replace(/^s['’]/u, "");
function ending(value) {
  if (value.endsWith("oir")) return "oir";
  if (value.endsWith("er")) return "er";
  if (value.endsWith("ir")) return "ir";
  if (value.endsWith("re")) return "re";
  return "autre";
}
function family(value, group) {
  if (group === 1) {
    if (value.endsWith("ger")) return "ger";
    if (value.endsWith("cer")) return "cer";
    if (value.endsWith("yer")) return "yer";
    if (/(eler|eter)$/u.test(value)) return "eler-eter";
    if (/[éèe][^aeiouy]{0,2}er$/u.test(value)) return "er-alternance";
    return "er-regulier";
  }
  if (group === 2) return "ir-issant";
  if (/(venir|tenir)$/u.test(value)) return "venir-tenir";
  if (value.endsWith("prendre")) return "prendre";
  if (/(mettre|battre)$/u.test(value)) return "mettre-battre";
  if (/(voir|cevoir)$/u.test(value)) return "voir-recevoir";
  if (/(ouvrir|offrir|souffrir|cueillir)$/u.test(value)) return "ouvrir-cueillir";
  if (/(dre|tre)$/u.test(value)) return "dre-tre";
  if (value.endsWith("oir")) return "troisieme-oir";
  if (value.endsWith("ir")) return "troisieme-ir";
  return "irregulier";
}
async function refreshVerbMetadata(database, verbId) {
  var _a, _b, _c, _d, _e;
  const [[verb], [personRows], [alternativeRows], [allInfinitives]] = await Promise.all([
    database.execute("SELECT infinitif, `participe_pr\xE9sent` AS participe_present FROM verbes WHERE id = ?", [verbId]),
    database.execute(`SELECT DISTINCT vc.personne_id AS id FROM verbesconjugues vc INNER JOIN temps t ON t.id=vc.temp_id INNER JOIN modes m ON m.id=t.mode_id WHERE vc.verbe_id=? AND m.name='indicatif' AND t.name='pr\xE9sent' AND vc.conjugaison1<>''`, [verbId]),
    database.execute("SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id=? AND (conjugaison2<>'' OR conjugaison3<>'')", [verbId]),
    database.execute("SELECT infinitif, `participe_pr\xE9sent` AS participe_present FROM verbes")
  ]);
  if (!verb[0]) return;
  const infinitive = normalize(verb[0].infinitif);
  const base = bare(infinitive);
  const isPronominal = base !== infinitive;
  const group = base.endsWith("er") && base !== "aller" ? 1 : base.endsWith("ir") && searchable(verb[0].participe_present).replace(/^se\s+|^s['’]/u, "").endsWith("issant") ? 2 : 3;
  const familySlug = family(base, group);
  const [familyRows] = await database.execute("SELECT id FROM familles_conjugaison WHERE slug=?", [familySlug]);
  const infinitiveSet = new Set(allInfinitives.map((row) => normalize(row.infinitif)));
  const levels = Object.entries(schoolVerbSeeds).filter(([, names]) => names.includes(infinitive)).map(([level]) => level);
  const cif = Object.entries(cifVerbSeeds).filter(([, names]) => names.includes(infinitive)).map(([level]) => level);
  const features = [];
  if (base.endsWith("ger")) features.push("ger");
  if (base.endsWith("cer")) features.push("cer");
  if (isPronominal) features.push("pronominal");
  if (Number((_a = alternativeRows[0]) == null ? void 0 : _a.count)) features.push("formes-alternatives");
  if (personRows.length > 0 && personRows.length < 6) features.push("defectif");
  if (["descendre", "entrer", "monter", "passer", "rentrer", "retourner", "sortir"].includes(base)) features.push("auxiliaire-variable");
  const hard = difficultVerbSeeds.includes(infinitive);
  const typePronominal = !isPronominal ? "aucun" : infinitiveSet.has(base) ? "occasionnel" : "essentiel";
  const canonical = (_b = canonicalInfinitives[infinitive]) != null ? _b : infinitive;
  const cefr = levels.some((level) => ["5P", "6P"].includes(level)) ? "A1" : levels.some((level) => ["7H", "8H"].includes(level)) ? "A2" : levels.includes("9H") ? "B1" : levels.length ? "B2" : null;
  await database.execute(`UPDATE verbes SET groupe_conjugaison=?, famille_conjugaison_id=?, terminaison_infinitif=?, type_pronominal=?,
    est_impersonnel=?, est_defectif=?, personnes_disponibles=?, type_h_initial=?, niveau_difficulte=?, niveau_cecrl=?,
    registre_principal=?, forme_canonique=?, statut_validation=?, particularites=?, niveaux_scolaires=?, parcours_cif=? WHERE id=?`, [
    group,
    (_d = (_c = familyRows[0]) == null ? void 0 : _c.id) != null ? _d : null,
    ending(base),
    typePronominal,
    ["falloir", "pleuvoir"].includes(base) ? 1 : 0,
    personRows.length > 0 && personRows.length < 6 ? 1 : 0,
    JSON.stringify(personRows.map((row) => Number(row.id)).sort((a, b) => a - b)),
    base.startsWith("h") ? base === "ha\xEFr" ? "aspire" : "muet" : null,
    hard ? 3 : group === 3 || features.length ? 2 : 1,
    cefr,
    rareVerbSeeds.includes(infinitive) ? "rare" : "courant",
    canonical,
    canonical === infinitive ? "genere" : "a_verifier",
    JSON.stringify(features),
    JSON.stringify(levels),
    JSON.stringify(cif),
    verbId
  ]);
  const semanticSlugs = Object.entries(semanticVerbSeeds).filter(([, names]) => names.includes(infinitive) || names.includes(base)).map(([slug]) => slug);
  if (!semanticSlugs.length) semanticSlugs.push("action-processus");
  const [senseRows] = await database.execute("SELECT id FROM verbe_sens WHERE verbe_id=? ORDER BY numero_sens LIMIT 1", [verbId]);
  let senseId = Number((_e = senseRows[0]) == null ? void 0 : _e.id);
  if (!senseId) {
    const [result] = await database.execute(`INSERT INTO verbe_sens (verbe_id, numero_sens, intitule, est_pronominal, est_principal, sort_order) VALUES (?,1,?,?,1,1)`, [verbId, `Sens principal de \xAB ${canonical} \xBB`, isPronominal ? 1 : 0]);
    if ("insertId" in result) senseId = Number(result.insertId);
  }
  for (const slug of semanticSlugs) {
    await database.execute(`INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id) SELECT ?, id FROM categories_semantiques WHERE slug=?`, [senseId, slug]);
  }
}

export { refreshVerbMetadata as r };
//# sourceMappingURL=verb-metadata.mjs.map
