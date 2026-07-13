import mysql from 'mysql2/promise'
import {
  canonicalInfinitives,
  cifVerbSeeds,
  difficultVerbSeeds,
  rareVerbSeeds,
  schoolVerbSeeds,
  semanticDomains,
  semanticVerbSeeds,
} from '../shared/data/verb-classification-seeds.ts'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const normalize = value => value.trim().toLocaleLowerCase('fr').normalize('NFC')
const searchable = value => normalize(value).normalize('NFD').replace(/\p{Diacritic}/gu, '')
const bareInfinitive = value => normalize(value).replace(/^se\s+/u, '').replace(/^s['’]/u, '')
const sets = object => Object.fromEntries(Object.entries(object).map(([key, values]) => [key, new Set(values.map(normalize))]))
const schoolSets = sets(schoolVerbSeeds)
const cifSets = sets(cifVerbSeeds)
const semanticSets = sets(semanticVerbSeeds)
const rare = new Set(rareVerbSeeds.map(normalize))
const difficult = new Set(difficultVerbSeeds.map(normalize))

const [initialColumns] = await database.query('SHOW COLUMNS FROM verbes')
const knownColumns = new Set(initialColumns.map(column => column.Field))
async function addColumn(name, definition) {
  if (knownColumns.has(name)) return
  await database.query(`ALTER TABLE verbes ADD COLUMN \`${name}\` ${definition}`)
  knownColumns.add(name)
}

await database.query(`
  CREATE TABLE IF NOT EXISTS familles_conjugaison (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(120) NOT NULL,
    description VARCHAR(500) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)
await database.query(`
  CREATE TABLE IF NOT EXISTS categories_semantiques (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(120) NOT NULL,
    parent_id INT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_semantic_parent FOREIGN KEY (parent_id) REFERENCES categories_semantiques(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)
await database.query(`
  CREATE TABLE IF NOT EXISTS verbe_sens (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    verbe_id INT NOT NULL,
    numero_sens SMALLINT NOT NULL DEFAULT 1,
    intitule VARCHAR(255) NOT NULL,
    definition TEXT NULL,
    construction VARCHAR(120) NULL,
    transitivite VARCHAR(32) NOT NULL DEFAULT 'indeterminee',
    preposition VARCHAR(32) NULL,
    auxiliaire VARCHAR(12) NULL,
    registre VARCHAR(32) NOT NULL DEFAULT 'courant',
    est_pronominal TINYINT(1) NOT NULL DEFAULT 0,
    est_principal TINYINT(1) NOT NULL DEFAULT 0,
    source VARCHAR(32) NOT NULL DEFAULT 'migration',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_verbe_sens (verbe_id, numero_sens),
    KEY idx_sens_verbe (verbe_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)
await database.query(`
  CREATE TABLE IF NOT EXISTS verbe_sens_categories (
    sens_id INT NOT NULL,
    categorie_id INT NOT NULL,
    PRIMARY KEY (sens_id, categorie_id),
    CONSTRAINT fk_vsc_sens FOREIGN KEY (sens_id) REFERENCES verbe_sens(id) ON DELETE CASCADE,
    CONSTRAINT fk_vsc_categorie FOREIGN KEY (categorie_id) REFERENCES categories_semantiques(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)

await addColumn('groupe_conjugaison', 'TINYINT UNSIGNED NULL')
await addColumn('famille_conjugaison_id', 'INT NULL')
await addColumn('terminaison_infinitif', 'VARCHAR(12) NULL')
await addColumn('type_pronominal', "VARCHAR(16) NOT NULL DEFAULT 'aucun'")
await addColumn('est_impersonnel', 'TINYINT(1) NOT NULL DEFAULT 0')
await addColumn('est_defectif', 'TINYINT(1) NOT NULL DEFAULT 0')
await addColumn('personnes_disponibles', 'JSON NULL')
await addColumn('type_h_initial', 'VARCHAR(8) NULL')
await addColumn('niveau_difficulte', 'TINYINT UNSIGNED NULL')
await addColumn('niveau_cecrl', 'VARCHAR(2) NULL')
await addColumn('rang_frequence', 'INT UNSIGNED NULL')
await addColumn('registre_principal', "VARCHAR(24) NOT NULL DEFAULT 'courant'")
await addColumn('forme_canonique', 'VARCHAR(255) NULL')
await addColumn('statut_validation', "VARCHAR(16) NOT NULL DEFAULT 'genere'")
await addColumn('particularites', 'JSON NULL')
await addColumn('niveaux_scolaires', 'JSON NULL')
await addColumn('parcours_cif', 'JSON NULL')

const families = [
  ['er-regulier', 'Premier groupe régulier'], ['ger', 'Verbes en -ger'], ['cer', 'Verbes en -cer'],
  ['yer', 'Verbes en -yer'], ['eler-eter', 'Verbes en -eler ou -eter'], ['er-alternance', 'Premier groupe à alternance du radical'],
  ['ir-issant', 'Deuxième groupe en -issant'], ['venir-tenir', 'Famille de venir et tenir'], ['prendre', 'Famille de prendre'],
  ['mettre-battre', 'Familles de mettre et battre'], ['voir-recevoir', 'Familles de voir et recevoir'],
  ['ouvrir-cueillir', 'Familles d’ouvrir et cueillir'], ['dre-tre', 'Troisième groupe en -dre ou -tre'], ['troisieme-ir', 'Troisième groupe en -ir'],
  ['troisieme-oir', 'Troisième groupe en -oir'], ['irregulier', 'Autre famille irrégulière'],
]
for (const [slug, label] of families) {
  await database.execute('INSERT INTO familles_conjugaison (slug, label) VALUES (?, ?) ON DUPLICATE KEY UPDATE label = VALUES(label)', [slug, label])
}
for (const [index, [slug, label]] of semanticDomains.entries()) {
  await database.execute('INSERT INTO categories_semantiques (slug, label, sort_order) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order)', [slug, label, index + 1])
}

const [familyRows] = await database.execute('SELECT id, slug FROM familles_conjugaison')
const familyIds = new Map(familyRows.map(row => [row.slug, Number(row.id)]))
const [categoryRows] = await database.execute('SELECT id, slug FROM categories_semantiques')
const categoryIds = new Map(categoryRows.map(row => [row.slug, Number(row.id)]))
const [verbs] = await database.execute('SELECT id, infinitif, `participe_présent` AS participe_present, auxiliaire FROM verbes ORDER BY id')
const infinitives = new Set(verbs.map(row => normalize(row.infinitif)))
const [personRows] = await database.execute(`
  SELECT vc.verbe_id, vc.personne_id
  FROM verbesconjugues vc
  INNER JOIN temps t ON t.id = vc.temp_id
  INNER JOIN modes m ON m.id = t.mode_id
  WHERE m.name = 'indicatif' AND t.name = 'présent' AND vc.conjugaison1 <> ''
`)
const personsByVerb = new Map()
for (const row of personRows) {
  const ids = personsByVerb.get(Number(row.verbe_id)) ?? []
  if (!ids.includes(Number(row.personne_id))) ids.push(Number(row.personne_id))
  personsByVerb.set(Number(row.verbe_id), ids)
}
const [alternativeRows] = await database.execute("SELECT DISTINCT verbe_id FROM verbesconjugues WHERE conjugaison2 <> '' OR conjugaison3 <> ''")
const verbsWithAlternatives = new Set(alternativeRows.map(row => Number(row.verbe_id)))

function ending(base) {
  if (base.endsWith('oir')) return 'oir'
  if (base.endsWith('er')) return 'er'
  if (base.endsWith('ir')) return 'ir'
  if (base.endsWith('re')) return 're'
  return 'autre'
}

function conjugationGroup(base, presentParticiple) {
  if (base.endsWith('er') && base !== 'aller') return 1
  if (base.endsWith('ir') && searchable(presentParticiple).replace(/^se\s+|^s['’]/u, '').endsWith('issant')) return 2
  return 3
}

function family(base, group) {
  if (group === 1) {
    if (base.endsWith('ger')) return 'ger'
    if (base.endsWith('cer')) return 'cer'
    if (base.endsWith('yer')) return 'yer'
    if (/(eler|eter)$/u.test(base)) return 'eler-eter'
    if (/[éèe][^aeiouy]{0,2}er$/u.test(base)) return 'er-alternance'
    return 'er-regulier'
  }
  if (group === 2) return 'ir-issant'
  if (/(venir|tenir)$/u.test(base)) return 'venir-tenir'
  if (base.endsWith('prendre')) return 'prendre'
  if (/(mettre|battre)$/u.test(base)) return 'mettre-battre'
  if (/(voir|cevoir)$/u.test(base)) return 'voir-recevoir'
  if (/(ouvrir|offrir|souffrir|cueillir)$/u.test(base)) return 'ouvrir-cueillir'
  if (/(dre|tre)$/u.test(base)) return 'dre-tre'
  if (base.endsWith('oir')) return 'troisieme-oir'
  if (base.endsWith('ir')) return 'troisieme-ir'
  return 'irregulier'
}

function semanticCategories(infinitive, base) {
  const found = []
  for (const [slug, values] of Object.entries(semanticSets)) {
    if (values.has(infinitive) || values.has(base)) found.push(slug)
  }
  return found.length ? found : ['action-processus']
}

function tagsFor(setsByTag, infinitive) {
  return Object.entries(setsByTag).filter(([, values]) => values.has(infinitive)).map(([tag]) => tag)
}

const aspiratedH = new Set(['haïr', 'hacher', 'hâter', 'hausser', 'heurter', 'hisser', 'huer'])
const variableAuxiliary = new Set(['descendre', 'entrer', 'monter', 'passer', 'rentrer', 'retourner', 'sortir'])
const cefrBySchool = { '5P': 'A1', '6P': 'A1', '7H': 'A2', '8H': 'A2', '9H': 'B1', '10H': 'B2', '11H': 'B2' }

await database.beginTransaction()
try {
  for (const verb of verbs) {
    const infinitive = normalize(verb.infinitif)
    const base = bareInfinitive(infinitive)
    const isPronominal = infinitive !== base
    const group = conjugationGroup(base, verb.participe_present)
    const familySlug = family(base, group)
    const persons = (personsByVerb.get(Number(verb.id)) ?? []).sort((a, b) => a - b)
    const levels = tagsFor(schoolSets, infinitive)
    const cif = tagsFor(cifSets, infinitive)
    const features = []
    if (base.endsWith('ger')) features.push('ger')
    if (base.endsWith('cer')) features.push('cer')
    if (isPronominal) features.push('pronominal')
    if (verbsWithAlternatives.has(Number(verb.id))) features.push('formes-alternatives')
    if (persons.length > 0 && persons.length < 6) features.push('defectif')
    if (persons.length === 0) features.push('donnees-incompletes')
    if (variableAuxiliary.has(base)) features.push('auxiliaire-variable')
    const difficulty = difficult.has(infinitive) ? 3 : (group === 3 || features.length ? 2 : 1)
    const typePronominal = !isPronominal ? 'aucun' : infinitives.has(base) ? 'occasionnel' : 'essentiel'
    const hType = base.startsWith('h') ? (aspiratedH.has(base) ? 'aspire' : 'muet') : null
    const canonical = canonicalInfinitives[infinitive] ?? infinitive
    const level = levels.map(item => cefrBySchool[item]).find(Boolean) ?? null
    const register = rare.has(infinitive) ? 'rare' : 'courant'

    await database.execute(`
      UPDATE verbes SET groupe_conjugaison = ?, famille_conjugaison_id = ?, terminaison_infinitif = ?,
        type_pronominal = ?, est_impersonnel = ?, est_defectif = ?, personnes_disponibles = ?, type_h_initial = ?,
        niveau_difficulte = ?, niveau_cecrl = ?, registre_principal = ?, forme_canonique = ?,
        statut_validation = ?, particularites = ?, niveaux_scolaires = ?, parcours_cif = ?
      WHERE id = ?
    `, [group, familyIds.get(familySlug), ending(base), typePronominal, ['falloir', 'pleuvoir'].includes(base) ? 1 : 0,
      persons.length > 0 && persons.length < 6 ? 1 : 0, JSON.stringify(persons), hType, difficulty, level, register, canonical,
      canonical === infinitive && persons.length > 0 ? 'genere' : 'a_verifier', JSON.stringify(features), JSON.stringify(levels), JSON.stringify(cif), verb.id])

    const [existingSenses] = await database.execute('SELECT id FROM verbe_sens WHERE verbe_id = ? ORDER BY numero_sens LIMIT 1', [verb.id])
    let senseId = Number(existingSenses[0]?.id)
    if (!senseId) {
      const [result] = await database.execute(`
        INSERT INTO verbe_sens (verbe_id, numero_sens, intitule, auxiliaire, registre, est_pronominal, est_principal, sort_order)
        VALUES (?, 1, ?, ?, ?, ?, 1, 1)
      `, [verb.id, `Sens principal de « ${canonical} »`, verb.auxiliaire, register, isPronominal ? 1 : 0])
      senseId = Number(result.insertId)
    }
    for (const slug of semanticCategories(infinitive, base)) {
      await database.execute('INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id) VALUES (?, ?)', [senseId, categoryIds.get(slug)])
    }
  }
  await database.commit()
} catch (error) {
  await database.rollback()
  throw error
}

const polysemous = {
  voler: [
    ['Se déplacer dans les airs', 'intransitif', 'avoir', 'mouvement'],
    ['Dérober quelque chose', 'transitif_direct', 'avoir', 'echange'],
  ],
  monter: [
    ['Se déplacer vers le haut', 'intransitif', 'être', 'mouvement'],
    ['Transporter ou assembler quelque chose', 'transitif_direct', 'avoir', 'manipulation'],
  ],
  sortir: [
    ['Quitter un lieu', 'intransitif', 'être', 'mouvement'],
    ['Faire sortir quelque chose', 'transitif_direct', 'avoir', 'manipulation'],
  ],
  passer: [
    ['Se déplacer par un lieu', 'intransitif', 'être', 'mouvement'],
    ['Effectuer ou transmettre quelque chose', 'transitif_direct', 'avoir', 'action-processus'],
  ],
  penser: [
    ['Former ou examiner une idée', 'intransitif', 'avoir', 'cognition'],
    ['Avoir quelqu’un ou quelque chose à l’esprit', 'transitif_indirect', 'avoir', 'cognition'],
  ],
}
for (const [infinitive, senses] of Object.entries(polysemous)) {
  const verb = verbs.find(row => normalize(row.infinitif) === infinitive)
  if (!verb) continue
  for (const [index, [title, transitivity, auxiliary, category]] of senses.entries()) {
    const number = index + 1
    await database.execute(`
      INSERT INTO verbe_sens (verbe_id, numero_sens, intitule, transitivite, auxiliaire, est_principal, sort_order, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'manuel')
      ON DUPLICATE KEY UPDATE intitule = VALUES(intitule), transitivite = VALUES(transitivite), auxiliaire = VALUES(auxiliaire), source = 'manuel'
    `, [verb.id, number, title, transitivity, auxiliary, number === 1 ? 1 : 0, number])
    const [senseRows] = await database.execute('SELECT id FROM verbe_sens WHERE verbe_id = ? AND numero_sens = ?', [verb.id, number])
    await database.execute('INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id) VALUES (?, ?)', [senseRows[0].id, categoryIds.get(category)])
  }
}

const [summary] = await database.execute(`
  SELECT COUNT(*) AS verbes,
    SUM(groupe_conjugaison = 1) AS groupe1,
    SUM(groupe_conjugaison = 2) AS groupe2,
    SUM(groupe_conjugaison = 3) AS groupe3,
    SUM(type_pronominal <> 'aucun') AS pronominaux,
    SUM(est_defectif = 1) AS defectifs
  FROM verbes
`)
console.log(JSON.stringify({ ok: true, ...summary[0] }, null, 2))
await database.end()
