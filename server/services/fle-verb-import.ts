import { createHash } from 'node:crypto'
import type { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import payloadJson from '../../shared/data/fle-verbs-2026-11-17.json'
import auditJson from '../../shared/data/fle-verbs-2026-11-17-audit.json'
import { AUXILIARY_SIMPLE_TENSES, compoundSimpleTense } from '../../shared/utils/compound-auxiliaries'
import { generatePronominalRow } from './pronominal-formatter'
import type { PronominalSourceRow } from './pronominal-formatter'
import type { CompoundAuxiliaryForm } from './compound-auxiliary'

interface BatchRow { tenseId: number, personId: number, forms: string[] }
interface PronominalEntry {
  infinitive: string, baseInfinitive: string, definition: string, allowedPersons: number[],
  agreement: string, sourceUrl: string, conjugationUrl: string, referenceRows: BatchRow[]
}
interface BatchEntry {
  infinitive: string, definition: string, semanticDomain: string, cefr: string, auxiliary: string,
  group: number, model: string, sourceUrl: string, conjugationUrl: string,
  presentParticiple: string, pastParticiple: string, rows: BatchRow[], pronominal?: PronominalEntry
  transitivity: string, preposition: string | null
}
interface Batch { batchId: string, date: string, requested: string[], entries: BatchEntry[] }
interface TenseRow extends RowDataPacket { id: number, name: string, mode_name: string, is_compound: number }
interface VerbRow extends RowDataPacket { id: number, infinitif: string, est_archive: number, pronominalisable: number, particularites: string | string[] | null }
interface UseRow extends RowDataPacket { id: number, verbe_id: number, infinitif_pronominal: string, actif: number }
interface JournalRow extends RowDataPacket { status: string, payload_sha256: string, snapshot_json: string | ImportSnapshot }
interface ImportSnapshot { newInfinitives: string[], originalFlags: Array<{ id: number, value: number }> }
type Database = Pick<Connection, 'execute' | 'query' | 'beginTransaction' | 'commit' | 'rollback'>
export const fleVerbBatch = payloadJson as Batch
const BATCH_ID = 'fle-verbs-2026-11-17'
const TAG = `import:${BATCH_ID}`
const JOURNAL = 'fle_verb_import_journal'
const marks = (items: unknown[]) => items.map(() => '?').join(',')
const normalize = (value: string) => value.normalize('NFC').replace(/’/gu, "'").replace(/\s+/gu, ' ').trim()
const json = <T>(value: string | T): T => typeof value === 'string' ? JSON.parse(value) : value

/** Refuse un lot modifié après le contrôle des deux sources, ou structurellement incomplet. */
export function validateFleVerbBatch(batch: Batch = fleVerbBatch, seal = auditJson) {
  const hash = createHash('sha256').update(JSON.stringify(batch)).digest('hex')
  if (seal.errors.length || seal.payloadSha256 !== hash || batch.batchId !== BATCH_ID) {
    throw new Error('Lot FLE non audité ou modifié après audit. Régénérer les données et leur contrôle avant import.')
  }
  if (batch.entries.length !== 41 || new Set(batch.requested).size !== 41 || batch.requested.length !== 42) throw new Error('Liste FLE incomplète ou dupliquée.')
  if (new Set(batch.entries.map(entry => entry.infinitive)).size !== 41) throw new Error('Doublon de verbe dans le lot FLE.')
  for (const entry of batch.entries) {
    if (!entry.definition || entry.definition.length > 180 || !entry.sourceUrl.startsWith('https://www.dictionnaire-academie.fr/article/')) throw new Error(`Métadonnées incomplètes : ${entry.infinitive}`)
    if (entry.rows.length !== 96 || new Set(entry.rows.map(row => `${row.tenseId}:${row.personId}`)).size !== 96) throw new Error(`Paradigme incomplet : ${entry.infinitive}`)
    for (const row of entry.rows) {
      if (![4, 5, 6, 7, 8, 9].includes(row.personId) || !row.forms.length || row.forms.length > 3 || row.forms.some(form => !form || /[<>\d]/u.test(form))) throw new Error(`Forme invalide : ${entry.infinitive} ${row.tenseId}:${row.personId}`)
      if ([9, 18].includes(row.tenseId) && ![5, 7, 8].includes(row.personId)) throw new Error(`Personne interdite à l’impératif : ${entry.infinitive}`)
    }
  }
  return { hash, baseVerbs: batch.entries.length, finiteSlots: batch.entries.reduce((sum, entry) => sum + entry.rows.length, 0) }
}

export async function auditFleVerbRuntime(connection: Database) {
  const integrity = validateFleVerbBatch()
  const [tenses] = await connection.execute<TenseRow[]>('SELECT t.id,t.name,m.name AS mode_name,t.isTempsCompose AS is_compound FROM temps t JOIN modes m ON m.id=t.mode_id')
  const [auxiliaryForms] = await connection.execute<Array<RowDataPacket & CompoundAuxiliaryForm>>(`
    SELECT vc.personne_id,m.name AS mode_name,t.name AS temps_name,vc.conjugaison1
    FROM verbesconjugues vc JOIN verbes v ON v.id=vc.verbe_id
    JOIN temps t ON t.id=vc.temp_id JOIN modes m ON m.id=t.mode_id
    WHERE v.infinitif='être' AND t.isTempsCompose=0 AND vc.conjugaison1<>''
  `)
  let compoundForms = 0
  let pronominalForms = 0
  const errors: string[] = []
  for (const entry of fleVerbBatch.entries) {
    for (const row of entry.rows) {
      const tense = tenses.find(item => Number(item.id) === row.tenseId)
      if (!tense) { errors.push(`${entry.infinitive} : temps ${row.tenseId} absent`); continue }
      if (Number(tense.is_compound)) {
        const simple = compoundSimpleTense(tense.mode_name, tense.name)
        const reference = simple && AUXILIARY_SIMPLE_TENSES.find(item => item.mode === simple.mode && item.tense === simple.tense)
        const personIndex = tense.mode_name === 'impératif' ? [5, 7, 8].indexOf(row.personId) : row.personId - 4
        const auxiliaries: Array<'avoir' | 'être'> = ['retourner', 'convenir'].includes(entry.infinitive) ? ['avoir', 'être'] : [entry.auxiliary as 'avoir' | 'être']
        const expected = auxiliaries.flatMap(auxiliary => {
          const form = reference?.forms[auxiliary][personIndex]
          const participle = entry.pastParticiple + (auxiliary === 'être' && row.personId >= 7 && !/[sx]$/u.test(entry.pastParticiple) ? 's' : '')
          return form ? [`${form} ${participle}`] : []
        })
        compoundForms++
        if (row.forms.some(form => !expected.includes(normalize(form))) || expected.some(form => !row.forms.map(normalize).includes(form))) errors.push(`${entry.infinitive} ${row.tenseId}:${row.personId} : temps composé divergent`)
      }
      if (!entry.pronominal) continue
      const source = {
        id: 1, verbe_id: 1, personne_id: row.personId, temp_id: row.tenseId,
        infinitif: entry.pronominal.infinitive, auxiliaire: entry.auxiliary,
        participe_passe: entry.pastParticiple, temps_name: tense.name, mode_name: tense.mode_name,
        is_compound: tense.is_compound, base_conjugaison1: row.forms[0], base_conjugaison2: row.forms[1] || '', base_conjugaison3: row.forms[2] || '',
        conjugaison1: row.forms[0], conjugaison2: row.forms[1] || '', conjugaison3: row.forms[2] || '',
        pronominal_use_id: 1, infinitif_pronominal: entry.pronominal.infinitive,
        regle_accord: entry.pronominal.agreement, type_h_initial: null,
      } as PronominalSourceRow
      const generated = generatePronominalRow(source, auxiliaryForms)
      const official = entry.pronominal.referenceRows.find(item => item.tenseId === row.tenseId && item.personId === row.personId)
      pronominalForms++
      if (!generated.conjugaison1 || (official && !official.forms.map(normalize).includes(normalize(generated.conjugaison1)))) errors.push(`${entry.pronominal.infinitive} ${row.tenseId}:${row.personId} : « ${generated.conjugaison1} » ≠ ${official?.forms.join(' / ') || 'forme attendue'}`)
    }
  }
  if (errors.length) throw new Error(`Audit du moteur bloquant : ${errors.join('; ')}`)
  return { ...integrity, compoundForms, pronominalForms, tenses }
}

async function inspectState(connection: Database) {
  const names = fleVerbBatch.entries.map(entry => entry.infinitive)
  const [verbs] = await connection.execute<VerbRow[]>(`SELECT id,infinitif,est_archive,pronominalisable,particularites FROM verbes WHERE infinitif IN (${marks(names)})`, names)
  if (new Set(verbs.map(verb => verb.infinitif)).size !== verbs.length) throw new Error('Plusieurs entrées existantes pour un même infinitif : import bloqué.')
  if (verbs.some(verb => verb.est_archive)) throw new Error('Un verbe demandé est archivé : réactivation éditoriale nécessaire.')
  const usesNames = fleVerbBatch.entries.flatMap(entry => entry.pronominal ? [entry.pronominal.infinitive] : [])
  const [uses] = await connection.execute<UseRow[]>(`SELECT id,verbe_id,infinitif_pronominal,actif FROM emplois_pronominaux WHERE infinitif_pronominal IN (${marks(usesNames)})`, usesNames)
  if (new Set(uses.map(use => use.infinitif_pronominal)).size !== uses.length) throw new Error('Emploi pronominal dupliqué : import bloqué.')
  for (const entry of fleVerbBatch.entries) {
    const verb = verbs.find(row => row.infinitif === entry.infinitive)
    const use = uses.find(row => row.infinitif_pronominal === entry.pronominal?.infinitive)
    if (use && (!use.actif || Number(use.verbe_id) !== Number(verb?.id))) throw new Error(`Emploi pronominal existant incompatible : ${entry.pronominal?.infinitive}`)
  }
  return { verbs, uses, missingVerbs: names.filter(name => !verbs.some(verb => verb.infinitif === name)), missingUses: usesNames.filter(name => !uses.some(use => use.infinitif_pronominal === name)) }
}

async function verifyStoredRows(connection: Database, complete = true) {
  const state = await inspectState(connection)
  if (complete && (state.missingVerbs.length || state.missingUses.length)) throw new Error('Vérification après import : entrées manquantes.')
  if (!state.verbs.length) return state
  const [rows] = await connection.execute<Array<RowDataPacket & { infinitif: string, personne_id: number, temp_id: number, conjugaison1: string, conjugaison2: string, conjugaison3: string }>>(`
    SELECT v.infinitif,vc.personne_id,vc.temp_id,vc.conjugaison1,vc.conjugaison2,vc.conjugaison3
    FROM verbesconjugues vc JOIN verbes v ON v.id=vc.verbe_id WHERE v.infinitif IN (${marks(state.verbs)})
  `, state.verbs.map(verb => verb.infinitif))
  const inspectedEntries = fleVerbBatch.entries.filter(entry => state.verbs.some(verb => verb.infinitif === entry.infinitive
    && (complete || !json<string[]>(verb.particularites || []).includes(TAG))))
  for (const entry of inspectedEntries) for (const expected of entry.rows) {
    const matches = rows.filter(row => row.infinitif === entry.infinitive && Number(row.personne_id) === expected.personId && Number(row.temp_id) === expected.tenseId)
    if (matches.length !== 1) throw new Error(`Coordonnée absente ou dupliquée : ${entry.infinitive} ${expected.tenseId}:${expected.personId}`)
    const row = matches[0]!
    const actual = [row.conjugaison1, row.conjugaison2, row.conjugaison3].filter(Boolean).map(normalize)
    // Les verbes déjà présents restent intacts, mais doivent posséder toutes les formes contrôlées.
    if (expected.forms.some(form => !actual.includes(normalize(form)))) throw new Error(`Forme stockée divergente : ${entry.infinitive} ${expected.tenseId}:${expected.personId}`)
  }
  return state
}

/** Nettoyage compensatoire MyISAM : uniquement les lignes portant le marqueur de ce lot. */
async function compensateIncompleteImport(connection: Database, snapshot: ImportSnapshot) {
  if (snapshot.newInfinitives.length) {
    const [owned] = await connection.execute<VerbRow[]>(`SELECT id,infinitif,particularites FROM verbes WHERE infinitif IN (${marks(snapshot.newInfinitives)})`, snapshot.newInfinitives)
    const ids = owned.filter(row => json<string[]>(row.particularites || []).includes(TAG)).map(row => Number(row.id))
    if (ids.length) {
      await connection.execute(`DELETE FROM verbesconjugues WHERE verbe_id IN (${marks(ids)})`, ids)
      await connection.execute(`DELETE FROM verbes WHERE id IN (${marks(ids)})`, ids)
    }
  }
  for (const original of snapshot.originalFlags) await connection.execute('UPDATE verbes SET pronominalisable=? WHERE id=?', [original.value, original.id])
}

export async function importFleVerbBatch(connection: Database, { apply = false } = {}) {
  const runtimeAudit = await auditFleVerbRuntime(connection)
  const state = await verifyStoredRows(connection, false)
  if (!apply) return { mode: 'audit', ...runtimeAudit, missingVerbs: state.missingVerbs, missingUses: state.missingUses }
  const [[lock]] = await connection.query<Array<RowDataPacket & { acquired: number }>>('SELECT GET_LOCK(?,30) AS acquired', [BATCH_ID])
  if (Number(lock?.acquired) !== 1) throw new Error('Import FLE déjà en cours.')
  let snapshot: ImportSnapshot | undefined
  let transactionStarted = false
  try {
    await connection.execute(`CREATE TABLE IF NOT EXISTS ${JOURNAL} (
      batch_id VARCHAR(80) PRIMARY KEY, payload_sha256 CHAR(64) NOT NULL,
      status VARCHAR(16) NOT NULL, snapshot_json JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`)
    const [[journal]] = await connection.execute<JournalRow[]>(`SELECT * FROM ${JOURNAL} WHERE batch_id=?`, [BATCH_ID])
    if (journal && journal.payload_sha256 !== runtimeAudit.hash) throw new Error('Le lot importé diffère du lot audité. Ne pas le remplacer automatiquement.')
    if (journal?.status === 'applied') {
      await verifyStoredRows(connection)
      return { mode: 'already-applied', baseVerbs: runtimeAudit.baseVerbs, finiteSlots: runtimeAudit.finiteSlots }
    }
    if (journal?.status === 'pending') await compensateIncompleteImport(connection, json<ImportSnapshot>(journal.snapshot_json))
    const current = await inspectState(connection)
    const [engines] = await connection.execute<Array<RowDataPacket & { TABLE_NAME: string, ENGINE: string }>>(`SELECT TABLE_NAME,ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('verbes','verbesconjugues','verbe_sens','verbe_sens_categories','emplois_pronominaux')`)
    if (engines.length !== 5 || engines.some(row => !['InnoDB', 'MyISAM'].includes(row.ENGINE) || (!['verbes', 'verbesconjugues'].includes(row.TABLE_NAME) && row.ENGINE !== 'InnoDB'))) throw new Error('Moteurs SQL non pris en charge pour un import sûr.')
    const [categories] = await connection.execute<Array<RowDataPacket & { id: number, slug: string }>>('SELECT id,slug FROM categories_semantiques')
    const [models] = await connection.execute<Array<RowDataPacket & { infinitif: string, famille_conjugaison_id: number | null }>>('SELECT infinitif,famille_conjugaison_id FROM verbes WHERE est_archive=0')
    for (const entry of fleVerbBatch.entries) if (!categories.some(category => category.slug === entry.semanticDomain)) throw new Error(`Catégorie absente : ${entry.semanticDomain}`)
    snapshot = {
      newInfinitives: current.missingVerbs,
      originalFlags: current.verbs.filter(verb => fleVerbBatch.entries.some(entry => entry.infinitive === verb.infinitif && entry.pronominal)).map(verb => ({ id: Number(verb.id), value: Number(verb.pronominalisable) })),
    }
    // Le journal est écrit AVANT la transaction : il permet la reprise après un arrêt brutal de MyISAM.
    await connection.execute(`INSERT INTO ${JOURNAL} (batch_id,payload_sha256,status,snapshot_json) VALUES (?,?,'pending',?) ON DUPLICATE KEY UPDATE status='pending',snapshot_json=VALUES(snapshot_json)`, [BATCH_ID, runtimeAudit.hash, JSON.stringify(snapshot)])
    await connection.beginTransaction(); transactionStarted = true
    const ids = new Map(current.verbs.map(verb => [verb.infinitif, Number(verb.id)]))
    let insertedVerbs = 0
    let insertedForms = 0
    let insertedUses = 0
    for (const entry of fleVerbBatch.entries) {
      let id = ids.get(entry.infinitive)
      if (!id) {
        const modelAliases: Record<string, string> = { amonceler: 'appeler', bouger: 'manger', avancer: 'lancer', amener: 'lever', crier: 'crier' }
        const model = models.find(item => item.infinitif === entry.model) || models.find(item => item.infinitif === modelAliases[entry.model])
        const ending = entry.infinitive.endsWith('er') ? 'er' : entry.infinitive.endsWith('ir') ? 'ir' : 're'
        const [created] = await connection.execute<ResultSetHeader>(`INSERT INTO verbes
          (infinitif,\`participe_présent\`,\`participe_passé\`,auxiliaire,groupe_conjugaison,famille_conjugaison_id,
           terminaison_infinitif,type_pronominal,est_impersonnel,est_defectif,personnes_disponibles,
           type_h_initial,niveau_difficulte,niveau_cecrl,rang_frequence,registre_principal,forme_canonique,
           statut_validation,particularites,niveaux_scolaires,parcours_cif,pronominalisable,est_archive)
          VALUES (?,?,?,?,?,?,?,'aucun',0,0,?,NULL,?,?,NULL,'courant',?,'valide',?,?,?, ?,0)`,
        [entry.infinitive, entry.presentParticiple, entry.pastParticiple, entry.auxiliary, entry.group, model?.famille_conjugaison_id ?? null,
          ending, JSON.stringify([4, 5, 6, 7, 8, 9]), entry.group === 3 || entry.rows.some(row => row.forms.length > 1) ? 2 : 1, entry.cefr, entry.infinitive,
          JSON.stringify([TAG, 'formes:academie', 'controle:morphalou-3.1', 'cecrl:estimation-editoriale']), '[]', '[]', entry.pronominal ? 1 : 0])
        id = Number(created.insertId); ids.set(entry.infinitive, id); insertedVerbs++
        for (const row of entry.rows) {
          await connection.execute('INSERT INTO verbesconjugues (verbe_id,verbe_infinitif,personne_id,temp_id,conjugaison1,conjugaison2,conjugaison3) VALUES (?,?,?,?,?,?,?)', [id, entry.infinitive, row.personId, row.tenseId, row.forms[0]!, row.forms[1] || '', row.forms[2] || ''])
          insertedForms++
        }
        const senses = [{ definition: entry.definition, construction: entry.infinitive, pronominal: false, auxiliary: entry.auxiliary, transitivity: entry.transitivity, preposition: entry.preposition },
          ...(entry.infinitive === 'convenir' ? [{ definition: 'Se mettre d’accord avec quelqu’un sur une chose.', construction: 'convenir de', pronominal: false, auxiliary: 'être', transitivity: 'transitif_indirect', preposition: 'de' }] : []),
          ...(entry.infinitive === 'retourner' ? [{ definition: 'Mettre une chose sur son autre face ou dans l’autre sens.', construction: 'retourner quelque chose', pronominal: false, auxiliary: 'avoir', transitivity: 'transitif_direct', preposition: null }] : [])]
        for (const [index, sense] of senses.entries()) await insertSense(connection, id, index + 1, sense, categories.find(category => category.slug === entry.semanticDomain)!.id)
      }
      if (entry.pronominal && current.missingUses.includes(entry.pronominal.infinitive)) {
        await connection.execute(`INSERT INTO emplois_pronominaux
          (verbe_id,infinitif_pronominal,type_emploi,fonction_pronom,regle_accord,preposition,personnes_autorisees,source,source_url,statut_validation,actif)
          VALUES (?,?,'reflechi','variable',?,NULL,?,?,?,'valide',1)`,
        [id, entry.pronominal.infinitive, entry.pronominal.agreement, JSON.stringify(entry.pronominal.allowedPersons), BATCH_ID, entry.pronominal.sourceUrl])
        await connection.execute('UPDATE verbes SET pronominalisable=1 WHERE id=? AND pronominalisable<>1', [id])
        const [[number]] = await connection.execute<Array<RowDataPacket & { nextNumber: number }>>('SELECT COALESCE(MAX(numero_sens),0)+1 AS nextNumber FROM verbe_sens WHERE verbe_id=?', [id])
        await insertSense(connection, id, Number(number!.nextNumber), { definition: entry.pronominal.definition, construction: entry.pronominal.infinitive, pronominal: true, auxiliary: 'être', transitivity: 'intransitif', preposition: null }, categories.find(category => category.slug === entry.semanticDomain)!.id)
        insertedUses++
      }
    }
    await verifyStoredRows(connection)
    await connection.execute(`UPDATE ${JOURNAL} SET status='applied' WHERE batch_id=?`, [BATCH_ID])
    await connection.commit(); transactionStarted = false
    return { mode: 'applied', insertedVerbs, insertedForms, insertedUses, baseVerbs: runtimeAudit.baseVerbs, finiteSlots: runtimeAudit.finiteSlots }
  } catch (error) {
    if (transactionStarted) await connection.rollback()
    if (snapshot) await compensateIncompleteImport(connection, snapshot)
    throw error
  } finally {
    await connection.query('SELECT RELEASE_LOCK(?)', [BATCH_ID])
  }
}

async function insertSense(connection: Database, id: number, number: number, sense: { definition: string, construction: string, pronominal: boolean, auxiliary: string, transitivity: string, preposition: string | null }, categoryId: number) {
  const [created] = await connection.execute<ResultSetHeader>(`INSERT INTO verbe_sens
    (verbe_id,numero_sens,intitule,definition,construction,transitivite,preposition,auxiliaire,registre,est_pronominal,est_principal,source,sort_order)
    VALUES (?,?,?,?,?,?,?,?,'courant',?,?,?,?)`,
  [id, number, sense.definition.replace(/[.]$/u, ''), sense.definition, sense.construction, sense.transitivity, sense.preposition, sense.auxiliary, sense.pronominal ? 1 : 0, number === 1 ? 1 : 0, BATCH_ID, number])
  await connection.execute('INSERT INTO verbe_sens_categories (sens_id,categorie_id) VALUES (?,?)', [created.insertId, categoryId])
}
