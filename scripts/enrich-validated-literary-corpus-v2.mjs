import mysql from 'mysql2/promise'
import { isDirectScriptExecution } from './utils/direct-execution.mjs'

export const LITERARY_ENRICHMENT_V2_MIGRATION_KEY = 'validated-literary-enrichment-v2'
export const MAX_PAST_INFINITIVES = 50
export const MAX_GERUNDS = 50

const apostrophes = value => String(value || '').replace(/[‘ʼ‛`´']/gu, '’')
const normalized = value => apostrophes(value).trim().toLocaleLowerCase('fr-CH')
const folded = value => normalized(value).normalize('NFD').replace(/\p{Diacritic}/gu, '')
const beginsWithVowel = value => 'aeiouyh'.includes(folded(value).charAt(0))

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

function variants(value) {
  return String(value || '').split(/[-/,;|]/gu).map(normalized).filter(Boolean)
}

function agreedParticiples(value) {
  const values = new Set()
  for (const form of variants(value)) {
    values.add(form)
    if (!/[sx]$/u.test(form)) values.add(`${form}s`)
    if (!/e$/u.test(form)) values.add(`${form}e`)
    if (!/es$/u.test(form)) values.add(`${form.replace(/e?$/u, '')}es`)
  }
  return [...values]
}

function auxiliaryFor(verb) {
  const auxiliary = normalized(verb.auxiliary)
  return auxiliary.includes('être') ? 'être' : 'avoir'
}

function subjectPrefixes(pronoun, form, mode) {
  const aliases = {
    il: ['il', 'elle', 'on'],
    ils: ['ils', 'elles'],
  }[pronoun] || [pronoun]
  return aliases.map((alias) => {
    const subject = alias === 'je' && beginsWithVowel(form) ? 'j’' : `${alias} `
    if (mode !== 'subjonctif') return subject
    return `${beginsWithVowel(subject) ? 'qu’' : 'que '}${subject}`
  })
}

function hasPastInfinitiveCue(text, start) {
  const context = normalized(text.slice(Math.max(0, start - 55), start))
  return /(?:^|[\s,;:—–-])(?:après|avant de|afin de|de|d’|pour|sans|semble|semblait|paraît|paraissait|devait|doit|peut|pouvait|croit|croyait|pensait|regrette|regrettait)\s*$/u.test(context)
}

function hasSubjunctiveCue(text, start, tense) {
  if (tense !== 'présent') return true
  const context = normalized(text.slice(Math.max(0, start - 110), start))
  return /(?:afin|avant|bien|encore|malgré|pour|quoique|sans|à moins|de peur|de crainte)\s*$/u.test(context)
    || /(?:faut|fallait|faudrait|faudra|veux|veut|voulait|voudrait|souhaite|souhaitait|désire|désirait|crains|craint|craignait|doute|doutait|regrette|regrettait|ordonne|ordonnait|demande|demandait|prie|priait|exige|exigeait|attends|attendait|empêche|empêchait|possible|nécessaire|heureux|heureuse|étonné|étonnée|surpris|surprise)[^.!?…]{0,45}$/u.test(context)
}

function hasCounterfactualCue(text, start) {
  const context = normalized(text.slice(Math.max(0, start - 180), start))
  return /(?:^|\b)(?:si|sans)\b/u.test(context)
    || /n’(?:eût|eussent|eussions|eussiez) été/u.test(context)
    || /\b(?:aurais|aurait|aurions|auriez|auraient|serais|serait|serions|seriez|seraient)\b[^.!?…]{0,90}\bqu[’e][^.!?…]{0,25}$/u.test(context)
}

function hasSubordinateQue(text, start) {
  const context = normalized(text.slice(Math.max(0, start - 65), start))
  return /(?:que|qu’)[^,.!?…:;]{1,55}$/u.test(context)
}

function hasSubjunctiveCompoundContext(text, start) {
  if (hasSubordinateQue(text, start)) return true
  const context = normalized(text.slice(Math.max(0, start - 45), start))
  return /comme\s+s[’'](?:il|elle|on|ils|elles|je|tu|nous|vous)\s*$/u.test(context)
}

function tokensWithSpans(text) {
  return [...normalized(text).matchAll(/[\p{L}]+(?:[’'-][\p{L}]+)*/gu)]
    .flatMap((match) => {
      const raw = match[0]
      const baseStart = Number(match.index)
      const parts = [...raw.matchAll(/[^’']+/gu)]
      return parts.map(part => ({
        key: part[0],
        start: baseStart + Number(part.index),
        end: baseStart + Number(part.index) + part[0].length,
      }))
    })
}

function balancedSelection(candidates, limit) {
  const selected = []
  const perVerb = new Map()
  const queues = [...Map.groupBy(
    candidates.sort((left, right) => left.sentenceId - right.sentenceId || left.targetStart - right.targetStart),
    candidate => candidate.sourceId,
  ).values()]
  while (selected.length < limit && queues.some(queue => queue.length)) {
    for (const queue of queues) {
      let candidate
      while (queue.length && !candidate) {
        const next = queue.shift()
        const count = perVerb.get(next.verbId) || 0
        if (count < 3 && !selected.some(item => item.sentenceId === next.sentenceId)) candidate = next
      }
      if (!candidate) continue
      perVerb.set(candidate.verbId, (perVerb.get(candidate.verbId) || 0) + 1)
      selected.push(candidate)
      if (selected.length >= limit) break
    }
  }
  return selected
}

export async function inspectValidatedLiteraryEnrichmentV2(connection) {
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
    SELECT id,sentence_id,verb_id,tense_id,person_id,target_text,target_start,target_end
    FROM literary_targets WHERE review_status='validated'
  `)
  const [verbs] = await connection.query(`
    SELECT id,infinitif,\`participe_présent\` AS presentParticiple,
           \`participe_passé\` AS pastParticiple,auxiliaire AS auxiliary
    FROM verbes WHERE est_archive=0 ORDER BY id
  `)
  const [finiteForms] = await connection.query(`
    SELECT vc.verbe_id AS verbId,vc.temp_id AS tenseId,vc.personne_id AS personId,
           vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,p.pronom,
           m.name AS mode,t.name AS tense
    FROM verbesconjugues vc
    INNER JOIN personnes p ON p.id=vc.personne_id
    INNER JOIN temps t ON t.id=vc.temp_id
    INNER JOIN modes m ON m.id=t.mode_id
    WHERE vc.conjugaison1<>'' AND (
      m.name='subjonctif'
      OR (m.name='conditionnel' AND t.name IN ('passé 1','passé 2'))
    )
  `)

  const occupied = new Map()
  const occupiedRanges = new Map()
  const existingDetails = new Map()
  for (const target of existingTargets) {
    const spans = occupied.get(Number(target.sentence_id)) || new Set()
    spans.add(`${target.target_start}:${target.target_end}`)
    occupied.set(Number(target.sentence_id), spans)
    const ranges = occupiedRanges.get(Number(target.sentence_id)) || []
    ranges.push([Number(target.target_start), Number(target.target_end)])
    occupiedRanges.set(Number(target.sentence_id), ranges)
    const details = existingDetails.get(Number(target.sentence_id)) || []
    details.push({
      id: Number(target.id), verbId: Number(target.verb_id), tenseId: Number(target.tense_id),
      personId: Number(target.person_id), targetText: target.target_text,
      start: Number(target.target_start), end: Number(target.target_end),
    })
    existingDetails.set(Number(target.sentence_id), details)
  }

  const pastInfinitiveDisplays = new Map()
  const gerundDisplays = new Map()
  for (const verb of verbs) {
    const verbId = Number(verb.id)
    for (const participle of agreedParticiples(verb.pastParticiple)) {
      const display = `${auxiliaryFor(verb)} ${participle}`
      const entries = pastInfinitiveDisplays.get(display) || []
      entries.push({ verbId, display })
      pastInfinitiveDisplays.set(display, entries)
    }
    for (const participle of variants(verb.presentParticiple)) {
      const display = `en ${participle}`
      const entries = gerundDisplays.get(display) || []
      entries.push({ verbId, display, tense: 'présent' })
      gerundDisplays.set(display, entries)
    }
    for (const participle of agreedParticiples(verb.pastParticiple)) {
      const auxiliary = auxiliaryFor(verb) === 'être' ? 'étant' : 'ayant'
      const display = `en ${auxiliary} ${participle}`
      const entries = gerundDisplays.get(display) || []
      entries.push({ verbId, display, tense: 'passé' })
      gerundDisplays.set(display, entries)
    }
  }

  const finiteDisplays = new Map()
  const bareFiniteDisplays = new Map()
  const compoundFiniteDisplays = new Map()
  for (const row of finiteForms) {
    for (const form of new Set([row.conjugaison1, row.conjugaison2, row.conjugaison3].map(normalized).filter(Boolean))) {
      for (const display of subjectPrefixes(row.pronom, form, row.mode)) {
        const entries = finiteDisplays.get(display) || []
        entries.push({
          verbId: Number(row.verbId), tenseId: Number(row.tenseId), personId: Number(row.personId),
          mode: row.mode, tense: row.tense, form, display,
        })
        finiteDisplays.set(display, entries)
      }
      if ([6, 9].includes(Number(row.personId))) {
        const entries = bareFiniteDisplays.get(form) || []
        entries.push({
          verbId: Number(row.verbId), tenseId: Number(row.tenseId), personId: Number(row.personId),
          mode: row.mode, tense: row.tense, form, display: form,
        })
        bareFiniteDisplays.set(form, entries)
      }
      if (['passé', 'plus-que-parfait', 'passé 1', 'passé 2'].includes(row.tense)) {
        const parts = form.split(/\s+/u)
        if (parts.length === 2) {
          const key = `${parts[0]}:${parts[1]}`
          const entries = compoundFiniteDisplays.get(key) || []
          entries.push({
            verbId: Number(row.verbId), tenseId: Number(row.tenseId), personId: Number(row.personId),
            mode: row.mode, tense: row.tense, form, display: form,
          })
          compoundFiniteDisplays.set(key, entries)
        }
      }
    }
  }

  const pastInfinitiveCandidates = []
  const gerundCandidates = []
  const finiteCandidates = []
  for (const sentence of sentences) {
    const text = String(sentence.text)
    const searchable = normalized(text)
    const spans = occupied.get(Number(sentence.id)) || new Set()
    const ranges = occupiedRanges.get(Number(sentence.id)) || []
    const details = existingDetails.get(Number(sentence.id)) || []
    const base = { sentenceId: Number(sentence.id), sourceId: Number(sentence.source_id), sentenceText: text }
    const overlapsExisting = (start, end) => ranges.some(([otherStart, otherEnd]) => start < otherEnd && end > otherStart)
    const targetBetweenClauseAnd = (start) => {
      const contextStart = Math.max(0, start - 65)
      const context = normalized(text.slice(contextStart, start))
      const queOffset = Math.max(context.lastIndexOf('que '), context.lastIndexOf('qu’'))
      if (queOffset < 0) return false
      const clauseStart = contextStart + queOffset
      return ranges.some(([otherStart, otherEnd]) => otherStart >= clauseStart && otherEnd <= start)
    }

    for (const [display, matches] of pastInfinitiveDisplays) {
      const grammatical = [...new Map(matches.map(item => [item.verbId, item])).values()]
      if (grammatical.length !== 1) continue
      for (const [start, end] of occurrences(searchable, display)) {
        if (!hasPastInfinitiveCue(text, start) || overlapsExisting(start, end)) continue
        pastInfinitiveCandidates.push({
          ...base, ...grammatical[0], personId: 6, targetText: text.slice(start, end),
          targetStart: start, targetEnd: end, mode: 'infinitif', tense: 'passé', confidence: 'high',
        })
      }
    }

    for (const [display, matches] of gerundDisplays) {
      const grammatical = [...new Map(matches.map(item => [`${item.verbId}:${item.tense}`, item])).values()]
      if (grammatical.length !== 1) continue
      for (const [start, end] of occurrences(searchable, display)) {
        if (overlapsExisting(start, end)) continue
        gerundCandidates.push({
          ...base, ...grammatical[0], personId: 6, targetText: text.slice(start, end),
          targetStart: start, targetEnd: end, mode: 'gérondif', confidence: 'high',
        })
      }
    }

    for (const [display, matches] of finiteDisplays) {
      const grammatical = [...new Map(matches.map(item => [
        `${item.verbId}:${item.tenseId}:${item.personId}`, item,
      ])).values()]
      if (grammatical.length !== 1) continue
      const candidate = grammatical[0]
      for (const [displayStart, end] of occurrences(searchable, display)) {
        const targetStart = end - candidate.form.length
        if (overlapsExisting(targetStart, end)) continue
        if (candidate.mode === 'subjonctif' && !hasSubjunctiveCue(text, displayStart, candidate.tense)) continue
        if (candidate.mode === 'conditionnel' && candidate.tense === 'passé 2') {
          const immediateContext = searchable.slice(Math.max(0, displayStart - 5), displayStart)
          if (/(?:que|qu’)\s*$/u.test(immediateContext) || !hasCounterfactualCue(text, displayStart)) continue
        }
        finiteCandidates.push({
          ...base, ...candidate, targetText: text.slice(targetStart, end),
          targetStart, targetEnd: end, confidence: 'high',
        })
      }
    }

    const tokens = tokensWithSpans(text)
    const allowedMiddleTokens = new Set(['déjà', 'encore', 'jamais', 'pas', 'peut-être', 'point', 'sans', 'si', 'tôt', 'toujours', 'trop', 'depuis', 'longtemps', 'bien'])
    for (let leftIndex = 0; leftIndex < tokens.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex <= Math.min(tokens.length - 1, leftIndex + 4); rightIndex += 1) {
        const middle = tokens.slice(leftIndex + 1, rightIndex)
        if (middle.some(token => !allowedMiddleTokens.has(token.key))) continue
        const matches = compoundFiniteDisplays.get(`${tokens[leftIndex].key}:${tokens[rightIndex].key}`) || []
        const categories = Map.groupBy(matches, item => `${item.mode}:${item.tense}`)
        for (const candidates of categories.values()) {
          const grammatical = [...new Map(candidates.map(item => [
            `${item.verbId}:${item.tenseId}:${item.personId}`, item,
          ])).values()]
          if (grammatical.length !== 1) continue
          const candidate = grammatical[0]
          const start = tokens[leftIndex].start
          const end = tokens[rightIndex].end
          if (candidate.mode === 'subjonctif' && !hasSubjunctiveCompoundContext(text, start)) continue
          if (candidate.mode === 'conditionnel' && candidate.tense === 'passé 2') {
            const context = normalized(text.slice(Math.max(0, start - 45), start))
            if (/comme\s+s[’'][^.!?…]{0,20}$/u.test(context) || !hasCounterfactualCue(text, start)) continue
          }
          const overlaps = details.filter(item => start < item.end && end > item.start)
          if (overlaps.some(item => item.start === start && item.end === end
            && item.verbId === candidate.verbId && item.tenseId === candidate.tenseId)) continue
          let replacementTargetId
          if (overlaps.length) {
            if (overlaps.length !== 1) continue
            const [overlap] = overlaps
            const replaceableAuxiliary = [1, 4].includes(overlap.verbId)
              && overlap.start >= start && overlap.end <= end
            const replaceableClassification = overlap.start === start && overlap.end === end
            if (!replaceableAuxiliary && !replaceableClassification) continue
            replacementTargetId = overlap.id
          }
          finiteCandidates.push({
            ...base, ...candidate, targetText: text.slice(start, end),
            targetStart: start, targetEnd: end, confidence: 'high',
            ...(replacementTargetId ? { replacementTargetId } : {}),
          })
        }
      }
    }

    for (const [display, matches] of bareFiniteDisplays) {
      const categories = Map.groupBy(matches, item => `${item.mode}:${item.tense}`)
      for (const candidates of categories.values()) {
        const grammatical = [...new Map(candidates.map(item => [
          `${item.verbId}:${item.tenseId}:${item.personId}`, item,
        ])).values()]
        if (grammatical.length !== 1) continue
        const candidate = grammatical[0]
        for (const [start, end] of occurrences(searchable, display)) {
          if (overlapsExisting(start, end)) continue
          const alreadyFound = finiteCandidates.some(item => item.sentenceId === Number(sentence.id)
            && item.targetStart === start && item.targetEnd === end
            && item.verbId === candidate.verbId && item.tenseId === candidate.tenseId)
          if (alreadyFound) continue
          if (candidate.mode === 'subjonctif') {
            if (!hasSubordinateQue(text, start) || !hasSubjunctiveCue(text, start, candidate.tense)) continue
            if (!candidate.form.includes(' ') && targetBetweenClauseAnd(start)) continue
          } else if (candidate.tense === 'passé 2') {
            if (!hasCounterfactualCue(text, start)) continue
          }
          finiteCandidates.push({
            ...base, ...candidate, targetText: text.slice(start, end),
            targetStart: start, targetEnd: end, confidence: 'high',
          })
        }
      }
    }
  }

  const unique = values => [...new Map(values.map(item => [
    `${item.sentenceId}:${item.targetStart}:${item.targetEnd}:${item.verbId}:${item.tense}`, item,
  ])).values()]
  const selectedPastInfinitives = balancedSelection(unique(pastInfinitiveCandidates), MAX_PAST_INFINITIVES)
  const selectedGerunds = balancedSelection(unique(gerundCandidates), MAX_GERUNDS)
  const finiteLongestFirst = unique(finiteCandidates)
    .sort((left, right) => left.sentenceId - right.sentenceId
      || left.targetStart - right.targetStart || right.targetEnd - left.targetEnd)
  const selectedFiniteForms = finiteLongestFirst
    .filter((candidate, index, values) => !values.slice(0, index).some(other =>
      candidate.sentenceId === other.sentenceId
      && candidate.targetStart >= other.targetStart && candidate.targetEnd <= other.targetEnd))
    .filter(candidate => !selectedPastInfinitives.some(item => item.sentenceId === candidate.sentenceId
      && item.targetStart === candidate.targetStart && item.targetEnd === candidate.targetEnd))

  return {
    sentences: sentences.length,
    pastInfinitiveCandidates: unique(pastInfinitiveCandidates), selectedPastInfinitives,
    gerundCandidates: unique(gerundCandidates), selectedGerunds, selectedFiniteForms,
  }
}

async function ensurePastInfinitiveTense(connection) {
  const [[mode]] = await connection.query("SELECT id FROM modes WHERE name='infinitif' ORDER BY id LIMIT 1")
  if (!mode?.id) throw new Error('Le mode infinitif est absent.')
  const [[existing]] = await connection.query("SELECT id FROM temps WHERE mode_id=? AND name='passé' ORDER BY id LIMIT 1", [mode.id])
  if (existing?.id) return Number(existing.id)
  const [result] = await connection.query("INSERT INTO temps (mode_id,code,name,isTempsCompose,selected) VALUES (?,'past','passé',1,0)", [mode.id])
  return Number(result.insertId)
}

async function tenseIds(connection) {
  const [rows] = await connection.query(`
    SELECT t.id,m.name AS mode,t.name AS tense FROM temps t
    INNER JOIN modes m ON m.id=t.mode_id
    WHERE m.name='gérondif'
  `)
  return new Map(rows.map(row => [`${row.mode}:${row.tense}`, Number(row.id)]))
}

export async function applyValidatedLiteraryEnrichmentV2(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS literary_corpus_migrations (
      migration_key VARCHAR(120) NOT NULL PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)
  const [[applied]] = await connection.query(
    'SELECT 1 AS applied FROM literary_corpus_migrations WHERE migration_key=?',
    [LITERARY_ENRICHMENT_V2_MIGRATION_KEY],
  )
  if (applied) return { alreadyApplied: true }
  const inspection = await inspectValidatedLiteraryEnrichmentV2(connection)
  const pastInfinitiveTenseId = await ensurePastInfinitiveTense(connection)
  const nonFiniteTenseIds = await tenseIds(connection)
  await connection.beginTransaction()
  try {
    const inserted = { pastInfinitives: 0, gerunds: 0, finiteForms: 0 }
    const insert = async (candidate, tenseId) => {
      const [result] = await connection.execute(`
        INSERT IGNORE INTO literary_targets
          (sentence_id,verb_id,tense_id,person_id,target_text,target_start,target_end,
           confidence,ambiguity_reason,review_status,review_note,reviewed_at)
        VALUES (?,?,?,?,?,?,?,'high',NULL,'validated',?,CURRENT_TIMESTAMP)
      `, [
        candidate.sentenceId, candidate.verbId, tenseId, candidate.personId,
        candidate.targetText, candidate.targetStart, candidate.targetEnd,
        'Ajout déterministe v2 après validation du contexte littéraire.',
      ])
      return Number(result.affectedRows)
    }
    for (const candidate of inspection.selectedPastInfinitives) {
      inserted.pastInfinitives += await insert(candidate, pastInfinitiveTenseId)
    }
    for (const candidate of inspection.selectedGerunds) {
      const tenseId = nonFiniteTenseIds.get(`gérondif:${candidate.tense}`)
      if (!tenseId) throw new Error(`Temps du gérondif absent : ${candidate.tense}`)
      inserted.gerunds += await insert(candidate, tenseId)
    }
    for (const candidate of inspection.selectedFiniteForms) {
      if (candidate.replacementTargetId) {
        const [result] = await connection.execute(`
          UPDATE literary_targets
          SET verb_id=?,tense_id=?,person_id=?,target_text=?,target_start=?,target_end=?,
              confidence='high',ambiguity_reason=NULL,review_status='validated',review_note=?,reviewed_at=CURRENT_TIMESTAMP
          WHERE id=?
        `, [
          candidate.verbId, candidate.tenseId, candidate.personId, candidate.targetText,
          candidate.targetStart, candidate.targetEnd,
          'Correction déterministe v2 après validation du contexte littéraire.',
          candidate.replacementTargetId,
        ])
        inserted.finiteForms += Number(result.affectedRows)
      } else {
        inserted.finiteForms += await insert(candidate, candidate.tenseId)
      }
    }
    await connection.execute(
      'INSERT INTO literary_corpus_migrations (migration_key) VALUES (?)',
      [LITERARY_ENRICHMENT_V2_MIGRATION_KEY],
    )
    await connection.commit()
    return { ...inspection, pastInfinitiveTenseId, inserted, alreadyApplied: false }
  } catch (error) {
    await connection.rollback()
    throw error
  }
}

function grouped(values) {
  return Object.fromEntries([...Map.groupBy(values, item => `${item.mode} · ${item.tense}`)]
    .map(([key, items]) => [key, items.length]))
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
      ? await applyValidatedLiteraryEnrichmentV2(connection)
      : await inspectValidatedLiteraryEnrichmentV2(connection)
    if (process.argv.includes('--summary') && !result.alreadyApplied) {
      console.log(JSON.stringify({
        sentences: result.sentences,
        candidates: {
          pastInfinitives: result.pastInfinitiveCandidates.length,
          gerunds: result.gerundCandidates.length,
          finiteForms: result.selectedFiniteForms.length,
        },
        selected: {
          pastInfinitives: result.selectedPastInfinitives.length,
          gerunds: result.selectedGerunds.length,
          finiteForms: grouped(result.selectedFiniteForms),
        },
        pastInfinitives: result.selectedPastInfinitives,
        gerunds: result.selectedGerunds,
        finiteForms: result.selectedFiniteForms,
      }, null, 2))
    } else {
      console.log(JSON.stringify(result, null, 2))
    }
  } finally {
    await connection.end()
  }
}

if (isDirectScriptExecution(import.meta.url, 'enrich-validated-literary-corpus-v2.mjs')) await main()
