import { createHash } from 'node:crypto'
import { rename, writeFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const outputPath = 'shared/data/literary-corpus-production.json'
const temporaryPath = `${outputPath}.tmp`

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  const [statusRows] = await database.query(`
    SELECT review_status AS status,COUNT(*) AS count
    FROM literary_targets
    GROUP BY review_status
  `)
  const unexpectedStatuses = statusRows.filter(row => row.status !== 'validated' && Number(row.count) > 0)
  if (unexpectedStatuses.length) {
    throw new Error(`Le corpus contient encore des formes non validées : ${JSON.stringify(unexpectedStatuses)}`)
  }

  const [[orphanRow]] = await database.query(`
    SELECT COUNT(*) AS count
    FROM literary_sentences sentence
    LEFT JOIN literary_targets target ON target.sentence_id=sentence.id
    WHERE target.id IS NULL
  `)
  if (Number(orphanRow.count)) throw new Error(`${orphanRow.count} phrase(s) littéraire(s) orpheline(s).`)

  const [sourceRows] = await database.query(`
    SELECT source_key AS sourceKey,author,title,edition,source_url AS sourceUrl,
           source_license AS license,public_domain_basis AS publicDomainBasis,
           language_register AS languageRegister,source_checksum AS sourceChecksum
    FROM literary_sources
    ORDER BY source_key
  `)
  const [sentenceRows] = await database.query(`
    SELECT source.source_key AS sourceKey,sentence.external_key AS sentenceKey,
           sentence.chapter,sentence.locator,sentence.source_url AS sourceUrl,
           sentence.sentence_text AS text,sentence.word_count AS wordCount,
           sentence.character_count AS characterCount
    FROM literary_sentences sentence
    INNER JOIN literary_sources source ON source.id=sentence.source_id
    ORDER BY source.source_key,sentence.external_key
  `)
  const [targetRows] = await database.query(`
    SELECT sentence.external_key AS sentenceKey,target.verb_id AS verbId,
           verb.infinitif AS verbInfinitive,
           target.tense_id AS tenseId,mode.code AS modeCode,mode.name AS modeName,
           tense.code AS tenseCode,tense.name AS tenseName,
           target.person_id AS personId,person.pronom AS personPronoun,
           target.target_text AS form,target.target_start AS start,target.target_end AS end,
           target.confidence,target.ambiguity_reason AS ambiguityReason,
           target.review_note AS reviewNote
    FROM literary_targets target
    INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
    INNER JOIN verbes verb ON verb.id=target.verb_id
    INNER JOIN temps tense ON tense.id=target.tense_id
    INNER JOIN modes mode ON mode.id=tense.mode_id
    INNER JOIN personnes person ON person.id=target.person_id
    WHERE target.review_status='validated'
    ORDER BY sentence.external_key,target.target_start,target.target_end,
             target.verb_id,target.tense_id,target.person_id
  `)

  const sentencesBySource = new Map(sourceRows.map(source => [source.sourceKey, []]))
  const sentencesByKey = new Map()
  for (const row of sentenceRows) {
    const sentence = {
      key: row.sentenceKey,
      chapter: row.chapter,
      locator: row.locator,
      sourceUrl: row.sourceUrl,
      text: row.text,
      wordCount: Number(row.wordCount),
      characterCount: row.text.length,
      targets: [],
    }
    sentencesBySource.get(row.sourceKey)?.push(sentence)
    sentencesByKey.set(row.sentenceKey, sentence)
  }
  for (const row of targetRows) {
    const sentence = sentencesByKey.get(row.sentenceKey)
    if (!sentence) throw new Error(`Phrase absente pour la cible ${row.sentenceKey}.`)
    const start = Number(row.start)
    const end = Number(row.end)
    sentence.targets.push({
      verbId: Number(row.verbId),
      verbInfinitive: row.verbInfinitive,
      tenseId: Number(row.tenseId),
      modeCode: row.modeCode,
      modeName: row.modeName,
      tenseCode: row.tenseCode,
      tenseName: row.tenseName,
      personId: Number(row.personId),
      personPronoun: row.personPronoun,
      form: sentence.text.slice(start, end),
      start,
      end,
      confidence: row.confidence,
      ambiguityReason: row.ambiguityReason,
      reviewNote: row.reviewNote,
    })
  }

  const sources = sourceRows.map(row => ({
    source: {
      key: row.sourceKey,
      author: row.author,
      title: row.title,
      edition: row.edition,
      sourceUrl: row.sourceUrl,
      license: row.license,
      publicDomainBasis: row.publicDomainBasis,
      languageRegister: row.languageRegister,
      sourceChecksum: row.sourceChecksum,
    },
    sentences: sentencesBySource.get(row.sourceKey) || [],
  }))
  const counts = {
    sources: sources.length,
    sentences: sentenceRows.length,
    targets: targetRows.length,
  }
  const checksum = createHash('sha256')
    .update(JSON.stringify({ schemaVersion: 2, counts, sources }))
    .digest('hex')
  const snapshot = { schemaVersion: 2, checksum, counts, sources }

  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, outputPath)
  console.log(JSON.stringify({ output: outputPath, checksum, ...counts }, null, 2))
} finally {
  await database.end()
}
