import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import leblancCorpus from '../../shared/data/literary-corpus-pilot.json'
import verneCorpus from '../../shared/data/literary-corpus-verne.json'
import lerouxCorpus from '../../shared/data/literary-corpus-leroux.json'
import fournierCorpus from '../../shared/data/literary-corpus-fournier.json'
import stendhalCorpus from '../../shared/data/literary-corpus-stendhal.json'
import coletteCorpus from '../../shared/data/literary-corpus-colette.json'
import productionCorpus from '../../shared/data/literary-corpus-production.json'
import { useDatabase } from '../utils/database'

interface IdRow extends RowDataPacket { id: number }
interface StoredSourceRow extends IdRow { checksum: string }
interface CandidateQuotaRow extends IdRow {
  verbId: number
  tenseId: number
  personId: number
  sourceId: number
  confidence: 'high' | 'ambiguous'
  wordCount: number
}
interface DiversityCandidateRow extends CandidateQuotaRow {
  mode: string
  tense: string
}
interface ValidatedQuotaRow extends RowDataPacket {
  verbId: number
  tenseId: number
  personId: number
  count: number
}
interface DeduplicationRow extends CandidateQuotaRow {
  sentenceText: string
  reviewStatus: 'candidate' | 'validated' | 'reserve' | 'rejected'
  reviewedAt: Date | null
}

const LITERARY_QUOTA_PER_SELECTION = 10
const FREQUENT_TENSE_QUOTAS = new Map([
  ['indicatif:présent', 2],
  ['indicatif:imparfait', 2],
  ['indicatif:passé simple', 2],
  ['indicatif:passé composé', 3],
  ['indicatif:futur', 3],
])

interface CorpusTargetSeed {
  verbId: number
  tenseId: number
  personId: number
  form: string
  start: number
  end: number
  confidence: 'high' | 'ambiguous'
  ambiguityReason: string | null
}

interface CorpusSentenceSeed {
  key: string
  chapter: string | null
  locator: string
  text: string
  wordCount: number
  characterCount: number
  sourceUrl?: string
  targets: CorpusTargetSeed[]
}

interface CorpusSeed {
  source: {
    key: string
    author: string
    title: string
    edition: string
    sourceUrl: string
    license: string
    publicDomainBasis: string
    checksum: string
    register?: 'courant' | 'soutenu'
  }
  sentences: CorpusSentenceSeed[]
}

interface ProductionTargetSeed extends CorpusTargetSeed {
  reviewNote: string | null
}

interface ProductionSentenceSeed extends Omit<CorpusSentenceSeed, 'targets' | 'sourceUrl'> {
  sourceUrl: string | null
  targets: ProductionTargetSeed[]
}

interface ProductionCorpusSnapshot {
  schemaVersion: number
  checksum: string
  counts: { sources: number, sentences: number, targets: number }
  sources: Array<{
    source: {
      key: string
      author: string
      title: string
      edition: string
      sourceUrl: string
      license: string
      publicDomainBasis: string
      languageRegister: 'courant' | 'soutenu'
      sourceChecksum: string
    }
    sentences: ProductionSentenceSeed[]
  }>
}

async function applyProductionCorpusSnapshot(connection: PoolConnection) {
  const snapshot = productionCorpus as ProductionCorpusSnapshot
  const migrationKey = `production-literary-corpus-v1-${snapshot.checksum.slice(0, 40)}`
  const [[alreadyApplied]] = await connection.execute<IdRow[]>(
    'SELECT 1 AS id FROM literary_corpus_migrations WHERE migration_key=?',
    [migrationKey],
  )
  if (alreadyApplied) {
    console.info(`[database] Corpus littéraire de production déjà importé : ${snapshot.counts.targets} formes validées.`)
    return
  }

  const sentences = snapshot.sources.flatMap(source => source.sentences.map(sentence => ({
    sourceKey: source.source.key,
    ...sentence,
  })))
  const targets = sentences.flatMap(sentence => sentence.targets.map(target => ({
    sentenceKey: sentence.key,
    ...target,
  })))
  if (snapshot.schemaVersion !== 1
    || !/^[a-f0-9]{64}$/u.test(snapshot.checksum)
    || snapshot.counts.sources !== snapshot.sources.length
    || snapshot.counts.sentences !== sentences.length
    || snapshot.counts.targets !== targets.length) {
    throw new Error('L’instantané littéraire de production est incomplet ou incohérent.')
  }
  for (const sentence of sentences) {
    if (sentence.characterCount !== sentence.text.length || !sentence.targets.length) {
      throw new Error(`Phrase littéraire de production invalide : ${sentence.key}`)
    }
    for (const target of sentence.targets) {
      if (sentence.text.slice(target.start, target.end) !== target.form) {
        throw new Error(`Cible littéraire décalée dans la phrase ${sentence.key}.`)
      }
    }
  }

  const [verbRows] = await connection.query<IdRow[]>('SELECT id FROM verbes')
  const [tenseRows] = await connection.query<IdRow[]>('SELECT id FROM temps')
  const [personRows] = await connection.query<IdRow[]>('SELECT id FROM personnes')
  const verbIds = new Set(verbRows.map(row => Number(row.id)))
  const tenseIds = new Set(tenseRows.map(row => Number(row.id)))
  const personIds = new Set(personRows.map(row => Number(row.id)))
  const invalidTarget = targets.find(target => !verbIds.has(target.verbId)
    || !tenseIds.has(target.tenseId) || !personIds.has(target.personId))
  if (invalidTarget) {
    throw new Error(`Référence grammaticale absente pour la phrase ${invalidTarget.sentenceKey}.`)
  }

  await connection.beginTransaction()
  try {
    await connection.query('DELETE FROM literary_targets')
    await connection.query('DELETE FROM literary_sentences')
    await connection.query('DELETE FROM literary_sources')

    const sourceIds = new Map<string, number>()
    for (const entry of snapshot.sources) {
      const [result] = await connection.execute<ResultSetHeader>(`
        INSERT INTO literary_sources
          (source_key,author,title,edition,source_url,source_license,public_domain_basis,
           language_register,source_checksum)
        VALUES (?,?,?,?,?,?,?,?,?)
      `, [
        entry.source.key, entry.source.author, entry.source.title, entry.source.edition,
        entry.source.sourceUrl, entry.source.license, entry.source.publicDomainBasis,
        entry.source.languageRegister, entry.source.sourceChecksum,
      ])
      sourceIds.set(entry.source.key, Number(result.insertId))
    }

    for (let start = 0; start < sentences.length; start += 200) {
      const batch = sentences.slice(start, start + 200)
      const values = batch.flatMap(sentence => [
        sourceIds.get(sentence.sourceKey), sentence.key, sentence.chapter, sentence.locator,
        sentence.sourceUrl, sentence.text, sentence.wordCount, sentence.characterCount,
      ])
      await connection.query(`
        INSERT INTO literary_sentences
          (source_id,external_key,chapter,locator,source_url,sentence_text,word_count,character_count)
        VALUES ${batch.map(() => '(?,?,?,?,?,?,?,?)').join(',')}
      `, values)
    }
    const [storedSentences] = await connection.query<Array<IdRow & { sentenceKey: string }>>(
      'SELECT id,external_key AS sentenceKey FROM literary_sentences',
    )
    const sentenceIds = new Map(storedSentences.map(row => [row.sentenceKey, Number(row.id)]))

    for (let start = 0; start < targets.length; start += 200) {
      const batch = targets.slice(start, start + 200)
      const values = batch.flatMap(target => [
        sentenceIds.get(target.sentenceKey), target.verbId, target.tenseId, target.personId,
        target.form, target.start, target.end, target.confidence, target.ambiguityReason,
        target.reviewNote,
      ])
      await connection.query(`
        INSERT INTO literary_targets
          (sentence_id,verb_id,tense_id,person_id,target_text,target_start,target_end,
           confidence,ambiguity_reason,review_status,review_note,reviewed_at)
        VALUES ${batch.map(() => "(?,?,?,?,?,?,?,?,?,'validated',?,CURRENT_TIMESTAMP)").join(',')}
      `, values)
    }

    const [[importedCounts]] = await connection.query<Array<RowDataPacket & {
      sources: number
      sentences: number
      targets: number
      invalidTargets: number
    }>>(`
      SELECT
        (SELECT COUNT(*) FROM literary_sources) AS sources,
        (SELECT COUNT(*) FROM literary_sentences) AS sentences,
        COUNT(*) AS targets,
        SUM(review_status<>'validated') AS invalidTargets
      FROM literary_targets
    `)
    if (!importedCounts
      || Number(importedCounts.sources) !== snapshot.counts.sources
      || Number(importedCounts.sentences) !== snapshot.counts.sentences
      || Number(importedCounts.targets) !== snapshot.counts.targets
      || Number(importedCounts.invalidTargets) !== 0) {
      throw new Error('Le contrôle final du corpus littéraire de production a échoué.')
    }

    await connection.execute(
      'INSERT INTO literary_corpus_migrations (migration_key) VALUES (?)',
      [migrationKey],
    )
    await connection.query(`
      INSERT IGNORE INTO literary_corpus_migrations (migration_key)
      VALUES ('validated-literary-enrichment-v1'),('validated-literary-enrichment-v2')
    `)
    await connection.commit()
    console.info(
      `[database] Corpus littéraire de production importé : ${snapshot.counts.sources} œuvres,`
      + ` ${snapshot.counts.sentences} phrases et ${snapshot.counts.targets} formes validées.`,
    )
  } catch (error) {
    await connection.rollback()
    throw error
  }
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()
  const connection = await database.getConnection()

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS literary_sources (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        source_key VARCHAR(120) NOT NULL,
        author VARCHAR(180) NOT NULL,
        title VARCHAR(255) NOT NULL,
        edition VARCHAR(255) NOT NULL DEFAULT '',
        source_url VARCHAR(700) NOT NULL,
        source_license VARCHAR(180) NOT NULL DEFAULT '',
        public_domain_basis VARCHAR(500) NOT NULL DEFAULT '',
        language_register ENUM('courant','soutenu') NOT NULL DEFAULT 'soutenu',
        source_checksum CHAR(64) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_literary_source_key (source_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    const [[registerColumn]] = await connection.query<IdRow[]>(`
      SELECT 1 AS id FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='literary_sources' AND COLUMN_NAME='language_register'
    `)
    if (!registerColumn) {
      await connection.query(`
        ALTER TABLE literary_sources
        ADD COLUMN language_register ENUM('courant','soutenu') NOT NULL DEFAULT 'soutenu'
        AFTER public_domain_basis
      `)
    }
    await connection.query(`
      CREATE TABLE IF NOT EXISTS literary_sentences (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        source_id INT NOT NULL,
        external_key CHAR(64) NOT NULL,
        chapter VARCHAR(255) NULL,
        locator VARCHAR(180) NOT NULL,
        source_url VARCHAR(700) NULL,
        sentence_text TEXT NOT NULL,
        word_count SMALLINT UNSIGNED NOT NULL,
        character_count SMALLINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_literary_sentence_key (external_key),
        KEY idx_literary_sentence_source (source_id),
        CONSTRAINT fk_literary_sentence_source FOREIGN KEY (source_id) REFERENCES literary_sources(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    const [[sentenceSourceUrlColumn]] = await connection.query<IdRow[]>(`
      SELECT 1 AS id FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='literary_sentences' AND COLUMN_NAME='source_url'
    `)
    if (!sentenceSourceUrlColumn) {
      await connection.query(`
        ALTER TABLE literary_sentences
        ADD COLUMN source_url VARCHAR(700) NULL
        AFTER locator
      `)
    }
    await connection.query(`
      CREATE TABLE IF NOT EXISTS literary_targets (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        sentence_id BIGINT NOT NULL,
        verb_id INT NOT NULL,
        tense_id INT NOT NULL,
        person_id INT NOT NULL,
        target_text VARCHAR(255) NOT NULL,
        target_start SMALLINT UNSIGNED NOT NULL,
        target_end SMALLINT UNSIGNED NOT NULL,
        confidence ENUM('high','ambiguous') NOT NULL DEFAULT 'ambiguous',
        ambiguity_reason VARCHAR(500) NULL,
        review_status ENUM('candidate','validated','reserve','rejected') NOT NULL DEFAULT 'candidate',
        review_note VARCHAR(500) NULL,
        reviewed_by INT NULL,
        reviewed_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_literary_target (sentence_id,target_start,target_end,verb_id,tense_id,person_id),
        KEY idx_literary_target_selection (review_status,verb_id,tense_id),
        KEY idx_literary_target_review (review_status,confidence,id),
        CONSTRAINT fk_literary_target_sentence FOREIGN KEY (sentence_id) REFERENCES literary_sentences(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    await connection.query(`
      ALTER TABLE literary_targets
      MODIFY review_status ENUM('candidate','validated','reserve','rejected') NOT NULL DEFAULT 'candidate'
    `)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS literary_corpus_migrations (
        migration_key VARCHAR(120) NOT NULL PRIMARY KEY,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `)
    const reviewWorkflowMigration = 'manual-review-workflow-v2'
    const [[reviewWorkflowApplied]] = await connection.execute<IdRow[]>(
      'SELECT 1 AS id FROM literary_corpus_migrations WHERE migration_key=?',
      [reviewWorkflowMigration],
    )
    if (!reviewWorkflowApplied) {
      await connection.beginTransaction()
      await connection.query(`
        UPDATE literary_targets
        SET review_status='candidate',review_note=NULL,reviewed_by=NULL,reviewed_at=NULL
        WHERE review_status IN ('validated','reserve')
      `)
      await connection.execute(
        'INSERT INTO literary_corpus_migrations (migration_key) VALUES (?)',
        [reviewWorkflowMigration],
      )
      await connection.commit()
      console.info('[database] Corpus littéraire : toutes les phrases non rejetées sont à nouveau à valider manuellement.')
    }

    // Les marques de dialogue isolées n'apportent rien à la question. Le
    // guillemet est traité avant le tiret pour normaliser aussi « » — Texte ».
    for (const leadingMarker of ['» ', '— ']) {
      await connection.query(`
        UPDATE literary_targets target
        INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
        SET target.target_start=target.target_start - 2,
            target.target_end=target.target_end - 2
        WHERE sentence.sentence_text LIKE ?
      `, [`${leadingMarker}%`])
      await connection.query(`
        UPDATE literary_sentences
        SET sentence_text=SUBSTRING(sentence_text,3),
            character_count=CHAR_LENGTH(SUBSTRING(sentence_text,3))
        WHERE sentence_text LIKE ?
      `, [`${leadingMarker}%`])
    }

    // Sur une base distante neuve ou ancienne, l’instantané validé devient la
    // référence avant l’import des anciens corpus candidats. Les checksums des
    // sources étant identiques, les imports historiques sont ensuite ignorés.
    await applyProductionCorpusSnapshot(connection)

    const seeds = [leblancCorpus, verneCorpus, lerouxCorpus, fournierCorpus, stendhalCorpus, coletteCorpus] as CorpusSeed[]
    const editorialSourceKeys = new Set([
      'stendhal-le-rouge-et-le-noir-1830',
      'colette-la-maison-de-claudine-1922',
    ])
    for (const seed of seeds) {
      if (!seed.source?.key || !seed.sentences?.length) {
        console.info('[database] Une source littéraire ne contient aucune donnée à importer.')
        continue
      }

      const [[storedSource]] = await connection.execute<StoredSourceRow[]>(
        'SELECT id,source_checksum AS checksum FROM literary_sources WHERE source_key=?',
        [seed.source.key],
      )
      if (storedSource?.checksum === seed.source.checksum) {
        console.info(`[database] Corpus littéraire déjà à jour : ${seed.source.author}, ${seed.sentences.length} phrases.`)
        continue
      }

      await connection.beginTransaction()
      await connection.execute(`
        INSERT INTO literary_sources
          (source_key,author,title,edition,source_url,source_license,public_domain_basis,language_register,source_checksum)
        VALUES (?,?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE author=VALUES(author),title=VALUES(title),edition=VALUES(edition),
          source_url=VALUES(source_url),source_license=VALUES(source_license),
          public_domain_basis=VALUES(public_domain_basis),language_register=VALUES(language_register),
          source_checksum=VALUES(source_checksum)
      `, [
        seed.source.key, seed.source.author, seed.source.title, seed.source.edition,
        seed.source.sourceUrl, seed.source.license, seed.source.publicDomainBasis,
        seed.source.register || 'soutenu',
        seed.source.checksum,
      ])
      const [[source]] = await connection.execute<IdRow[]>(
        'SELECT id FROM literary_sources WHERE source_key=?',
        [seed.source.key],
      )
      if (!source?.id) throw new Error('Source littéraire introuvable après import.')

      if (editorialSourceKeys.has(seed.source.key)) {
        // Cette sélection entièrement éditoriale est remplacée en bloc lorsque
        // son checksum évolue, afin qu'aucune ancienne phrase écartée ne subsiste.
        await connection.execute(`
          DELETE target FROM literary_targets target
          INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
          WHERE sentence.source_id=?
        `, [source.id])
        await connection.execute('DELETE FROM literary_sentences WHERE source_id=?', [source.id])
      } else {
        // Les décisions éditoriales sont conservées. Les candidates et les anciennes
        // validations automatiques sont resynchronisées avec la version de l’extracteur.
        await connection.execute(`
          DELETE target FROM literary_targets target
          INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
          WHERE sentence.source_id=?
            AND (target.review_status='candidate'
              OR (target.review_status='validated' AND target.reviewed_at IS NULL))
        `, [source.id])
      }

      let importedTargets = 0
      for (const sentence of seed.sentences) {
        await connection.execute(`
          INSERT INTO literary_sentences
            (source_id,external_key,chapter,locator,source_url,sentence_text,word_count,character_count)
          VALUES (?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE chapter=VALUES(chapter),locator=VALUES(locator),source_url=VALUES(source_url),
            sentence_text=VALUES(sentence_text),word_count=VALUES(word_count),character_count=VALUES(character_count)
        `, [
          source.id, sentence.key, sentence.chapter, sentence.locator, sentence.sourceUrl || null,
          sentence.text, sentence.wordCount, sentence.characterCount,
        ])
        const [[storedSentence]] = await connection.execute<IdRow[]>(
          'SELECT id FROM literary_sentences WHERE external_key=?',
          [sentence.key],
        )
        if (!storedSentence?.id) throw new Error(`Phrase littéraire introuvable : ${sentence.key}`)

        for (const target of sentence.targets) {
          const [result] = await connection.execute<ResultSetHeader>(`
            INSERT IGNORE INTO literary_targets
              (sentence_id,verb_id,tense_id,person_id,target_text,target_start,target_end,confidence,ambiguity_reason,review_status)
            VALUES (?,?,?,?,?,?,?,?,?,'candidate')
          `, [
            storedSentence.id, target.verbId, target.tenseId, target.personId,
            target.form, target.start, target.end, target.confidence, target.ambiguityReason,
          ])
          importedTargets += Number(result.affectedRows)
        }
      }
      await connection.execute(`
        DELETE sentence FROM literary_sentences sentence
        LEFT JOIN literary_targets target ON target.sentence_id=sentence.id
        WHERE sentence.source_id=? AND target.id IS NULL
      `, [source.id])
      await connection.commit()
      console.info(`[database] Corpus littéraire prêt : ${seed.source.author}, ${seed.sentences.length} phrases, ${importedTargets} nouvelle(s) analyse(s).`)
    }

    // Ce corpus ne contient que la sélection rare relue, puis passée par le
    // filtre jeunesse. Le JSON versionné constitue donc la décision éditoriale.
    await connection.query(`
      UPDATE literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      SET target.review_status='validated',
          target.review_note='Validation éditoriale : forme rare et contexte adapté aux enfants et aux jeunes.',
          target.reviewed_at=COALESCE(target.reviewed_at,CURRENT_TIMESTAMP)
      WHERE source.source_key='stendhal-le-rouge-et-le-noir-1830'
        AND target.review_status='candidate'
    `)
    await connection.query(`
      UPDATE literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      SET target.review_status='validated',
          target.review_note='Validation éditoriale : registre courant, analyse sûre et contexte adapté aux enfants et aux jeunes.',
          target.reviewed_at=COALESCE(target.reviewed_at,CURRENT_TIMESTAMP)
      WHERE source.source_key='colette-la-maison-de-claudine-1922'
        AND target.review_status='candidate'
        AND target.confidence='high'
    `)
    const [deduplicationRows] = await connection.query<DeduplicationRow[]>(`
      SELECT target.id,target.verb_id AS verbId,target.tense_id AS tenseId,
             target.person_id AS personId,sentence.source_id AS sourceId,
             target.confidence,sentence.word_count AS wordCount,
             sentence.sentence_text AS sentenceText,target.review_status AS reviewStatus,
             target.reviewed_at AS reviewedAt
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
    `)
    const duplicateSelections = new Map<string, DeduplicationRow[]>()
    for (const row of deduplicationRows) {
      const normalizedText = row.sentenceText.normalize('NFC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase('fr')
      const key = `${row.verbId}:${row.tenseId}:${row.personId}:${normalizedText}`
      duplicateSelections.set(key, [...(duplicateSelections.get(key) || []), row])
    }
    const statusPriority = { rejected: 0, reserve: 1, validated: 2, candidate: 3 }
    const duplicateTargetIds: number[] = []
    for (const rows of duplicateSelections.values()) {
      if (rows.length < 2) continue
      rows.sort((left, right) => {
        const reviewed = Number(!left.reviewedAt) - Number(!right.reviewedAt)
        const status = statusPriority[left.reviewStatus] - statusPriority[right.reviewStatus]
        const confidence = Number(left.confidence === 'ambiguous') - Number(right.confidence === 'ambiguous')
        return reviewed || status || confidence || Number(left.id) - Number(right.id)
      })
      duplicateTargetIds.push(...rows.slice(1).map(row => Number(row.id)))
    }
    for (let start = 0; start < duplicateTargetIds.length; start += 500) {
      const ids = duplicateTargetIds.slice(start, start + 500)
      await connection.query(`DELETE FROM literary_targets WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
    }
    if (duplicateTargetIds.length) {
      console.info(`[database] Corpus littéraire : ${duplicateTargetIds.length} répétition(s) supprimée(s).`)
    }

    const [candidateRows] = await connection.query<CandidateQuotaRow[]>(`
      SELECT target.id,target.verb_id AS verbId,target.tense_id AS tenseId,
             target.person_id AS personId,sentence.source_id AS sourceId,
             target.confidence,sentence.word_count AS wordCount
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      WHERE target.review_status='candidate'
    `)
    const [validatedRows] = await connection.query<ValidatedQuotaRow[]>(`
      SELECT verb_id AS verbId,tense_id AS tenseId,person_id AS personId,COUNT(*) AS count
      FROM literary_targets
      WHERE review_status='validated'
      GROUP BY verb_id,tense_id,person_id
    `)
    const validatedCounts = new Map(validatedRows.map(row => [
      `${row.verbId}:${row.tenseId}:${row.personId}`,
      Number(row.count),
    ]))
    const selections = new Map<string, Map<number, CandidateQuotaRow[]>>()
    for (const row of candidateRows) {
      const key = `${row.verbId}:${row.tenseId}:${row.personId}`
      const sources = selections.get(key) || new Map<number, CandidateQuotaRow[]>()
      const rows = sources.get(Number(row.sourceId)) || []
      rows.push(row)
      sources.set(Number(row.sourceId), rows)
      selections.set(key, sources)
    }

    const rejectedCandidateIds: number[] = []
    for (const [selectionKey, sources] of selections) {
      const queues = [...sources.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, rows]) => rows.sort((left, right) => {
          const confidence = Number(left.confidence === 'ambiguous') - Number(right.confidence === 'ambiguous')
          return confidence || Number(left.wordCount) - Number(right.wordCount) || Number(left.id) - Number(right.id)
        }))
      const retained = new Set<number>()
      const availableSlots = Math.max(0, LITERARY_QUOTA_PER_SELECTION - (validatedCounts.get(selectionKey) || 0))
      while (retained.size < availableSlots && queues.some(queue => queue.length)) {
        for (const queue of queues) {
          const row = queue.shift()
          if (row) retained.add(Number(row.id))
          if (retained.size >= availableSlots) break
        }
      }
      for (const queue of queues) {
        rejectedCandidateIds.push(...queue.map(row => Number(row.id)))
      }
    }
    for (let start = 0; start < rejectedCandidateIds.length; start += 500) {
      const ids = rejectedCandidateIds.slice(start, start + 500)
      await connection.query(`DELETE FROM literary_targets WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
    }
    if (rejectedCandidateIds.length) {
      console.info(`[database] Quota littéraire global appliqué : ${rejectedCandidateIds.length} candidate(s) excédentaire(s) retirée(s).`)
    }

    // Allège la file de validation pour les temps déjà abondants, sans toucher
    // aux temps et modes rares. Les validations manuelles comptent dans le quota.
    const [diversityCandidates] = await connection.query<DiversityCandidateRow[]>(`
      SELECT target.id,target.verb_id AS verbId,target.tense_id AS tenseId,
             target.person_id AS personId,sentence.source_id AS sourceId,
             target.confidence,sentence.word_count AS wordCount,
             mode.name AS mode,tense.name AS tense
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      INNER JOIN modes mode ON mode.id=tense.mode_id
      WHERE target.review_status='candidate'
    `)
    const frequentSelections = new Map<string, Map<number, DiversityCandidateRow[]>>()
    for (const row of diversityCandidates) {
      const quota = FREQUENT_TENSE_QUOTAS.get(`${row.mode}:${row.tense}`)
      if (!quota) continue
      const key = `${row.verbId}:${row.tenseId}:${row.personId}`
      const sources = frequentSelections.get(key) || new Map<number, DiversityCandidateRow[]>()
      const rows = sources.get(Number(row.sourceId)) || []
      rows.push(row)
      sources.set(Number(row.sourceId), rows)
      frequentSelections.set(key, sources)
    }
    const diversityRejectedIds: number[] = []
    for (const [selectionKey, sources] of frequentSelections) {
      const first = sources.values().next().value?.[0]
      if (!first) continue
      const quota = FREQUENT_TENSE_QUOTAS.get(`${first.mode}:${first.tense}`) || 0
      const availableSlots = Math.max(0, quota - (validatedCounts.get(selectionKey) || 0))
      const queues = [...sources.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, rows]) => rows.sort((left, right) => {
          const confidence = Number(left.confidence === 'ambiguous') - Number(right.confidence === 'ambiguous')
          const contextLength = Math.abs(Number(left.wordCount) - 16) - Math.abs(Number(right.wordCount) - 16)
          return confidence || contextLength || Number(left.id) - Number(right.id)
        }))
      const retained = new Set<number>()
      while (retained.size < availableSlots && queues.some(queue => queue.length)) {
        for (const queue of queues) {
          const row = queue.shift()
          if (row) retained.add(Number(row.id))
          if (retained.size >= availableSlots) break
        }
      }
      for (const queue of queues) diversityRejectedIds.push(...queue.map(row => Number(row.id)))
    }
    for (let start = 0; start < diversityRejectedIds.length; start += 500) {
      const ids = diversityRejectedIds.slice(start, start + 500)
      await connection.query(`
        UPDATE literary_targets
        SET review_status='rejected',
            review_note=COALESCE(review_note,'Écartée automatiquement : combinaison fréquente déjà suffisamment représentée.')
        WHERE review_status='candidate' AND id IN (${ids.map(() => '?').join(',')})
      `, ids)
    }
    if (diversityRejectedIds.length) {
      console.info(`[database] Diversité du corpus : ${diversityRejectedIds.length} candidate(s) fréquente(s) écartée(s), temps rares conservés.`)
    }
    await connection.query(`
      DELETE sentence FROM literary_sentences sentence
      LEFT JOIN literary_targets target ON target.sentence_id=sentence.id
      WHERE target.id IS NULL
    `)
  }
  catch (error) {
    try { await connection.rollback() } catch { /* aucune transaction active */ }
    console.error('[database] Échec de la migration automatique du corpus littéraire.', error)
  }
  finally {
    connection.release()
  }
})
