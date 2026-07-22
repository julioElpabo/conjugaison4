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
  denicher: 'un trésor', denommer: 'une rue', déposer: 'un colis', dériver: 'une rivière',
  désactiver: 'une alarme', designer: 'un responsable', detacher: 'une remorque', detourner: 'une route',
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
  tirer: 'un rideau', tordre: 'un fil de fer', trouver: 'une solution', tuer: 'un microbe',
  vaincre: 'une difficulté',
  vivre: 'une aventure', vouloir: 'une réponse',
}

// Emplois indirects utiles et non ambigus. Le texte stocké contient la préposition,
// tandis que la construction conserve séparément sa valeur grammaticale.
const indirectSeeds = {
  assister: ['à', 'une réunion'], croire: ['à', 'une histoire'], discuter: ['de', 'un projet'],
  douter: ['de', 'une réponse'], écrire: ['à', 'une mère'], jouer: ['à', 'une partie'], manquer: ['à', 'une obligation'],
  parler: ['à', 'un ami'], penser: ['à', 'une solution'], plaire: ['à', 'un public'],
  réfléchir: ['à', 'une question'], répondre: ['à', 'une demande'], réussir: ['à', 'un examen'],
  rire: ['de', 'une plaisanterie'], servir: ['à', 'un projet'], songer: ['à', 'un voyage'],
  sourire: ['à', 'un enfant'], souffrir: ['de', 'un manque'], suffire: ['à', 'une personne'],
  surseoir: ['à', 'une décision'], tenir: ['à', 'une tradition'],
  'se moquer': ['de', 'un personnage fictif'], 'se préparer': ['à', 'une épreuve'],
  'se souvenir': ['de', 'une histoire'],
}

// « Réussir à » sélectionne ici un infinitif, et non un groupe nominal :
// réussir un examen / réussir à faire quelque chose.
const reviewedIndirectComplements = {
  réussir: [
    'à ouvrir la porte',
    'à terminer le jeu',
    'à payer la facture',
    'à résoudre le problème',
    'à apprendre la leçon',
    'à retrouver son chemin',
    'à comprendre la consigne',
    'à finir son exercice',
    'à construire une maquette',
    'à écrire son prénom',
  ],
}

// Emplois usuels que la structure HTML de l'article ne fait pas remonter comme
// « transitifs directs », ou dont l'article n'a pas été retrouvé automatiquement.
const additionalDirect = {
  cadrer: 'une photographie', cesser: 'une activité', entrer: 'une donnée',
  nager: 'une distance', naviguer: 'un voilier', 'se brosser': 'des dents',
}

// Relecture pédagogique 2026 : ces amorces remplacent les premiers exemples
// dictionnairiques lorsqu'ils sont trop elliptiques, spécialisés, datés ou
// difficiles à comprendre hors de leur phrase d'origine.
const reviewedDirect = {
  abandonner: 'un projet', abreuver: 'un animal', abriter: 'une famille',
  absoudre: 'une personne', accabler: 'une personne', accaparer: 'des jouets',
  accompagner: 'un ami', accueillir: 'un nouvel élève', acquitter: 'une facture',
  adapter: 'un exercice', adresser: 'une lettre', agacer: 'une personne',
  aggraver: 'un problème', aider: 'un camarade', ajourner: 'une réunion',
  ajouter: 'un ingrédient', ajuster: 'une veste', allonger: 'une corde',
  allouer: 'un budget',
  allumer: 'une lampe', amarrer: 'un bateau', amuser: 'un enfant',
  ancrer: 'une idée', approcher: 'une chaise', appuyer: 'une échelle contre un mur',
  asseoir: 'un enfant',
  assurer: 'un service', attirer: 'un public', attraper: 'une balle',
  augmenter: 'un volume', avancer: 'un pion', baisser: 'une vitre',
  balancer: 'des bras', bannir: 'une mauvaise habitude', blesser: 'une sensibilité',
  bloquer: 'une porte', boucler: 'une ceinture', brancher: 'une lampe',
  brasser: 'des cartes', braver: 'une difficulté', broyer: 'des céréales',
  brûler: 'une étape', calmer: 'un enfant', calquer: 'un dessin',
  camper: 'un personnage', capoter: 'une voiture', caricaturer: 'un personnage',
  céder: 'une place', chahuter: 'un personnage', chatouiller: 'un personnage',
  chercher: 'une clé', chiffrer: 'un document', cloner: 'une plante',
  clore: 'une réunion', collecter: 'des informations', combiner: 'des idées',
  colorier: 'un dessin',
  commander: 'un repas', commenter: 'un texte', communiquer: 'une information',
  comparer: 'un résultat à un autre', conclure: 'un accord',
  considérer: 'une situation', consulter: 'un spécialiste', contester: 'une décision', continuer: 'un travail',
  convaincre: 'une personne', copier: 'un texte', corriger: 'une erreur',
  couler: 'une dalle', courir: 'une épreuve', craindre: 'un orage', cranter: 'une roue',
  créer: 'une affiche', creuser: 'un trou', crier: 'une réponse',
  critiquer: 'une décision', croiser: 'des bras', décider: 'une date',
  déboucher: 'une bouteille', décaler: 'une date', découper: 'une feuille',
  découpler: 'des éléments', défier: 'un adversaire', démarrer: 'une machine',
  dénicher: 'une solution', dénommer: 'une figure', détacher: 'une feuille',
  déverser: 'un contenu', découvrir: 'une surprise', dériver: 'un cours d’eau', devoir: 'une somme',
  diminuer: 'un volume', discuter: 'une proposition', diviser: 'une quantité',
  documenter: 'un dossier', élever: 'une construction', encourager: 'un camarade',
  enfiler: 'une perle', enseigner: 'une règle', éteindre: 'une lampe',
  étudier: 'une leçon', exercer: 'une compétence', explorer: 'une région',
  exprimer: 'une idée', fatiguer: 'une personne', filer: 'un fil',
  inventer: 'une histoire', joindre: 'des pièces', marier: 'des couleurs',
  manger: ['une pomme', 'une orange'], menacer: 'un projet',
  mouvoir: 'un objet', noter: 'une information', oindre: 'une surface',
  ouïr: 'un bruit', parcourir: 'un chemin', penser: 'un projet',
  peser: 'un colis', pincer: 'une corde', porter: 'un sac',
  pourvoir: 'un poste', raconter: 'une histoire', répondre: 'une phrase courte',
  retenir: 'une place', saisir: 'un objet', sentir: 'une odeur',
  tourner: 'une page', trahir: 'un secret', travailler: 'un texte', vendre: 'un objet',
}

const determiners = {
  m: ['un', 'le', 'ce', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'un autre'],
  f: ['une', 'la', 'cette', 'ma', 'ta', 'sa', 'notre', 'votre', 'leur', 'une autre'],
  p: ['des', 'les', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'd’autres'],
}

const masculinePluralDeterminers = ['des', 'les', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos']
const pluralExceptions = new Map([
  ['animal', 'animaux'], ['bateau', 'bateaux'], ['camarade', 'camarades'],
  ['château', 'châteaux'], ['cheveu', 'cheveux'], ['ciel', 'cieux'], ['cours', 'cours'],
  ['enfant', 'enfants'], ['fil', 'fils'], ['nouvel', 'nouveaux'],
  ['œil', 'yeux'], ['public', 'publics'], ['travail', 'travaux'],
])
const pluralInvariants = new Set(['bras', 'choix', 'cours', 'nez', 'prix', 'repas'])
const phraseBoundary = /^(?:(?:à|au|aux|avec|chez|contre|dans|de|des|du|en|par|pour|sans|sous|sur|vers)$|d[’'])/iu
const reviewedStoredReplacements = new Map([
  ['manger|des gâteaux', { text: 'un gâteau', anteposed: 'le gâteau', gender: 'masculin', number: 'singulier' }],
  ['manger|des petits pains', { text: 'de petits pains', anteposed: 'les petits pains', gender: 'masculin', number: 'pluriel' }],
  ['montrer|son dessin', { text: 'des croquis', anteposed: 'les croquis', gender: 'masculin', number: 'pluriel' }],
  ['regarder|des ciels', { text: 'les nuages', gender: 'masculin', number: 'pluriel' }],
  ['tirer|des petits chariots', { text: 'de petits chariots', anteposed: 'les petits chariots', gender: 'masculin', number: 'pluriel' }],
])

function pluralizeWord(word) {
  const match = word.match(/^([^A-Za-zÀ-ÖØ-öø-ÿŒœ]*)([A-Za-zÀ-ÖØ-öø-ÿŒœ-]+)(.*)$/u)
  if (!match) return word
  const [, prefix, lexical, suffix] = match
  const lower = lexical.toLocaleLowerCase('fr')
  if (pluralExceptions.has(lower)) return `${prefix}${pluralExceptions.get(lower)}${suffix}`
  if (pluralInvariants.has(lower) || /[sxz]$/iu.test(lexical)) return word
  if (/(?:eau|au|eu)$/iu.test(lexical)) return `${prefix}${lexical}x${suffix}`
  if (/al$/iu.test(lexical)) return `${prefix}${lexical.slice(0, -2)}aux${suffix}`
  return `${prefix}${lexical}s${suffix}`
}

function pluralizePhrase(value) {
  const words = value.split(/\s+/u)
  let inCore = true
  return words.map((word) => {
    if (phraseBoundary.test(word)) inCore = false
    if (!inCore) return word
    return word.split('-').map(pluralizeWord).join('-')
  }).join(' ')
}

function pluralDeterminerPhrase(determiner, pluralRest) {
  const adjectiveBeforeNoun = /^(?:beaux|bons|grands|jeunes|nouveaux|petits|vieux)\s+/iu.test(pluralRest)
  return determiner === 'des' && adjectiveBeforeNoun
    ? `de ${pluralRest}`
    : `${determiner} ${pluralRest}`
}

function pluralCandidates(value) {
  const text = String(value || '').replace(/\s+/gu, ' ').trim()
  const match = text.match(/^(?:un autre|un|le|ce|cet|mon|ton|son|notre|votre|leur|du|l[’'])\s*(.+)$/iu)
  if (!match?.[1]) return []
  const pluralRest = pluralizePhrase(match[1])
  return ['des', 'les', 'ces', 'mes', 'tes', 'ses', 'nos', 'vos', 'leurs', 'd’autres']
    .map(determiner => pluralDeterminerPhrase(determiner, pluralRest))
}

function isMasculineSingular(row) {
  if (String(row.nombre || '').toLocaleLowerCase('fr') === 'pluriel') return false
  if (['feminin', 'féminin'].includes(String(row.genre || '').toLocaleLowerCase('fr'))) return false
  if (String(row.genre || '').toLocaleLowerCase('fr') === 'masculin'
      && String(row.nombre || '').toLocaleLowerCase('fr') === 'singulier') return true
  return /^(?:un autre|un|le|ce|cet|mon|ton|son|du)\s+/iu.test(row.texte)
}

async function rebalanceMasculineSingularCod() {
  const [rows] = await database.execute(`
    SELECT c.id, c.construction_id, c.texte, c.genre, c.nombre, c.source,
      v.id AS verbe_id, v.infinitif
    FROM complements_verbaux c
    INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      AND cv.actif=1 AND cv.statut_validation='valide' AND cv.fonction_objet='cod'
    INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
    INNER JOIN verbes v ON v.id=vs.verbe_id AND v.est_archive=0
    WHERE c.actif=1 AND c.statut_validation='valide'
    ORDER BY v.id, (c.source=?) DESC, c.id
  `, [SOURCE])

  for (const row of rows) {
    const replacement = reviewedStoredReplacements.get(
      `${row.infinitif}|${String(row.texte).toLocaleLowerCase('fr')}`,
    )
    if (!replacement) continue
    await database.execute(`
      UPDATE complements_verbaux
      SET texte=?, texte_antepose=?, genre=?, nombre=?
      WHERE id=?
    `, [replacement.text, replacement.anteposed ?? replacement.text,
      replacement.gender, replacement.number, row.id])
    row.texte = replacement.text
    row.genre = replacement.gender
    row.nombre = replacement.number
  }

  const byVerb = new Map()
  for (const row of rows) {
    const entries = byVerb.get(row.verbe_id) || []
    entries.push(row)
    byVerb.set(row.verbe_id, entries)
  }

  for (const entries of byVerb.values()) {
    const allowedMasculineSingular = Math.floor(entries.length * 0.2)
    const masculineRows = entries.filter(isMasculineSingular)
    const existingByConstruction = new Map()
    for (const row of entries) {
      const texts = existingByConstruction.get(row.construction_id) || new Set()
      texts.add(String(row.texte).toLocaleLowerCase('fr'))
      existingByConstruction.set(row.construction_id, texts)
    }

    for (const row of masculineRows.slice(allowedMasculineSingular)) {
      const existing = existingByConstruction.get(row.construction_id)
      const replacement = pluralCandidates(row.texte)
        .find(candidate => !existing.has(candidate.toLocaleLowerCase('fr')))
      if (!replacement) {
        throw new Error(`Impossible de pluraliser sans doublon : ${row.infinitif} — ${row.texte}`)
      }
      const pluralCore = replacement.replace(/^\S+\s+/u, '')
      await database.execute(`
        UPDATE complements_verbaux
        SET texte=?, texte_antepose=?, genre='masculin', nombre='pluriel'
        WHERE id=?
      `, [replacement, `les ${pluralCore}`, row.id])
      existing.delete(String(row.texte).toLocaleLowerCase('fr'))
      existing.add(replacement.toLocaleLowerCase('fr'))
    }
  }
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
  const selectedDeterminers = kind === 'm'
    ? ['un', 'le', ...masculinePluralDeterminers]
    : determiners[kind]
  return selectedDeterminers.map((determiner, index) => {
    const pluralizedMasculine = kind === 'm' && index >= 2
    const variantRest = pluralizedMasculine ? pluralizePhrase(rest) : rest
    const firstWord = rest.split(/\s+/u)[0].toLocaleLowerCase('fr')
    const beginsWithVowel = /^[aeiouyàâäéèêëîïôöùûü]/iu.test(rest)
      || new Set(['habit', 'héritage', 'histoire', 'homme']).has(firstWord)
    if (kind === 'f' && beginsWithVowel) {
      if (determiner === 'ma') determiner = 'mon'
      if (determiner === 'ta') determiner = 'ton'
      if (determiner === 'sa') determiner = 'son'
    }
    if (beginsWithVowel && (determiner === 'le' || determiner === 'la')) determiner = 'l’'
    if (beginsWithVowel && determiner === 'ce') determiner = 'cet'
    const phrase = determiner === 'l’'
      ? `l’${variantRest}`
      : pluralizedMasculine
        ? pluralDeterminerPhrase(determiner, variantRest)
        : `${determiner} ${variantRest}`
    let text = phrase
    if (preposition === 'à' && determiner === 'le') text = `au ${variantRest}`
    else if (preposition === 'à' && determiner === 'les') text = `aux ${variantRest}`
    else if (preposition === 'de' && determiner === 'le') text = `du ${variantRest}`
    else if (preposition === 'de' && determiner === 'les') text = `des ${variantRest}`
    else if (preposition === 'de' && determiner === 'un') text = `d’un ${variantRest}`
    else if (preposition === 'de' && determiner === 'une') text = `d’une ${variantRest}`
    else if (preposition === 'de' && determiner === 'un autre') text = `d’un autre ${variantRest}`
    else if (preposition === 'de' && determiner === 'une autre') text = `d’une autre ${variantRest}`
    else if (preposition === 'de' && determiner === 'd’autres') text = `d’autres ${variantRest}`
    else if (preposition && determiner === 'l’') text = `${preposition} l’${variantRest}`
    else if (preposition) text = `${preposition} ${phrase}`
    const inferred = !preposition ? inferAnteposedComplement(text) : null
    return {
      text,
      gender: kind === 'f' ? 'feminin' : kind === 'm' ? 'masculin' : inferred?.gender ?? null,
      number: kind === 'p' || pluralizedMasculine ? 'pluriel' : 'singulier',
    }
  })
}

function catalogVariants(seeds, preposition = null, limit = 10) {
  const choices = []
  const matrices = seeds.map(seed => variants(seed, preposition))
  for (let variantIndex = 0; variantIndex < 10; variantIndex += 1) {
    for (const values of matrices) {
      const variant = values[variantIndex]
      if (!choices.some(choice => choice.text === variant.text)) choices.push(variant)
      if (choices.length === limit) return choices
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
const missingDirectSeeds = []
for (const article of report.results) {
  if (article.error || !article.direct || excludedDirect.has(article.infinitive)) continue
  const safeSeed = reviewedDirect[article.infinitive]
    || childSafeDirect[article.infinitive]
    || directSeeds[article.infinitive]
  const seeds = safeSeed ? (Array.isArray(safeSeed) ? safeSeed : [safeSeed]) : extractedSeeds(article)
  if (!seeds.length) {
    missingDirectSeeds.push(article.infinitive)
    continue
  }
  directCatalog.set(article.infinitive, {
    seeds,
    sourceUrl: article.url,
    limit: article.infinitive === 'manger' ? 15 : 10,
  })
}
if (missingDirectSeeds.length) {
  throw new Error(`Aucun COD sûr pour : ${missingDirectSeeds.join(', ')}`)
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

async function equip(infinitive, type, seeds, preposition, sourceUrl, limit = 10, reviewedComplements = null) {
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
  const complementVariants = reviewedComplements
    ? reviewedComplements.map(text => ({ text, gender: null, number: null }))
    : catalogVariants(seeds, preposition, limit)
  if (complementVariants.length < limit) {
    throw new Error(`${infinitive} : ${complementVariants.length} compléments valides sur ${limit} attendus`)
  }
  for (const variant of complementVariants.slice(0, limit)) {
    const text = variant.text
    const placement = type === 'cod' && variant.gender
      ? {
          text: variant.number === 'pluriel'
            ? text.replace(/^(?:de|des|ces|mes|tes|ses|nos|vos|leurs)\s+/iu, 'les ')
            : inferAnteposedComplement(text)?.text ?? null,
          gender: variant.gender,
          number: variant.number,
        }
      : null
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
    `, [constructionId, text, placement?.text ?? null,
      type === 'cod' ? variant.gender : null,
      type === 'cod' ? variant.number : null,
      type === 'cod' ? 'objet-atteste' : 'complement-indirect-atteste',
      SOURCE, sourceUrl])
  }
}

await database.beginTransaction()
try {
  await database.execute('UPDATE complements_verbaux SET actif=0 WHERE source IN (?, ?)', [OBSOLETE_SOURCE, SOURCE])
  for (const [infinitive, entry] of directCatalog) {
    await equip(infinitive, 'cod', entry.seeds, null, entry.sourceUrl, entry.limit)
  }
  for (const [infinitive, [preposition, seed]] of Object.entries(indirectSeeds)) {
    const article = report.results.find(item => item.infinitive === infinitive)
    await equip(infinitive, 'coi', [seed], preposition, article?.url ?? null, 10,
      reviewedIndirectComplements[infinitive] ?? null)
  }
  await rebalanceMasculineSingularCod()
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
