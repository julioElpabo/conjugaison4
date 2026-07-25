import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'

import mysql from 'mysql2/promise'

import {
  verbPilot202601,
} from '../shared/data/verb-pilot-2026-01.mjs'
import {
  verbPilot202601Part02,
} from '../shared/data/verb-pilot-2026-01-part-02.mjs'
import {
  verbPilot202601Part03,
} from '../shared/data/verb-pilot-2026-01-part-03.mjs'
import {
  verbPilot202601Part04,
} from '../shared/data/verb-pilot-2026-01-part-04.mjs'
import {
  verbPilot202601Part05,
} from '../shared/data/verb-pilot-2026-01-part-05.mjs'
import {
  validatePedagogicalPilot,
  validatedComplementGrammar,
} from './validate-verb-pilot-pedagogy.mjs'

const PERSON = {
  'singular|firstPerson': 4,
  'singular|secondPerson': 5,
  'singular|thirdPerson': 6,
  'plural|firstPerson': 7,
  'plural|secondPerson': 8,
  'plural|thirdPerson': 9,
}
const SIMPLE_TENSES = [
  [1, 'indicative', 'present'],
  [2, 'indicative', 'imperfect'],
  [3, 'indicative', 'future'],
  [4, 'indicative', 'simplePast'],
  [9, 'imperative', 'present'],
  [10, 'subjunctive', 'present'],
  [14, 'conditional', 'present'],
  [16, 'subjunctive', 'imperfect'],
]
const COMPOUND_TENSES = new Map([
  [5, 1],
  [6, 3],
  [7, 2],
  [8, 4],
  [11, 10],
  [15, 14],
  [17, 16],
  [18, 9],
  [19, 16],
])
const IMPERATIVE_PERSONS = new Map([
  [5, ['singular', 'secondPerson']],
  [7, ['plural', 'firstPerson']],
  [8, ['plural', 'secondPerson']],
])
const PEDAGOGICAL_ENTRIES = [
  ...verbPilot202601,
  ...verbPilot202601Part02,
  ...verbPilot202601Part03,
  ...verbPilot202601Part04,
  ...verbPilot202601Part05,
]
const PEDAGOGY_BY_INFINITIVE = new Map(
  PEDAGOGICAL_ENTRIES.map(entry => [entry.infinitive, entry]),
)
const PILOT_SOURCE = 'pilot-2026-01'
const BACKUP_TABLES = {
  verbs: 'backup_verbes_vfp202601',
  conjugations: 'backup_verbesconjugues_vfp202601',
}

function option(name, fallback = '') {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) || fallback
}

function values(candidate, key) {
  return (candidate.forms[key] || []).slice(0, 3)
}

function personMorphology(personId) {
  return Object.entries(PERSON).find(([, id]) => id === personId)?.[0].split('|') || []
}

export function simpleForms(candidate, mode, tense, personId) {
  let number
  let person
  if (mode === 'imperative') {
    [number, person] = IMPERATIVE_PERSONS.get(personId) || []
    if (!number) return []
  }
  else {
    [number, person] = personMorphology(personId)
  }
  return values(candidate, `${mode}|${tense}|${number}|${person}|-`)
}

export function pastParticiples(candidate, personId) {
  const [number] = personMorphology(personId)
  return values(candidate, `participle|past|${number}|-|masculine`)
}

function databaseConfig() {
  const config = {
    host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
    port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
    database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
    user: process.env.DB_USER || process.env.NUXT_DB_USER,
    password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
  }
  if (!config.host || !config.database || !config.user) {
    throw new Error(
      'Configuration MySQL absente (DB_* ou NUXT_DB_*). '
      + 'Dans Plesk, ne lancez pas cette commande avec « Run script » : '
      + 'redémarrez l’application, le plugin serveur appliquera le lot avec la configuration Nitro.',
    )
  }
  return config
}

function json(value) {
  if (value === null || value === undefined) return null
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function group(candidate) {
  const match = candidate.groupDescription?.match(/^(\d)/u)
  return Number(match?.[1] || (candidate.lemma.endsWith('er') ? 1 : 3))
}

function fallbackModel(candidate) {
  if (candidate.model) return candidate.model.toLocaleLowerCase('fr')
  if (candidate.family.includes('voir')) return 'voir'
  if (candidate.family.includes('dre')) return 'attendre'
  if (group(candidate) === 1) return 'aimer'
  if (group(candidate) === 2) return 'finir'
  throw new Error(`Modèle absent pour « ${candidate.lemma} ».`)
}

function ending(lemma) {
  if (lemma.endsWith('oir')) return 'oir'
  if (lemma.endsWith('er')) return 'er'
  if (lemma.endsWith('ir')) return 'ir'
  if (lemma.endsWith('re')) return 're'
  return 'autre'
}

function difficulty(candidate) {
  if (candidate.difficulty === 'faible') return 1
  if (candidate.difficulty === 'moyenne') return 2
  return 3
}

async function modelRows(connection, candidates) {
  const names = [...new Set(candidates.map(fallbackModel))]
  const placeholders = names.map(() => '?').join(', ')
  const [rows] = await connection.execute(
    `SELECT * FROM verbes WHERE LOWER(infinitif) IN (${placeholders}) ORDER BY id`,
    names,
  )
  const byName = new Map(rows.map(row => [row.infinitif.toLocaleLowerCase('fr'), row]))
  const missing = names.filter(name => !byName.has(name))
  if (missing.length) throw new Error(`Modèles absents : ${missing.join(', ')}.`)
  return byName
}

async function auxiliaryForms(connection) {
  const [rows] = await connection.execute(`
    SELECT v.infinitif, vc.personne_id, vc.temp_id,
           vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
    FROM verbes v
    INNER JOIN verbesconjugues vc ON vc.verbe_id=v.id
    WHERE v.infinitif IN ('avoir', 'être')
  `)
  return new Map(rows.map(row => [
    `${row.infinitif}|${row.temp_id}|${row.personne_id}`,
    [row.conjugaison1, row.conjugaison2, row.conjugaison3].filter(Boolean),
  ]))
}

function compoundForms(candidate, auxiliaryBySlot, targetTense, personId) {
  const sourceTense = COMPOUND_TENSES.get(targetTense)
  const auxiliary = candidate.auxiliary || 'avoir'
  if (!['avoir', 'être'].includes(auxiliary)) {
    throw new Error(`Auxiliaire non univoque pour « ${candidate.lemma} » : ${auxiliary}.`)
  }
  const auxiliaries = auxiliaryBySlot.get(`${auxiliary}|${sourceTense}|${personId}`) || []
  if (!auxiliaries.length) return []
  const participles = auxiliary === 'être'
    ? pastParticiples(candidate, personId)
    : values(candidate, 'participle|past|singular|-|masculine')
  return [...new Set(auxiliaries.flatMap(aux => participles.map(participle => `${aux} ${participle}`)))].slice(0, 3)
}

async function insertCandidate(
  connection,
  candidate,
  model,
  auxiliaryBySlot,
  tables,
  pedagogy,
  frequencyRank,
) {
  const presentParticiple = values(candidate, 'participle|present|-|-|-')[0]
  const pastParticiple = values(candidate, 'participle|past|singular|-|masculine')[0]
  if (!presentParticiple || !pastParticiple) {
    throw new Error(`Participes incomplets pour « ${candidate.lemma} ».`)
  }
  const [result] = await connection.execute(`
    INSERT INTO ${tables.verbs} (
      infinitif, \`participe_présent\`, \`participe_passé\`, auxiliaire,
      groupe_conjugaison, famille_conjugaison_id, terminaison_infinitif,
      type_pronominal, est_impersonnel, est_defectif, personnes_disponibles,
      type_h_initial, niveau_difficulte, niveau_cecrl, rang_frequence,
      registre_principal, forme_canonique, statut_validation, particularites,
      niveaux_scolaires, parcours_cif, pronominalisable, est_archive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'aucun', 0, 0, ?, ?, ?, ?, ?,
              'courant', ?, ?, ?, ?, ?, ?, 0)
  `, [
    candidate.lemma,
    presentParticiple,
    pastParticiple,
    candidate.auxiliary || 'avoir',
    group(candidate),
    model.famille_conjugaison_id,
    ending(candidate.lemma),
    json([4, 5, 6, 7, 8, 9]),
    model.type_h_initial,
    difficulty(candidate),
    pedagogy?.cefr || null,
    frequencyRank,
    candidate.lemma,
    pedagogy ? 'valide' : 'a_verifier',
    json([
      'source:lexique4',
      'formes:morphalou-3.1',
      'validation:academie-9e',
      ...(pedagogy ? [`pedagogie:${PILOT_SOURCE}`] : []),
    ]),
    json(pedagogy?.schoolLevels || []),
    json([]),
    pedagogy?.pronominalUse ? 1 : 0,
  ])
  const verbId = Number(result.insertId)
  let insertedForms = 0
  for (const [tempId, mode, tense] of SIMPLE_TENSES) {
    for (const personId of Object.values(PERSON)) {
      const forms = simpleForms(candidate, mode, tense, personId)
      await connection.execute(`
        INSERT INTO ${tables.conjugations}
          (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [verbId, candidate.lemma, personId, tempId, forms[0] || '', forms[1] || '', forms[2] || ''])
      insertedForms += 1
    }
  }
  for (const tempId of COMPOUND_TENSES.keys()) {
    for (const personId of Object.values(PERSON)) {
      const forms = compoundForms(candidate, auxiliaryBySlot, tempId, personId)
      await connection.execute(`
        INSERT INTO ${tables.conjugations}
          (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [verbId, candidate.lemma, personId, tempId, forms[0] || '', forms[1] || '', forms[2] || ''])
      insertedForms += 1
    }
  }
  if (insertedForms !== 102) {
    throw new Error(`Nombre de lignes inattendu pour « ${candidate.lemma} » : ${insertedForms}.`)
  }
  return { insertedForms, verbId }
}

async function insertPedagogy(connection, tables, verbId, candidate, pedagogy) {
  const [senseResult] = await connection.execute(`
    INSERT INTO ${tables.senses}
      (verbe_id, numero_sens, intitule, definition, construction, transitivite,
       preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
    VALUES (?, 1, ?, ?, ?, ?, ?, ?, 'courant', 0, 1, 'pilot-2026-01', 1)
  `, [
    verbId,
    pedagogy.sense.title,
    pedagogy.definition,
    pedagogy.sense.construction,
    pedagogy.sense.transitivity,
    pedagogy.sense.preposition || null,
    candidate.auxiliary || 'avoir',
  ])
  const senseId = Number(senseResult.insertId)
  const [categoryResult] = await connection.execute(`
    INSERT INTO ${tables.senseCategories} (sens_id, categorie_id)
    SELECT ?, id FROM categories_semantiques WHERE slug=?
  `, [senseId, pedagogy.semanticDomain])
  if (Number(categoryResult.affectedRows) !== 1) {
    throw new Error(
      `Catégorie sémantique introuvable pour « ${pedagogy.infinitive} » : `
      + `${pedagogy.semanticDomain}.`,
    )
  }
  if (!pedagogy.sense.complementType) {
    return {
      senses: 1,
      categoryLinks: 1,
      constructions: 0,
      complements: 0,
      anteposable: 0,
    }
  }
  const code = `${pedagogy.sense.complementType}-postpose`
  const [constructionResult] = await connection.execute(`
    INSERT INTO ${tables.constructions}
      (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
       source, source_url, statut_validation, actif)
    VALUES (?, ?, ?, ?, ?, 0, 'pilot-2026-01', ?, 'valide', 1)
  `, [
    senseId,
    code,
    pedagogy.sense.complementType,
    pedagogy.sense.preposition || null,
    pedagogy.sense.construction,
    pedagogy.sourceUrl,
  ])
  const constructionId = Number(constructionResult.insertId)
  for (const complement of pedagogy.sense.complements) {
    const grammar = pedagogy.sense.complementType === 'cod'
      ? validatedComplementGrammar(complement)
      : null
    await connection.execute(`
      INSERT INTO ${tables.complements}
        (construction_id, texte, texte_antepose, genre, nombre,
         classe_semantique, niveau_cecrl, poids,
         source, source_url, statut_validation, actif)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'pilot-2026-01', ?, 'valide', 1)
    `, [
      constructionId,
      complement,
      grammar?.text || null,
      grammar?.gender || null,
      grammar?.number || null,
      pedagogy.sense.semanticClass,
      pedagogy.cefr,
      pedagogy.sourceUrl,
    ])
  }
  return {
    senses: 1,
    categoryLinks: 1,
    constructions: 1,
    complements: pedagogy.sense.complements.length,
    anteposable: pedagogy.sense.complementType === 'cod'
      ? pedagogy.sense.complements.length
      : 0,
  }
}

async function addMissingPilotCategoryLinks(connection) {
  await connection.beginTransaction()
  try {
    let inserted = 0
    for (const pedagogy of PEDAGOGICAL_ENTRIES) {
      const [result] = await connection.execute(`
        INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id)
        SELECT s.id, c.id
        FROM verbe_sens s
        INNER JOIN verbes v ON v.id=s.verbe_id
        INNER JOIN categories_semantiques c ON c.slug=?
        WHERE v.infinitif=? AND s.source=?
      `, [pedagogy.semanticDomain, pedagogy.infinitive, PILOT_SOURCE])
      inserted += Number(result.affectedRows)
    }
    await connection.commit()
    return inserted
  }
  catch (error) {
    await connection.rollback()
    throw error
  }
}

async function insertPronominalUse(connection, table, verbId, pedagogy) {
  const use = pedagogy.pronominalUse
  if (!use) return 0
  await connection.execute(`
    INSERT INTO ${table}
      (verbe_id, legacy_verbe_id, infinitif_pronominal, type_emploi,
       fonction_pronom, regle_accord, preposition, personnes_autorisees,
       source, source_url, statut_validation, actif)
    VALUES (?, NULL, ?, ?, ?, ?, NULL, ?, ?, ?, 'valide', 1)
  `, [
    verbId,
    use.infinitive.replaceAll('’', "'"),
    use.type,
    use.pronounFunction,
    use.agreementRule === 'sans_accord' ? 'invariable' : use.agreementRule,
    json(use.allowedPersons),
    PILOT_SOURCE,
    pedagogy.sourceUrl,
  ])
  return 1
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.execute(`
    SELECT COUNT(*) AS count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?
  `, [tableName])
  return Number(rows[0]?.count || 0) === 1
}

async function createMyisamBackups(connection) {
  for (const backup of Object.values(BACKUP_TABLES)) {
    if (await tableExists(connection, backup)) {
      throw new Error(
        `La sauvegarde ${backup} existe déjà. Contrôlez l’état du lot avant toute application.`,
      )
    }
  }
  await connection.query(`CREATE TABLE ${BACKUP_TABLES.verbs} LIKE verbes`)
  await connection.query(`INSERT INTO ${BACKUP_TABLES.verbs} SELECT * FROM verbes`)
  await connection.query(
    `CREATE TABLE ${BACKUP_TABLES.conjugations} LIKE verbesconjugues`,
  )
  await connection.query(
    `INSERT INTO ${BACKUP_TABLES.conjugations} SELECT * FROM verbesconjugues`,
  )
}

async function restoreMyisamBackups(connection) {
  if (!await tableExists(connection, BACKUP_TABLES.verbs)
    || !await tableExists(connection, BACKUP_TABLES.conjugations)) {
    throw new Error('Sauvegardes MyISAM incomplètes : restauration automatique impossible.')
  }
  const suffix = Date.now()
  await connection.query(`
    RENAME TABLE
      verbes TO failed_verbes_vfp202601_${suffix},
      ${BACKUP_TABLES.verbs} TO verbes,
      verbesconjugues TO failed_verbesconjugues_vfp202601_${suffix},
      ${BACKUP_TABLES.conjugations} TO verbesconjugues
  `)
}

async function removePilotPedagogy(connection) {
  await connection.beginTransaction()
  try {
    await connection.execute(
      `DELETE FROM emplois_pronominaux WHERE source=?`,
      [PILOT_SOURCE],
    )
    await connection.execute(`
      DELETE cv
      FROM complements_verbaux cv
      INNER JOIN constructions_verbales c ON c.id=cv.construction_id
      WHERE c.source=?
    `, [PILOT_SOURCE])
    await connection.execute(
      `DELETE FROM constructions_verbales WHERE source=?`,
      [PILOT_SOURCE],
    )
    await connection.execute(
      `DELETE FROM verbe_sens WHERE source=?`,
      [PILOT_SOURCE],
    )
    await connection.commit()
  }
  catch (error) {
    await connection.rollback()
    throw error
  }
}

function renderReport(
  inputName,
  candidates,
  formCount,
  mode,
  pedagogyCounts,
  { applied = false, alreadyApplied = false, repaired = false } = {},
) {
  const title = applied ? 'Application du lot pilote' : 'Simulation d’import du lot pilote'
  const persistence = applied
    ? (repaired
        ? 'liens sémantiques manquants ajoutés ; aucune duplication du lot'
        : alreadyApplied
        ? 'lot déjà présent et contrôlé ; aucune nouvelle écriture'
        : 'lot appliqué ; sauvegardes MyISAM conservées')
    : 'aucune'
  return `# ${title}

Rapport généré le ${new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}.

## Résultat technique

- mode : ${mode} ;
- verbes préparés : ${candidates.length} ;
- lignes de conjugaison préparées : ${formCount.toLocaleString('fr-CH')} ;
- fiches pédagogiques complètes : ${pedagogyCounts.senses} ;
- liens vers les catégories sémantiques : ${pedagogyCounts.categoryLinks} ;
- constructions avec compléments : ${pedagogyCounts.constructions} ;
- compléments pédagogiques préparés : ${pedagogyCounts.complements} ;
- COD avec genre, nombre et forme antéposée : ${pedagogyCounts.anteposable} ;
- emplois pronominaux validés : ${pedagogyCounts.pronominalUses} ;
- doublons détectés : 0 ;
- écriture conservée dans MySQL : ${persistence}.

## Sécurité

${applied
    ? `Les tables MyISAM antérieures sont conservées sous les noms \`${BACKUP_TABLES.verbs}\` et \`${BACKUP_TABLES.conjugations}\`. La commande de restauration peut remettre ces tables en service.`
    : alreadyApplied
      ? 'Le contrôle relit le lot déjà appliqué sans écrire dans les tables permanentes.'
      : 'La simulation utilise des tables temporaires et ne modifie aucune table permanente.'}

## Traçabilité

- lot : \`verbs-frequency-pilot-2026-01\` ;
- données préparées : \`${inputName}\`.
`
}

function expectedPedagogyCounts() {
  return {
    senses: PEDAGOGICAL_ENTRIES.length,
    categoryLinks: PEDAGOGICAL_ENTRIES.length,
    constructions: PEDAGOGICAL_ENTRIES
      .filter(entry => entry.sense.complementType).length,
    complements: PEDAGOGICAL_ENTRIES
      .reduce((total, entry) => total + entry.sense.complements.length, 0),
    anteposable: PEDAGOGICAL_ENTRIES
      .filter(entry => entry.sense.complementType === 'cod')
      .reduce((total, entry) => total + entry.sense.complements.length, 0),
    pronominalUses: PEDAGOGICAL_ENTRIES.filter(entry => entry.pronominalUse).length,
  }
}

async function inspectAppliedState(connection, infinitives) {
  const placeholders = infinitives.map(() => '?').join(', ')
  const [verbs] = await connection.execute(`
    SELECT id, infinitif, est_archive, statut_validation
    FROM verbes
    WHERE infinitif IN (${placeholders})
  `, infinitives)
  if (!verbs.length) return { state: 'absent' }
  if (verbs.length !== infinitives.length) {
    return { state: 'partial', verbCount: verbs.length }
  }
  const ids = verbs.map(row => Number(row.id))
  const idPlaceholders = ids.map(() => '?').join(', ')
  const [
    [forms],
    [senses],
    [categoryLinks],
    [constructions],
    [complements],
    [pronominals],
  ] = await Promise.all([
    connection.execute(
      `SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id IN (${idPlaceholders})`,
      ids,
    ),
    connection.execute(
      `SELECT COUNT(*) AS count FROM verbe_sens WHERE verbe_id IN (${idPlaceholders}) AND source=?`,
      [...ids, PILOT_SOURCE],
    ),
    connection.execute(`
      SELECT COUNT(*) AS count
      FROM verbe_sens_categories vsc
      INNER JOIN verbe_sens s ON s.id=vsc.sens_id
      WHERE s.verbe_id IN (${idPlaceholders}) AND s.source=?
    `, [...ids, PILOT_SOURCE]),
    connection.execute(`
      SELECT COUNT(*) AS count
      FROM constructions_verbales c
      INNER JOIN verbe_sens s ON s.id=c.sens_id
      WHERE s.verbe_id IN (${idPlaceholders}) AND c.source=?
    `, [...ids, PILOT_SOURCE]),
    connection.execute(`
      SELECT COUNT(*) AS count
      FROM complements_verbaux cv
      INNER JOIN constructions_verbales c ON c.id=cv.construction_id
      INNER JOIN verbe_sens s ON s.id=c.sens_id
      WHERE s.verbe_id IN (${idPlaceholders}) AND cv.source=?
    `, [...ids, PILOT_SOURCE]),
    connection.execute(
      `SELECT COUNT(*) AS count FROM emplois_pronominaux WHERE verbe_id IN (${idPlaceholders}) AND source=?`,
      [...ids, PILOT_SOURCE],
    ),
  ])
  const expected = expectedPedagogyCounts()
  const counts = {
    verbs: verbs.length,
    forms: Number(forms[0].count),
    senses: Number(senses[0].count),
    categoryLinks: Number(categoryLinks[0].count),
    constructions: Number(constructions[0].count),
    complements: Number(complements[0].count),
    pronominalUses: Number(pronominals[0].count),
  }
  const complete = counts.forms === infinitives.length * 102
    && counts.senses === expected.senses
    && counts.categoryLinks === expected.categoryLinks
    && counts.constructions === expected.constructions
    && counts.complements === expected.complements
    && counts.pronominalUses === expected.pronominalUses
    && verbs.every(row => !Number(row.est_archive) && row.statut_validation === 'valide')
  const repairable = !complete
    && counts.forms === infinitives.length * 102
    && counts.senses === expected.senses
    && counts.categoryLinks < expected.categoryLinks
    && counts.constructions === expected.constructions
    && counts.complements === expected.complements
    && counts.pronominalUses === expected.pronominalUses
    && verbs.every(row => !Number(row.est_archive) && row.statut_validation === 'valide')
  return { state: complete ? 'complete' : repairable ? 'repairable' : 'partial', counts }
}

async function restorePilot(connection) {
  await restoreMyisamBackups(connection)
  await removePilotPedagogy(connection)
}

export async function runVerbPilotImport(options = {}) {
  const apply = options.apply ?? process.argv.includes('--apply')
  const restore = options.restore ?? process.argv.includes('--restore')
  const config = options.databaseConfig || databaseConfig()
  const writeReports = options.writeReports ?? true
  if (apply && restore) throw new Error('Choisissez soit --apply, soit --restore.')
  if (restore) {
    const connection = await mysql.createConnection(config)
    try {
      await restorePilot(connection)
      console.log(
        'Restauration réussie : les tables MyISAM antérieures sont de nouveau actives '
        + 'et les données pédagogiques du lot ont été retirées.',
      )
    }
    finally {
      await connection.end()
    }
    return { restored: true }
  }
  const inputPath = resolve(
    options.inputPath
      || option('input', 'reports/missing-french-verbs-morphalou.json'),
  )
  const outputPath = resolve(
    options.outputPath
      || option(
        'output',
        apply ? 'reports/verb-pilot-import-apply.md' : 'reports/verb-pilot-import-check.md',
      ),
  )
  const source = JSON.parse(await readFile(inputPath, 'utf8'))
  if (source.readyCount !== 100 || source.blocked?.length) {
    throw new Error('Le contrôle Morphalou ne valide pas exactement 100 candidats.')
  }
  const expectedPedagogicalInfinitives = source.candidates
    .slice(0, PEDAGOGICAL_ENTRIES.length)
    .map(candidate => candidate.lemma)
  const pedagogyValidation = validatePedagogicalPilot(
    PEDAGOGICAL_ENTRIES,
    expectedPedagogicalInfinitives,
  )
  if (pedagogyValidation.errors.length) {
    throw new Error(`Sous-lot pédagogique invalide : ${pedagogyValidation.errors.join(' ; ')}`)
  }
  const connection = await mysql.createConnection(config)
  let preparedForms = 0
  let mode = ''
  let backupCreated = false
  let transactionStarted = false
  let alreadyApplied = false
  let repaired = false
  const pedagogyCounts = {
    senses: 0,
    categoryLinks: 0,
    constructions: 0,
    complements: 0,
    anteposable: 0,
    pronominalUses: 0,
  }
  const infinitives = source.candidates.map(candidate => candidate.lemma)
  const placeholders = infinitives.map(() => '?').join(', ')
  try {
    const [engineRows] = await connection.execute(`
      SELECT TABLE_NAME, ENGINE
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA=DATABASE()
        AND TABLE_NAME IN (
          'verbes', 'verbesconjugues', 'verbe_sens',
          'verbe_sens_categories', 'categories_semantiques',
          'constructions_verbales', 'complements_verbaux', 'emplois_pronominaux'
        )
    `)
    if (engineRows.length !== 8) throw new Error('Une table requise par le lot est absente.')
    const transactional = engineRows.length === 8
      && engineRows.every(row => String(row.ENGINE).toLocaleUpperCase('en') === 'INNODB')
    const engines = new Map(engineRows.map(row => [row.TABLE_NAME, String(row.ENGINE).toUpperCase()]))
    if (!transactional && (
      engines.get('verbes') !== 'MYISAM'
      || engines.get('verbesconjugues') !== 'MYISAM'
      || [
        'verbe_sens', 'verbe_sens_categories', 'categories_semantiques',
        'constructions_verbales', 'complements_verbaux', 'emplois_pronominaux',
      ]
        .some(table => engines.get(table) !== 'INNODB')
    )) {
      throw new Error('Combinaison de moteurs non prise en charge pour une application sûre.')
    }

    const appliedState = await inspectAppliedState(connection, infinitives)
    if (appliedState.state === 'complete') {
      alreadyApplied = true
      preparedForms = infinitives.length * 102
      Object.assign(pedagogyCounts, expectedPedagogyCounts())
      mode = apply
        ? 'contrôle idempotent du lot déjà appliqué'
        : 'contrôle du lot déjà appliqué, sans nouvelle écriture'
    }
    else if (apply && appliedState.state === 'repairable') {
      const inserted = await addMissingPilotCategoryLinks(connection)
      const repairedState = await inspectAppliedState(connection, infinitives)
      if (repairedState.state !== 'complete') {
        throw new Error(
          `Réparation sémantique incomplète : ${JSON.stringify(repairedState.counts)}.`,
        )
      }
      alreadyApplied = true
      repaired = true
      preparedForms = infinitives.length * 102
      Object.assign(pedagogyCounts, expectedPedagogyCounts())
      mode = `réparation idempotente de ${inserted} liens sémantiques`
    }
    else if (appliedState.state !== 'absent') {
      throw new Error(
        `État partiel du lot détecté (${JSON.stringify(appliedState.counts || appliedState)}). `
        + 'Utilisez la restauration avant de réessayer.',
      )
    }

    if (!alreadyApplied) {
      const tables = apply
        ? {
          verbs: 'verbes',
          conjugations: 'verbesconjugues',
          senses: 'verbe_sens',
          senseCategories: 'verbe_sens_categories',
          constructions: 'constructions_verbales',
          complements: 'complements_verbaux',
          pronominals: 'emplois_pronominaux',
        }
        : {
          verbs: 'simulation_verbes',
          conjugations: 'simulation_verbesconjugues',
          senses: 'simulation_verbe_sens',
          senseCategories: 'simulation_verbe_sens_categories',
          constructions: 'simulation_constructions_verbales',
          complements: 'simulation_complements_verbaux',
          pronominals: 'simulation_emplois_pronominaux',
        }
      if (apply && !transactional) {
        await createMyisamBackups(connection)
        backupCreated = true
        mode = 'application avec sauvegardes MyISAM et transaction pédagogique InnoDB'
      }
      else if (apply) {
        mode = 'transaction InnoDB'
      }
      else {
        await connection.query('CREATE TEMPORARY TABLE simulation_verbes LIKE verbes')
        await connection.query('CREATE TEMPORARY TABLE simulation_verbesconjugues LIKE verbesconjugues')
        await connection.query('CREATE TEMPORARY TABLE simulation_verbe_sens LIKE verbe_sens')
        await connection.query('CREATE TEMPORARY TABLE simulation_verbe_sens_categories LIKE verbe_sens_categories')
        await connection.query('CREATE TEMPORARY TABLE simulation_constructions_verbales LIKE constructions_verbales')
        await connection.query('CREATE TEMPORARY TABLE simulation_complements_verbaux LIKE complements_verbaux')
        await connection.query('CREATE TEMPORARY TABLE simulation_emplois_pronominaux LIKE emplois_pronominaux')
        await connection.query('INSERT INTO simulation_emplois_pronominaux SELECT * FROM emplois_pronominaux')
        mode = 'tables temporaires (tables permanentes non transactionnelles)'
      }

      await connection.beginTransaction()
      transactionStarted = true
      const models = await modelRows(connection, source.candidates)
      const auxiliaries = await auxiliaryForms(connection)
      for (const [index, candidate] of source.candidates.entries()) {
        const pedagogy = PEDAGOGY_BY_INFINITIVE.get(candidate.lemma)
        const inserted = await insertCandidate(
          connection,
          candidate,
          models.get(fallbackModel(candidate)),
          auxiliaries,
          tables,
          pedagogy,
          index + 1,
        )
        preparedForms += inserted.insertedForms
        if (pedagogy) {
          const insertedPedagogy = await insertPedagogy(
            connection,
            tables,
            inserted.verbId,
            candidate,
            pedagogy,
          )
          pedagogyCounts.senses += insertedPedagogy.senses
          pedagogyCounts.categoryLinks += insertedPedagogy.categoryLinks
          pedagogyCounts.constructions += insertedPedagogy.constructions
          pedagogyCounts.complements += insertedPedagogy.complements
          pedagogyCounts.anteposable += insertedPedagogy.anteposable
          pedagogyCounts.pronominalUses += await insertPronominalUse(
            connection,
            tables.pronominals,
            inserted.verbId,
            pedagogy,
          )
        }
      }
      const [counts] = await connection.execute(
        `SELECT COUNT(*) AS count FROM ${tables.verbs} WHERE infinitif IN (${placeholders})`,
        infinitives,
      )
      const expected = expectedPedagogyCounts()
      if (Number(counts[0].count) !== 100
        || Object.entries(expected).some(([key, count]) => pedagogyCounts[key] !== count)) {
        throw new Error('Le contrôle structurel du lot pédagogique a échoué.')
      }
      if (apply) await connection.commit()
      else await connection.rollback()
      transactionStarted = false
    }
  }
  catch (error) {
    if (transactionStarted) await connection.rollback()
    if (apply && backupCreated) {
      try {
        await restoreMyisamBackups(connection)
      }
      catch (restoreError) {
        throw new AggregateError(
          [error, restoreError],
          'Échec de l’application et de la restauration automatique.',
        )
      }
    }
    throw error
  }
  finally {
    await connection.end()
  }
  if (writeReports) {
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(
      outputPath,
      renderReport(
        inputPath.split(/[\\/]/u).pop(),
        source.candidates,
        preparedForms,
        mode,
        pedagogyCounts,
        { applied: apply, alreadyApplied, repaired },
      ),
      'utf8',
    )
  }
  console.log(
    `${apply
      ? (repaired ? 'Réparation idempotente réussie' : alreadyApplied ? 'Contrôle idempotent réussi' : 'Application réussie')
      : 'Simulation réussie'} : `
    + `100 verbes et ${preparedForms} lignes préparés via ${mode}.`,
  )
  if (writeReports) console.log(`Rapport : ${outputPath}`)
  return {
    applied: apply,
    alreadyApplied,
    repaired,
    preparedForms,
    pedagogyCounts,
    mode,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runVerbPilotImport().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
