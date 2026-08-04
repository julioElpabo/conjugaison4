import { pathToFileURL } from 'node:url'
import mysql from 'mysql2/promise'

export const LITERARY_ENRICHMENT_MIGRATION_KEY = 'validated-literary-enrichment-v1'
export const MAX_INFINITIVE_TARGETS = 50

const rareModes = new Set(['impératif', 'subjonctif', 'conditionnel'])
const rareIndicativeTenses = new Set(['futur antérieur', 'passé antérieur'])
const infinitiveCues = new Set([
  'à', 'afin', 'après', 'avant', 'de', 'd’', 'pour', 'sans',
  'aime', 'aimait', 'aimerait', 'allaient', 'allait', 'allons', 'allez', 'aller', 'devait', 'devra',
  'doit', 'doivent', 'fallait', 'faut', 'peut', 'peuvent', 'pouvait', 'pourrait', 'sait', 'savent',
  'va', 'vais', 'vont', 'voudrait', 'voulaient', 'voulait', 'voulons', 'voulez', 'veut', 'veux',
])

const apostrophes = value => String(value || '').replace(/[‘ʼ‛`´']/gu, '’')
const normalized = value => apostrophes(value).trim().toLocaleLowerCase('fr-CH')
const folded = value => normalized(value).normalize('NFD').replace(/\p{Diacritic}/gu, '')
const beginsWithVowel = (value) => 'aeiouy'.includes(value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase())

function subjectPrefix(pronoun, form, mode) {
  if (normalized(mode) === 'impératif') return ''
  const subject = pronoun === 'je' && beginsWithVowel(form) ? 'j’' : `${pronoun} `
  return normalized(mode) === 'subjonctif'
    ? `${beginsWithVowel(pronoun) ? 'qu’' : 'que '}${subject}`
    : subject
}

function occurrences(haystack, needle) {
  const positions = []
  let offset = 0
  while (needle && (offset = haystack.indexOf(needle, offset)) >= 0) {
    const end = offset + needle.length
    const before = haystack[offset - 1] || ''
    const after = haystack[end] || ''
    if (!/[\p{L}\p{N}]/u.test(before) && !/[\p{L}\p{N}]/u.test(after)) positions.push([offset, end])
    offset = Math.max(end, offset + 1)
  }
  return positions
}

function tokenized(sentence) {
  return [...sentence.matchAll(/[\p{L}\p{N}]+(?:[’'’-][\p{L}\p{N}]+)*/gu)]
    .map(match => ({ text: match[0], key: normalized(match[0]), start: Number(match.index), end: Number(match.index) + match[0].length }))
}

function relevantInfinitive(tokens, index, infinitiveKeys) {
  const previous = tokens[index - 1]?.key || ''
  const beforePrevious = tokens[index - 2]?.key || ''
  if (infinitiveCues.has(previous)) return true
  if (previous === 'et' && infinitiveKeys.has(beforePrevious)) return true
  return previous === 'de' && ['afin', 'avant', 'après'].includes(beforePrevious)
}

export async function inspectValidatedLiteraryEnrichment(connection) {
  const [sentences] = await connection.query(`
    SELECT sentence.id,sentence.sentence_text AS text,sentence.source_id
    FROM literary_sentences sentence
    WHERE EXISTS (
      SELECT 1 FROM literary_targets target
      WHERE target.sentence_id=sentence.id AND target.review_status='validated'
    )
    ORDER BY sentence.id
  `)
  const [existingTargets] = await connection.query(`
    SELECT sentence_id,target_start,target_end
    FROM literary_targets
    WHERE review_status='validated'
  `)
  const [verbs] = await connection.query(`
    SELECT id,infinitif,\`participe_passé\` AS pastParticiple
    FROM verbes WHERE est_archive=0 ORDER BY id
  `)
  const [rareForms] = await connection.query(`
    SELECT vc.verbe_id AS verbId,vc.temp_id AS tenseId,vc.personne_id AS personId,
           vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,p.pronom,
           m.name AS mode,t.name AS tense,t.isTempsCompose AS isCompound
    FROM verbesconjugues vc
    INNER JOIN personnes p ON p.id=vc.personne_id
    INNER JOIN temps t ON t.id=vc.temp_id
    INNER JOIN modes m ON m.id=t.mode_id
    WHERE vc.conjugaison1<>''
      AND (m.name IN ('impératif','subjonctif','conditionnel')
        OR (m.name='indicatif' AND t.name IN ('futur antérieur','passé antérieur')))
  `)

  const occupied = new Map()
  for (const target of existingTargets) {
    const spans = occupied.get(Number(target.sentence_id)) || new Set()
    spans.add(`${target.target_start}:${target.target_end}`)
    occupied.set(Number(target.sentence_id), spans)
  }

  const infinitivesByKey = new Map()
  const pastParticiples = new Set()
  const interveningAdverbs = new Set(['ainsi', 'assez', 'aussitôt', 'beaucoup', 'bien', 'déjà', 'encore', 'fort', 'même', 'parfaitement', 'simplement', 'toujours', 'trop'])
  for (const verb of verbs) {
    const key = normalized(verb.infinitif)
    const rows = infinitivesByKey.get(key) || []
    rows.push({ verbId: Number(verb.id), infinitive: verb.infinitif })
    infinitivesByKey.set(key, rows)
    for (const part of String(verb.pastParticiple || '').split(/[-/,;|]/gu).map(normalized).filter(Boolean)) {
      pastParticiples.add(folded(part))
      pastParticiples.add(folded(`${part}e`))
      pastParticiples.add(folded(`${part}s`))
      pastParticiples.add(folded(`${part}es`))
    }
  }
  const infinitiveKeys = new Set(infinitivesByKey.keys())
  const followedByParticiple = (tokens, index) => {
    let nextIndex = index + 1
    let skipped = 0
    while (skipped < 3 && interveningAdverbs.has(tokens[nextIndex]?.key || '')) {
      nextIndex += 1
      skipped += 1
    }
    const rawNext = normalized(tokens[nextIndex]?.text || '')
    return pastParticiples.has(folded(rawNext))
      || /(?:é|i|is|it|u|us|ut|ert|int)(?:e|s|es)?$/u.test(rawNext)
  }

  const rareDisplays = new Map()
  for (const row of rareForms) {
    for (const form of new Set([row.conjugaison1, row.conjugaison2, row.conjugaison3].map(value => String(value || '').trim()).filter(Boolean))) {
      const display = `${subjectPrefix(row.pronom, form, row.mode)}${form}`
      const key = normalized(display)
      const candidates = rareDisplays.get(key) || []
      candidates.push({
        verbId: Number(row.verbId), tenseId: Number(row.tenseId), personId: Number(row.personId),
        targetText: form, display, mode: row.mode, tense: row.tense, isCompound: Boolean(row.isCompound),
      })
      rareDisplays.set(key, candidates)
    }
  }

  const infinitiveCandidates = []
  const rareCandidates = []
  for (const sentence of sentences) {
    const text = String(sentence.text)
    const searchable = normalized(text)
    const spans = occupied.get(Number(sentence.id)) || new Set()
    const tokens = tokenized(text)

    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index]
      const matches = infinitivesByKey.get(token.key) || []
      if (matches.length !== 1 || !relevantInfinitive(tokens, index, infinitiveKeys)) continue
      if (['avoir', 'être'].includes(token.key) && followedByParticiple(tokens, index)) continue
      const span = `${token.start}:${token.end}`
      if (spans.has(span)) continue
      infinitiveCandidates.push({
        sentenceId: Number(sentence.id), sourceId: Number(sentence.source_id), verbId: matches[0].verbId,
        personId: 6, targetText: text.slice(token.start, token.end), targetStart: token.start, targetEnd: token.end,
        mode: 'infinitif', tense: 'présent', confidence: 'high', sentenceText: text,
      })
    }

    const sentenceRare = []
    for (const [displayKey, candidates] of rareDisplays) {
      const grammaticalCandidates = [...new Map(candidates.map(candidate => [
        `${candidate.verbId}:${candidate.tenseId}:${candidate.personId}`, candidate,
      ])).values()]
      if (grammaticalCandidates.length !== 1) continue
      for (const [start, end] of occurrences(searchable, displayKey)) {
        const candidate = grammaticalCandidates[0]
        if (candidate.mode === 'impératif') {
          const before = text.slice(0, start).trimEnd()
          if (before && !/[.!?…:;—–-]$/u.test(before)) continue
          if (/^entre temps\b/iu.test(text)) continue
          if (/\?\s*$/u.test(text)
            && (/(?:-|–)(?:tu|vous)$/iu.test(candidate.targetText) || /^-(?:tu|vous)\b/iu.test(text.slice(end)))) continue
        }
        const targetLength = candidate.targetText.length
        const targetStart = end - targetLength
        const targetContext = normalized(text.slice(Math.max(0, targetStart - 50), targetStart))
        if (candidate.mode === 'subjonctif'
          && /(?:tandis|alors) que (?:j’|je|tu|il|elle|on|nous|vous|ils|elles)$/u.test(targetContext)) continue
        if (candidate.mode === 'subjonctif' && /c’est bien\b/u.test(targetContext)) continue
        if (candidate.mode === 'conditionnel' && candidate.tense === 'passé 2' && /s’il\s*$/u.test(targetContext)) continue
        const span = `${targetStart}:${end}`
        if (spans.has(span)) continue
        if (!candidate.isCompound && [1, 4].includes(candidate.verbId)) {
          const tokenIndex = tokens.findIndex(token => token.end >= end)
          if (tokenIndex >= 0 && followedByParticiple(tokens, tokenIndex)) continue
        }
        sentenceRare.push({
          sentenceId: Number(sentence.id), sourceId: Number(sentence.source_id),
          verbId: candidate.verbId, tenseId: candidate.tenseId, personId: candidate.personId,
          targetText: text.slice(targetStart, end), targetStart, targetEnd: end,
          mode: candidate.mode, tense: candidate.tense, confidence: 'high', isCompound: candidate.isCompound,
          displayStart: start, sentenceText: text,
        })
      }
    }
    sentenceRare.sort((left, right) => (right.targetEnd - right.displayStart) - (left.targetEnd - left.displayStart))
    const retained = []
    for (const candidate of sentenceRare) {
      if (retained.some(other => candidate.displayStart >= other.displayStart && candidate.targetEnd <= other.targetEnd)) continue
      retained.push(candidate)
    }
    rareCandidates.push(...retained)
  }

  const infinitiveByVerb = new Map()
  const selectedInfinitives = []
  const queues = [...Map.groupBy(
    infinitiveCandidates.sort((left, right) => left.sentenceId - right.sentenceId || left.targetStart - right.targetStart),
    candidate => candidate.sourceId,
  ).values()]
  while (selectedInfinitives.length < MAX_INFINITIVE_TARGETS && queues.some(queue => queue.length)) {
    for (const queue of queues) {
      let candidate
      while (queue.length && !candidate) {
        const next = queue.shift()
        const count = infinitiveByVerb.get(next.verbId) || 0
        if (count < 3 && !selectedInfinitives.some(item => item.sentenceId === next.sentenceId)) candidate = next
      }
      if (!candidate) continue
      infinitiveByVerb.set(candidate.verbId, (infinitiveByVerb.get(candidate.verbId) || 0) + 1)
      selectedInfinitives.push(candidate)
      if (selectedInfinitives.length >= MAX_INFINITIVE_TARGETS) break
    }
  }

  return { sentences: sentences.length, infinitiveCandidates, selectedInfinitives, rareCandidates }
}

async function ensureInfinitiveTense(connection) {
  const [[existingMode]] = await connection.query("SELECT id FROM modes WHERE code='infinitive' OR name='infinitif' ORDER BY id LIMIT 1")
  let modeId = Number(existingMode?.id || 0)
  if (!modeId) {
    const [result] = await connection.query("INSERT INTO modes (code,name,`order`) VALUES ('infinitive','infinitif',60)")
    modeId = Number(result.insertId)
  }
  const [[existingTense]] = await connection.query("SELECT id FROM temps WHERE mode_id=? AND (code='present' OR name='présent') ORDER BY id LIMIT 1", [modeId])
  if (existingTense?.id) return Number(existingTense.id)
  const [result] = await connection.query("INSERT INTO temps (mode_id,code,name,isTempsCompose,selected) VALUES (?,'present','présent',0,0)", [modeId])
  return Number(result.insertId)
}

export async function applyValidatedLiteraryEnrichment(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS literary_corpus_migrations (
      migration_key VARCHAR(120) NOT NULL PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  const [[applied]] = await connection.query('SELECT 1 AS applied FROM literary_corpus_migrations WHERE migration_key=?', [LITERARY_ENRICHMENT_MIGRATION_KEY])
  if (applied) return { alreadyApplied: true }
  const inspection = await inspectValidatedLiteraryEnrichment(connection)
  const infinitiveTenseId = await ensureInfinitiveTense(connection)
  await connection.beginTransaction()
  try {
    let insertedInfinitives = 0
    let insertedRareForms = 0
    const insert = async (candidate, tenseId) => {
      const [result] = await connection.execute(`
        INSERT IGNORE INTO literary_targets
          (sentence_id,verb_id,tense_id,person_id,target_text,target_start,target_end,
           confidence,ambiguity_reason,review_status,review_note,reviewed_at)
        VALUES (?,?,?,?,?,?,?,'high',NULL,'validated',?,CURRENT_TIMESTAMP)
      `, [
        candidate.sentenceId, candidate.verbId, tenseId, candidate.personId,
        candidate.targetText, candidate.targetStart, candidate.targetEnd,
        'Ajout déterministe après validation du contexte littéraire.',
      ])
      return Number(result.affectedRows)
    }
    for (const candidate of inspection.selectedInfinitives) insertedInfinitives += await insert(candidate, infinitiveTenseId)
    for (const candidate of inspection.rareCandidates) insertedRareForms += await insert(candidate, candidate.tenseId)
    await connection.execute('INSERT INTO literary_corpus_migrations (migration_key) VALUES (?)', [LITERARY_ENRICHMENT_MIGRATION_KEY])
    await connection.commit()
    return { ...inspection, infinitiveTenseId, insertedInfinitives, insertedRareForms, alreadyApplied: false }
  } catch (error) {
    await connection.rollback()
    throw error
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
  })
  try {
    const result = apply
      ? await applyValidatedLiteraryEnrichment(connection)
      : await inspectValidatedLiteraryEnrichment(connection)
    if (process.argv.includes('--summary') && !result.alreadyApplied) {
      const grouped = values => Object.fromEntries([...Map.groupBy(values, item => `${item.mode} · ${item.tense}`)]
        .map(([key, items]) => [key, items.length]))
      console.log(JSON.stringify({
        sentences: result.sentences,
        infinitiveCandidateCount: result.infinitiveCandidates.length,
        selectedInfinitiveCount: result.selectedInfinitives.length,
        selectedInfinitivesBySource: Object.fromEntries([...Map.groupBy(result.selectedInfinitives, item => item.sourceId)]
          .map(([key, items]) => [key, items.length])),
        rareCandidateCount: result.rareCandidates.length,
        rareCandidatesByCategory: grouped(result.rareCandidates),
        selectedInfinitives: result.selectedInfinitives,
        rareCandidates: result.rareCandidates,
      }, null, 2))
    } else {
      console.log(JSON.stringify(result, null, 2))
    }
  } finally {
    await connection.end()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
