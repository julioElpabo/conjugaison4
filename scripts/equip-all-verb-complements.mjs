import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'
import { inferAnteposedComplement } from '../server/services/complement-placement.ts'

const report = JSON.parse(await readFile(new URL('../reports/academie-complements.json', import.meta.url), 'utf8'))
const SOURCE = 'Catalogue pédagogique mineurs 2026'
const OBSOLETE_SOURCE = 'Catalogue exhaustif contrôlé 2026'
const excludedDirect = new Set(['douter', 'grandir', 'partir', 'pouvoir'])

// Uniquement les articles pour lesquels aucun exemple direct court et exploitable
// n'est extractible automatiquement. Chaque amorce désigne un emploi français courant.
const directSeeds = {
  abonner: 'un lecteur', accorder: 'une autorisation', acquérir: 'une maison', affaiblir: 'une équipe',
  affoler: 'un animal', aimer: 'une chanson', apercevoir: 'une silhouette', appeler: 'un ami',
  apprendre: 'une leçon', approuver: 'une décision', arrêter: 'une voiture', avoir: 'une idée',
  captiver: 'un public', caracteriser: 'une époque', celebrer: 'une victoire', charger: 'un camion',
  cibler: 'un objectif', comprendre: 'une consigne', concerner: 'une personne', conduire: 'une voiture',
  connaître: 'une ville', conserver: 'un document', considerer: 'une proposition', consommer: 'un produit',
  contacter: 'une personne', controler: 'un billet', couvrir: 'une table', croire: 'une histoire',
  deborder: 'un adversaire', deboucher: 'une bouteille', decaler: 'un rendez-vous', decoller: 'une étiquette',
  decouper: 'une feuille', decoupler: 'un système', dedier: 'un livre', defier: 'un adversaire',
  defiler: 'une couture', demander: 'une explication', demarrer: 'une voiture', démolir: 'une maison',
  denicher: 'un trésor', denommer: 'une rue', deposer: 'un colis', deriver: 'une rivière',
  desactiver: 'une alarme', designer: 'un responsable', detacher: 'une remorque', detourner: 'une route',
  developper: 'une application', deverser: 'un liquide', differer: 'une décision', dire: 'une phrase',
  diriger: 'une équipe', distraire: 'un enfant', écrire: 'une lettre', émouvoir: 'un public',
  fixer: 'une étagère', gagner: 'une course', garder: 'un secret', imaginer: 'une histoire',
  laisser: 'une note', manger: 'une pomme', menacer: 'une personne', mener: 'une enquête',
  mettre: 'une veste', nourrir: 'un animal', payer: 'une facture', préférer: 'une option',
  rappeler: 'une règle', recevoir: 'une lettre', réfléchir: 'une lumière', regarder: 'un film',
  rencontrer: 'une amie', répéter: 'une phrase', savoir: 'une réponse', souhaiter: 'un anniversaire',
  suggérer: 'une solution', suivre: 'une route', voir: 'un paysage', voler: 'un vélo',
  oindre: 'un front',
}

// Ces amorces remplacent des exemples dictionnairiques corrects mais trop
// violents, datés, sensibles ou simplement peu naturels dans un exercice isolé.
const childSafeDirect = {
  accuser: 'une erreur', admirer: 'un paysage', adorer: 'une chanson', affronter: 'un défi',
  apaiser: 'un enfant inquiet', assaillir: 'un château imaginaire', assiéger: 'un château de sable',
  assister: 'une personne', attendre: 'un bus', attester: 'un résultat', avaler: 'une gorgée d’eau', avouer: 'une erreur',
  baigner: 'des pieds', battre: 'un record', berner: 'un personnage fictif', bousculer: 'une habitude',
  camoufler: 'un objet', capturer: 'une image', caresser: 'un animal', cerner: 'un problème',
  changer: 'une habitude', chasser: 'une mouche', choquer: 'des verres', citer: 'une source', concentrer: 'un effort',
  conquérir: 'une compétence',
  couper: 'une feuille', courir: 'une course', cuisiner: 'un repas', détruire: 'un château de cartes',
  disposer: 'des cartes', donner: 'un conseil', effleurer: 'une feuille', envahir: 'un espace',
  essuyer: 'une table', faire: 'un exercice', filmer: 'un paysage', forcer: 'une porte',
  foudroyer: 'un public du regard', fuir: 'un problème', fumer: 'un aliment', haïr: 'une injustice',
  interpeller: 'une personne', jeter: 'une balle', jouer: 'un rôle', juger: 'une situation',
  lancer: 'une balle', laver: 'une table', maudire: 'une journée pluvieuse', montrer: 'un dessin',
  moudre: 'un grain', observer: 'une expérience', offrir: 'un cadeau', organiser: 'une fête',
  oublier: 'un rendez-vous', perdre: 'une clé', plonger: 'un objet', présenter: 'un projet',
  protéger: 'un animal', répandre: 'une bonne nouvelle', reprendre: 'un exercice',
  requérir: 'une aide', résoudre: 'un problème', saluer: 'un ami', servir: 'un repas',
  sortir: 'une poubelle', souffrir: 'une attente', tenir: 'un objet', tomber: 'une quille',
  tordre: 'un fil de fer', trouver: 'une solution', tuer: 'un microbe', vaincre: 'une difficulté',
  vivre: 'une aventure', vouloir: 'une réponse',
}

// Emplois indirects utiles et non ambigus. Le texte stocké contient la préposition,
// tandis que la construction conserve séparément sa valeur grammaticale.
const indirectSeeds = {
  assister: ['à', 'une réunion'], croire: ['à', 'une histoire'], discuter: ['de', 'un projet'],
  douter: ['de', 'une réponse'], jouer: ['à', 'un jeu'], manquer: ['à', 'une obligation'],
  parler: ['à', 'un ami'], penser: ['à', 'une solution'], plaire: ['à', 'un public'],
  réfléchir: ['à', 'une question'], répondre: ['à', 'une demande'], réussir: ['à', 'un examen'],
  rire: ['de', 'une plaisanterie'], servir: ['à', 'un projet'], songer: ['à', 'un voyage'],
  sourire: ['à', 'un enfant'], souffrir: ['de', 'un manque'], suffire: ['à', 'une personne'],
  surseoir: ['à', 'une décision'], tenir: ['à', 'une tradition'],
  'se moquer': ['de', 'une personne'], 'se préparer': ['à', 'une épreuve'],
  'se souvenir': ['de', 'une histoire'],
}

// Emplois usuels que la structure HTML de l'article ne fait pas remonter comme
// « transitifs directs », ou dont l'article n'a pas été retrouvé automatiquement.
const additionalDirect = {
  cadrer: 'une photographie', cesser: 'une activité', entrer: 'une donnée',
  nager: 'une distance', naviguer: 'un voilier', 'se brosser': 'des dents',
}

const determiners = {
  m: ['un', 'le', 'ce', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'un autre'],
  f: ['une', 'la', 'cette', 'ma', 'ta', 'sa', 'notre', 'votre', 'leur', 'une autre'],
  p: ['des', 'les', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'd’autres'],
}

function cleanSeed(value) {
  return String(value || '')
    .replace(/\([^)]*\)/gu, '')
    .split(',')[0]
    .replace(/[.;:!?]+$/gu, '')
    .replace(/\s+/gu, ' ')
    .trim()
}

function seedKind(seed) {
  const first = seed.split(/\s+/u)[0].toLocaleLowerCase('fr')
  if (['un', 'le', 'ce', 'cet', 'mon', 'ton', 'son'].includes(first)) return 'm'
  if (['une', 'la', 'cette', 'ma', 'ta', 'sa'].includes(first)) return 'f'
  if (['des', 'les', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs'].includes(first)) return 'p'
  return null
}

function variants(seed, preposition = null) {
  const cleaned = cleanSeed(seed)
  const kind = seedKind(cleaned)
  if (!kind) throw new Error(`Amorce sans genre/nombre explicite : ${seed}`)
  const rest = cleaned.replace(/^\S+\s+/u, '')
  return determiners[kind].map((determiner) => {
    const beginsWithVowel = /^[aeiouyàâäéèêëîïôöùûü]/iu.test(rest)
    if (kind === 'f' && beginsWithVowel) {
      if (determiner === 'ma') determiner = 'mon'
      if (determiner === 'ta') determiner = 'ton'
      if (determiner === 'sa') determiner = 'son'
    }
    if (beginsWithVowel && (determiner === 'le' || determiner === 'la')) determiner = 'l’'
    if (beginsWithVowel && determiner === 'ce') determiner = 'cet'
    const phrase = determiner === 'l’' ? `l’${rest}` : `${determiner} ${rest}`
    if (!preposition) return phrase
    if (preposition === 'à' && determiner === 'le') return `au ${rest}`
    if (preposition === 'à' && determiner === 'les') return `aux ${rest}`
    if (preposition === 'de' && determiner === 'le') return `du ${rest}`
    if (preposition === 'de' && determiner === 'les') return `des ${rest}`
    if (preposition === 'de' && determiner === 'un') return `d’un ${rest}`
    if (preposition === 'de' && determiner === 'une') return `d’une ${rest}`
    if (preposition === 'de' && determiner === 'un autre') return `d’un autre ${rest}`
    if (preposition === 'de' && determiner === 'une autre') return `d’une autre ${rest}`
    if (preposition === 'de' && determiner === 'd’autres') return `d’autres ${rest}`
    if (determiner === 'l’') return `${preposition} l’${rest}`
    return `${preposition} ${phrase}`
  })
}

function catalogVariants(seeds, preposition = null) {
  const choices = []
  const matrices = seeds.map(seed => variants(seed, preposition))
  for (let variantIndex = 0; variantIndex < 10; variantIndex += 1) {
    for (const values of matrices) {
      const text = values[variantIndex]
      if (!choices.includes(text)) choices.push(text)
      if (choices.length === 10) return choices
    }
  }
  return choices
}

function extractedSeeds(article) {
  return [...new Set(article.infinitiveExamples
    ?.filter(example => example.direct)
    .map(example => cleanSeed(example.complement))
    .filter(seed => seedKind(seed) && seed.split(/\s+/u).length <= 12))]
    .slice(0, 1)
}

const directCatalog = new Map()
for (const article of report.results) {
  if (article.error || !article.direct || excludedDirect.has(article.infinitive)) continue
  const safeSeed = childSafeDirect[article.infinitive] || directSeeds[article.infinitive]
  const seeds = safeSeed ? [safeSeed] : extractedSeeds(article)
  if (!seeds.length) throw new Error(`Aucun COD sûr pour ${article.infinitive}`)
  directCatalog.set(article.infinitive, { seeds, sourceUrl: article.url })
}
for (const [infinitive, seed] of Object.entries(additionalDirect)) {
  const article = report.results.find(item => item.infinitive === infinitive)
  directCatalog.set(infinitive, { seeds: [seed], sourceUrl: article?.url ?? null })
}

const database = await mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, charset: 'utf8mb4',
})

async function ensureSense(verbId, type, preposition, label) {
  const transitivite = type === 'cod' ? 'transitif_direct' : 'transitif_indirect'
  const [rows] = await database.execute(`
    SELECT id FROM verbe_sens
    WHERE verbe_id=? AND transitivite=? AND preposition <=> ?
    ORDER BY est_principal DESC, sort_order, id LIMIT 1
  `, [verbId, transitivite, preposition])
  if (rows[0]) return Number(rows[0].id)

  const [result] = await database.execute(`
    INSERT INTO verbe_sens
      (verbe_id, numero_sens, intitule, definition, construction, transitivite,
       preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
    SELECT ?, COALESCE(MAX(numero_sens), 0) + 1, ?, ?, ?, ?, ?, 'avoir', 'courant', 0, 0,
      'Académie française', COALESCE(MAX(sort_order), 0) + 1
    FROM verbe_sens WHERE verbe_id=?
  `, [verbId, label, label, type === 'cod' ? 'N0 V N1' : `N0 V ${preposition} N1`,
    transitivite, preposition, verbId])
  return Number(result.insertId)
}

async function equip(infinitive, type, seeds, preposition, sourceUrl) {
  const [verbs] = await database.execute(
    'SELECT id FROM verbes WHERE infinitif=? AND est_archive=0 LIMIT 1', [infinitive],
  )
  if (!verbs[0]) throw new Error(`Verbe actif absent : ${infinitive}`)
  const label = type === 'cod' ? `Emploi transitif direct de ${infinitive}` : `Emploi indirect de ${infinitive} ${preposition}`
  const senseId = await ensureSense(Number(verbs[0].id), type, preposition, label)
  const code = type === 'cod' ? 'cod-postpose' : `coi-${preposition}-postpose`
  const patron = type === 'cod' ? 'N0 V N1' : `N0 V ${preposition} N1`
  await database.execute(`
    INSERT INTO constructions_verbales
      (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
       source, source_url, statut_validation, actif)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'valide', 1)
    ON DUPLICATE KEY UPDATE fonction_objet=VALUES(fonction_objet), preposition=VALUES(preposition),
      patron=VALUES(patron), source_url=COALESCE(source_url, VALUES(source_url)),
      statut_validation='valide', actif=1
  `, [senseId, code, type, preposition, patron, SOURCE, sourceUrl])
  const [constructions] = await database.execute(
    'SELECT id FROM constructions_verbales WHERE sens_id=? AND code=? LIMIT 1', [senseId, code],
  )
  const constructionId = Number(constructions[0].id)
  for (const text of catalogVariants(seeds, preposition)) {
    const placement = type === 'cod' ? inferAnteposedComplement(text) : null
    await database.execute(`
      INSERT INTO complements_verbaux
        (construction_id, texte, texte_antepose, genre, nombre, classe_semantique,
         niveau_cecrl, poids, source, source_url, statut_validation, actif)
      VALUES (?, ?, ?, ?, ?, ?, 'A2', 1, ?, ?, 'valide', 1)
      ON DUPLICATE KEY UPDATE texte_antepose=VALUES(texte_antepose), genre=VALUES(genre),
        nombre=VALUES(nombre), classe_semantique=VALUES(classe_semantique),
        niveau_cecrl=VALUES(niveau_cecrl),
        source_url=IF(source='Catalogue exhaustif contrôlé 2026', VALUES(source_url), source_url),
        source=IF(source='Catalogue exhaustif contrôlé 2026', VALUES(source), source),
        statut_validation='valide', actif=1
    `, [constructionId, text, placement?.text ?? null, placement?.gender ?? null,
      placement?.number ?? null, type === 'cod' ? 'objet-atteste' : 'complement-indirect-atteste',
      SOURCE, sourceUrl])
  }
}

await database.beginTransaction()
try {
  await database.execute('UPDATE complements_verbaux SET actif=0 WHERE source IN (?, ?)', [OBSOLETE_SOURCE, SOURCE])
  for (const [infinitive, entry] of directCatalog) {
    await equip(infinitive, 'cod', entry.seeds, null, entry.sourceUrl)
  }
  for (const [infinitive, [preposition, seed]] of Object.entries(indirectSeeds)) {
    const article = report.results.find(item => item.infinitive === infinitive)
    await equip(infinitive, 'coi', [seed], preposition, article?.url ?? null)
  }
  await database.commit()
} catch (error) {
  await database.rollback()
  throw error
}

const [summary] = await database.execute(`
  SELECT cv.fonction_objet, COUNT(DISTINCT vs.verbe_id) AS verbes,
         COUNT(DISTINCT cv.id) AS constructions, COUNT(DISTINCT c.id) AS complements
  FROM constructions_verbales cv
  INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
  INNER JOIN verbes v ON v.id=vs.verbe_id AND v.est_archive=0
  INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
  WHERE cv.actif=1 AND cv.statut_validation='valide'
  GROUP BY cv.fonction_objet ORDER BY cv.fonction_objet
`)
console.log(JSON.stringify({ ok: true, expectedDirect: directCatalog.size, expectedIndirect: Object.keys(indirectSeeds).length, summary }, null, 2))
await database.end()
