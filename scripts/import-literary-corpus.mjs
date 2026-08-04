import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'
import { decode } from 'entities'
import { literaryCommonLanguage } from './literary-common-language.mjs'
import { literaryYouthSafety } from './literary-youth-safety.mjs'
import { servicePublicYouthSafety } from './service-public-youth-safety.mjs'

const args = new Map(process.argv.slice(2).map((argument) => {
  const [key, ...value] = argument.replace(/^--/u, '').split('=')
  return [key, value.join('=')]
}))

const input = args.get('input')
const inputFormat = args.get('input-format') || 'mediawiki-json'
const output = args.get('output') || 'shared/data/literary-corpus-pilot.json'
const sourceKey = args.get('source-key') || 'leblanc-arsene-lupin-gentleman-cambrioleur-1907'
const author = args.get('author') || 'Maurice Leblanc'
const title = args.get('title') || 'Arsène Lupin gentleman-cambrioleur'
const edition = args.get('edition') || 'Édition Pierre Lafitte, 1907'
const sourceUrl = args.get('source-url') || 'https://fr.wikisource.org/wiki/Ars%C3%A8ne_Lupin_gentleman-cambrioleur/Texte_entier'
const apiUrl = args.get('api-url') || 'https://fr.wikisource.org/w/api.php?action=parse&page=Ars%C3%A8ne_Lupin_gentleman-cambrioleur/Texte_entier&prop=text&format=json&formatversion=2'
const license = args.get('license') || 'Domaine public ; transcription Wikisource sous CC BY-SA'
const publicDomainBasis = args.get('public-domain-basis') || 'Maurice Leblanc est décédé en 1941 ; œuvre originale en français publiée en 1907.'
const languageRegister = args.get('language-register') || 'soutenu'
const candidateLimit = Math.max(1, Number.parseInt(args.get('candidate-limit') || '10', 10) || 10)
const verbTenseLimit = Math.max(1, Number.parseInt(args.get('verb-tense-limit') || String(candidateLimit * 3), 10) || candidateLimit * 3)
const maximumWords = Math.max(8, Number.parseInt(args.get('maximum-words') || '32', 10) || 32)
const maximumCharacters = 280
const youthSafeOnly = args.has('youth-safe')
const commonLanguageOnly = args.has('common-language')
const highConfidenceOnly = args.has('high-confidence-only')
const servicePublicSource = inputFormat === 'service-public-xml-directory'
const diversityFirst = args.has('diversity-first')
const maximumSentences = Math.max(1, Number.parseInt(args.get('maximum-sentences') || '1000000', 10) || 1000000)
const articleLimit = Math.max(1, Number.parseInt(args.get('article-limit') || '2', 10) || 2)

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const normalizedApostrophes = (value) => value.replace(/[‘ʼ‛`´]/gu, '’')
const compact = (value) => normalizedApostrophes(value).replace(/_+/gu, '').replace(/\s+/gu, ' ').trim()
const wordCount = (value) => value.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length || 0
const checksum = (value) => createHash('sha256').update(value).digest('hex')
const matchKey = (value) => compact(value).toLocaleLowerCase('fr').replace(/'/gu, '’')
const withoutLeadingDialogueMarks = value => value.replace(/^(?:(?:--|—|»)\s*)+/u, '')

function beginsWithVowel(value) {
  const first = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
  return 'aeiouy'.includes(first)
}

function subjectPrefix(pronoun, form, mode) {
  if (mode.toLocaleLowerCase('fr') === 'impératif') return ''
  const elidedSubject = pronoun === 'je' && beginsWithVowel(form) ? "j'" : `${pronoun} `
  if (mode.toLocaleLowerCase('fr') !== 'subjonctif') return elidedSubject
  return `${beginsWithVowel(pronoun) ? "qu'" : 'que '}${elidedSubject}`
}

function htmlText(html) {
  let value = html
    .replace(/<(script|style|table)\b[\s\S]*?<\/\1>/giu, ' ')
    .replace(/<sup\b[\s\S]*?<\/sup>/giu, ' ')
    .replace(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/giu, (_match, heading) => {
      const label = compact(decode(heading.replace(/<[^>]+>/gu, ' ')))
      return `\n\n§§CHAPTER§§ ${label}\n\n`
    })
    .replace(/<br\s*\/?\s*>/giu, '\n')
    .replace(/<\/(?:p|div|li|blockquote)>/giu, '\n')
    .replace(/<[^>]+>/gu, ' ')
  value = decode(value)
    .replace(/\u00ad/gu, '')
    .replace(/[\u00a0\u202f]/gu, ' ')
    .replace(/[ \t]+/gu, ' ')
    .replace(/ *\n */gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
  return value.trim()
}

function extractedSections(html) {
  const plain = htmlText(html)
  const chunks = plain.split('§§CHAPTER§§')
  return chunks.map((chunk, index) => {
    const lines = chunk.split('\n').map(line => compact(line)).filter(Boolean)
    const chapter = index === 0 ? null : (lines.shift() || null)
    return { chapter, text: lines.join('\n') }
  }).filter(section => section.text)
}

function extractedPlainTextSections(value) {
  const normalized = value.replace(/\r\n?/gu, '\n')
  const started = normalized.split(/\*\*\* START OF THE PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/iu)[1] || normalized
  const body = started.split(/\*\*\* END OF THE PROJECT GUTENBERG EBOOK/iu)[0] || started
  const tableStart = body.search(/^Table des matières\s*$/imu)
  if (tableStart < 0) return [{ chapter: null, text: compact(body) }]
  const afterTable = body.slice(tableStart).split('\n')
  const titles = []
  let sawTableTitle = false
  for (const rawLine of afterTable.slice(1)) {
    const line = compact(rawLine)
    if (!line) continue
    if (!sawTableTitle) {
      sawTableTitle = true
      titles.push(line)
      continue
    }
    if (line === titles[0]) break
    titles.push(line)
  }
  if (!titles.length) return [{ chapter: null, text: compact(body) }]
  const firstHeadingPattern = new RegExp(`^${titles[0].replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\s*$`, 'gmu')
  const headingMatches = [...body.matchAll(firstHeadingPattern)]
  const contentStart = headingMatches[1]?.index
  if (contentStart === undefined) throw new Error('Début du texte Gutenberg introuvable après la table des matières.')
  const content = body.slice(contentStart)
  const titleSet = new Set(titles)
  const sections = []
  let chapter = null
  let paragraphs = []
  const flush = () => {
    if (chapter && paragraphs.length) sections.push({ chapter, text: paragraphs.join('\n') })
    paragraphs = []
  }
  for (const paragraph of content.split(/\n\s*\n/gu)) {
    const text = compact(paragraph.replace(/\n/gu, ' '))
    if (!text) continue
    if (titleSet.has(text)) {
      flush()
      chapter = text
    }
    else if (chapter) paragraphs.push(text)
  }
  flush()
  return sections
}

function xmlText(value) {
  return compact(decode(value
    .replace(/<Exposant>([\s\S]*?)<\/Exposant>/giu, '$1')
    .replace(/<LienExterne\b[^>]*>([\s\S]*?)<\/LienExterne>/giu, '$1')
    .replace(/<[^>]+>/gu, ' ')))
}

async function extractedServicePublicSections(directory) {
  const filenames = (await readdir(directory)).filter(name => /^A\d+\.xml$/u.test(name)).sort()
  const documents = await Promise.all(filenames.map(async (filename) => ({
    filename,
    xml: await readFile(`${directory}/${filename}`, 'utf8'),
  })))
  const sections = []
  for (const { filename, xml } of documents) {
    const root = xml.match(/<Actualite\b([^>]*)>/iu)?.[1] || ''
    const articleId = root.match(/\bID="([^"]+)"/iu)?.[1] || filename.replace(/\.xml$/u, '')
    const articleUrl = root.match(/\bspUrl="([^"]+)"/iu)?.[1] || sourceUrl
    const publishedAt = root.match(/\bdatePremiereMiseEnLigne="([^"]+)"/iu)?.[1] || ''
    const articleTitle = xmlText(xml.match(/<dc:title>([\s\S]*?)<\/dc:title>/iu)?.[1] || articleId)
    const contentWithoutTitles = xml.replace(/<Titre(?:\s[^>]*)?>[\s\S]*?<\/Titre>/giu, ' ')
    const paragraphs = [...contentWithoutTitles.matchAll(/<Paragraphe(?:\s[^>]*)?>([\s\S]*?)<\/Paragraphe>/giu)]
      .map(match => xmlText(match[1]))
      .filter(text => text && /[.!?…]$/u.test(text))
    if (!paragraphs.length) continue
    sections.push({
      chapter: articleTitle,
      text: paragraphs.join('\n'),
      sourceUrl: articleUrl,
      locatorPrefix: `${articleId}${publishedAt ? ` · ${publishedAt}` : ''}`,
    })
  }
  return { raw: documents.map(document => document.xml).join('\n'), sections }
}

const servicePublicInput = inputFormat === 'service-public-xml-directory'
  ? await extractedServicePublicSections(input)
  : null
const raw = servicePublicInput?.raw || (input
  ? await readFile(input, 'utf8')
  : await fetch(apiUrl, { headers: { 'user-agent': 'conjugaison4-literary-corpus-import/1.0' } }).then(async (response) => {
      if (!response.ok) throw new Error(`Téléchargement Wikisource impossible (${response.status}).`)
      return response.text()
    }))
const sections = servicePublicInput?.sections || (inputFormat === 'plain-text'
  ? extractedPlainTextSections(raw)
  : (() => {
      const parsed = JSON.parse(raw)
      const html = parsed?.parse?.text
      if (typeof html !== 'string' || !html.trim()) throw new Error('Réponse Wikisource invalide : champ parse.text absent.')
      return extractedSections(html)
    })())
const extraPastParticiples = JSON.parse(await readFile(
  new URL('../shared/data/literary-extra-past-participles.json', import.meta.url),
  'utf8',
))

const [formRows] = await database.query(`
  SELECT vc.verbe_id AS verbId, vc.temp_id AS tenseId, vc.personne_id AS personId,
         vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
         p.pronom, m.name AS modeName, t.name AS tenseName,
         t.isTempsCompose AS isCompound,v.infinitif,
         v.\`participe_passé\` AS pastParticiple
  FROM verbesconjugues vc
  INNER JOIN verbes v ON v.id=vc.verbe_id AND v.est_archive=0
  INNER JOIN personnes p ON p.id=vc.personne_id
  INNER JOIN temps t ON t.id=vc.temp_id
  INNER JOIN modes m ON m.id=t.mode_id
  WHERE vc.conjugaison1<>'' AND m.name NOT IN ('participe','gérondif')
`)

const displays = new Map()
const auxiliaryForms = new Set()
const pastParticiples = new Set()
const interveningAdverbs = new Set([
  'absolument', 'ainsi', 'assez', 'aussitôt', 'beaucoup', 'bien', 'bientôt', 'convenablement',
  'copieusement', 'déjà', 'donc', 'encore', 'fort', 'même', 'parfaitement', 'prématurément',
  'rudement', 'si', 'simplement', 'tant', 'tellement', 'toujours', 'tout', 'tous', 'trop',
])
const addPastParticiple = (value) => {
  for (const form of compact(value || '').split(/[/,;|]/gu).map(compact).filter(Boolean)) {
    pastParticiples.add(matchKey(form))
    pastParticiples.add(matchKey(`${form}e`))
    pastParticiples.add(matchKey(`${form}s`))
    pastParticiples.add(matchKey(`${form}es`))
  }
}
for (const row of formRows) {
  addPastParticiple(row.pastParticiple)
  for (const form of new Set([row.conjugaison1, row.conjugaison2, row.conjugaison3].map(compact).filter(Boolean))) {
    if (!row.isCompound && ['avoir', 'être'].includes(matchKey(row.infinitif))) {
      auxiliaryForms.add(matchKey(form))
    }
    const prefix = subjectPrefix(row.pronom, form, row.modeName)
    const display = compact(`${prefix}${form}`)
    const key = matchKey(display)
    const candidates = displays.get(key) || []
    candidates.push({
      verbId: Number(row.verbId),
      tenseId: Number(row.tenseId),
      personId: Number(row.personId),
      form,
      prefix,
      display,
      mode: row.modeName,
      tense: row.tenseName,
      isCompound: Boolean(row.isCompound),
    })
    displays.set(key, candidates)
  }
}
for (const form of extraPastParticiples) addPastParticiple(form)

const looksLikePastParticiple = value => pastParticiples.has(matchKey(value))
  || /é(?:e|s|es)?$/iu.test(value)

const segmenter = new Intl.Segmenter('fr', { granularity: 'sentence' })
const discovered = []
let sentenceNumber = 0
for (const section of sections) {
  if (/^PR[ÉE]FACE\b/iu.test(section.chapter || '')) continue
  for (const part of segmenter.segment(section.text)) {
    const sentence = withoutLeadingDialogueMarks(compact(part.segment))
    if (!sentence || !/[.!?…]$/u.test(sentence)) continue
    if (/\b(?:M|Mme|Mlle|Dr|etc)\.$/u.test(sentence)) continue
    const words = wordCount(sentence)
    if (words < 4 || words > maximumWords || sentence.length > maximumCharacters) continue
    if (youthSafeOnly && !literaryYouthSafety(sentence).suitable) continue
    if (youthSafeOnly && servicePublicSource && !servicePublicYouthSafety(section.chapter || '', sentence).suitable) continue
    if (commonLanguageOnly && !literaryCommonLanguage(sentence).suitable) continue
    sentenceNumber += 1
    const occurrences = []
    const tokens = [...sentence.matchAll(/[\p{L}\p{N}]+(?:[’'’-][\p{L}\p{N}]+)*/gu)]
      .map(match => ({ text: match[0], start: Number(match.index), end: Number(match.index) + match[0].length }))
    for (let startToken = 0; startToken < tokens.length; startToken += 1) {
      for (let size = 1; size <= 6 && startToken + size <= tokens.length; size += 1) {
        const first = tokens[startToken]
        const last = tokens[startToken + size - 1]
        const displayText = sentence.slice(first.start, last.end)
        const candidates = displays.get(matchKey(displayText)) || []
        for (const candidate of candidates) {
          if (candidate.mode.toLocaleLowerCase('fr') === 'impératif') {
            // Le flux administratif s'adresse systématiquement au lecteur avec
            // « vous ». Cette restriction élimine les noms homographes placés
            // en tête de rubrique (« demande », « fête », « aide »…).
            if (servicePublicSource && Number(candidate.personId) !== 8) continue
            const before = sentence.slice(0, first.start).trimEnd()
            if (before && !/[.!?…:;—–-]$/u.test(before)) continue
          }
          const normalizedForm = matchKey(candidate.form)
          const normalizedDisplay = matchKey(displayText)
          if (!normalizedDisplay.endsWith(normalizedForm)) continue
          const targetLength = candidate.form.length
          const end = last.end
          const start = end - targetLength
          const target = sentence.slice(start, end)
          occurrences.push({ ...candidate, target, start, end })
        }
      }
    }
    if (!occurrences.length) continue

    // Dans « je suis rentré », « suis » appartient au passé composé de
    // « rentrer » : ce n'est pas une occurrence autonome de « être » au présent.
    // Lorsqu'une forme composée reconnue englobe un auxiliaire simple, seule la
    // forme composée est donc conservée comme cible.
    const compoundOccurrences = occurrences.filter(occurrence => occurrence.isCompound)
    const auxiliaryOccurrences = new Set(occurrences.filter((occurrence) => {
      if (occurrence.isCompound || !auxiliaryForms.has(matchKey(occurrence.target))) return false
      let nextTokenIndex = tokens.findIndex(token => token.start >= occurrence.end)
      if (nextTokenIndex < 0) return false
      const separator = sentence.slice(occurrence.end, tokens[nextTokenIndex].start)
      if (/[.!?…,:;]/u.test(separator)) return false
      let skippedAdverbs = 0
      while (skippedAdverbs < 3 && interveningAdverbs.has(matchKey(tokens[nextTokenIndex]?.text || ''))) {
        nextTokenIndex += 1
        skippedAdverbs += 1
      }
      const nextToken = tokens[nextTokenIndex]
      return Boolean(nextToken && looksLikePastParticiple(nextToken.text))
    }).map(occurrence => `${occurrence.start}:${occurrence.end}`))
    const contextualOccurrences = occurrences.filter(occurrence => occurrence.isCompound
      || (!auxiliaryOccurrences.has(`${occurrence.start}:${occurrence.end}`)
        && !compoundOccurrences.some(compound => (
          compound.start <= occurrence.start
          && compound.end > occurrence.end
        ))))

    const ambiguityBySpan = new Map()
    for (const occurrence of contextualOccurrences) {
      const span = `${occurrence.start}:${occurrence.end}`
      const values = ambiguityBySpan.get(span) || []
      values.push(occurrence)
      ambiguityBySpan.set(span, values)
    }
    const targets = contextualOccurrences.map((occurrence) => {
      const alternatives = ambiguityBySpan.get(`${occurrence.start}:${occurrence.end}`) || []
      const grammaticalAlternatives = new Set(alternatives.map(item => `${item.verbId}:${item.mode}:${item.tense}:${item.personId}`))
      const ambiguous = grammaticalAlternatives.size > 1
      return {
        verbId: occurrence.verbId,
        tenseId: occurrence.tenseId,
        personId: occurrence.personId,
        form: occurrence.target,
        start: occurrence.start,
        end: occurrence.end,
        isCompound: occurrence.isCompound,
        confidence: ambiguous ? 'ambiguous' : 'high',
        ambiguityReason: ambiguous
          ? `La même graphie correspond à ${[...new Set(alternatives.map(item => `${item.mode} ${item.tense}`))].join(', ')}.`
          : null,
      }
    })
    const uniqueTargets = [...new Map(targets.map(target => [
      `${target.start}:${target.end}:${target.verbId}:${target.tenseId}:${target.personId}`,
      target,
    ])).values()]
    discovered.push({
      key: checksum(`${sourceKey}\u0000${section.chapter || ''}\u0000${sentenceNumber}\u0000${sentence}`),
      chapter: section.chapter,
      locator: section.locatorPrefix ? `${section.locatorPrefix} · phrase ${sentenceNumber}` : `Phrase ${sentenceNumber}`,
      ...(section.sourceUrl ? { sourceUrl: section.sourceUrl } : {}),
      text: sentence,
      wordCount: words,
      characterCount: sentence.length,
      targets: uniqueTargets,
    })
  }
}

// Les analyses sûres et les phrases proches de 16 mots sont proposées en premier :
// elles restent lisibles tout en conservant aussi un peu de contexte littéraire.
const usage = new Map()
const verbTenseUsage = new Map()
const usedSentencesBySelection = new Set()
const selected = []
const defaultOrder = [...discovered].sort((left, right) => {
  const leftAmbiguous = left.targets.every(target => target.confidence === 'ambiguous') ? 1 : 0
  const rightAmbiguous = right.targets.every(target => target.confidence === 'ambiguous') ? 1 : 0
  const leftLengthScore = Math.abs(left.wordCount - 16)
  const rightLengthScore = Math.abs(right.wordCount - 16)
  return leftAmbiguous - rightAmbiguous || leftLengthScore - rightLengthScore || left.locator.localeCompare(right.locator, 'fr')
})
const modeTenseByTenseId = new Map(formRows.map(row => [Number(row.tenseId), `${row.modeName}:${row.tenseName}`]))
const modeTenseUsage = new Map()
const articleUsage = new Map()
const remaining = new Set(defaultOrder)
const orderedCandidates = []
if (diversityFirst) {
  while (remaining.size && orderedCandidates.length < maximumSentences) {
    let best = null
    let bestScore = Number.NEGATIVE_INFINITY
    for (const sentence of remaining) {
      const articleKey = sentence.sourceUrl || sentence.chapter || ''
      if ((articleUsage.get(articleKey) || 0) >= articleLimit) continue
      const eligible = sentence.targets.filter((target) => {
        if (highConfidenceOnly && target.confidence !== 'high') return false
        if ((usage.get(`${target.verbId}:${target.tenseId}:${target.personId}`) || 0) >= candidateLimit) return false
        if ((verbTenseUsage.get(`${target.verbId}:${target.tenseId}`) || 0) >= verbTenseLimit) return false
        return true
      })
      if (!eligible.length) continue
      const distinctModeTenses = new Set(eligible.map(target => modeTenseByTenseId.get(target.tenseId) || String(target.tenseId)))
      const newModeTenses = [...distinctModeTenses].filter(key => !modeTenseUsage.has(key)).length
      const rarity = [...distinctModeTenses].reduce((total, key) => total + (1000 / (1 + (modeTenseUsage.get(key) || 0))), 0)
      const newSelections = new Set(eligible.map(target => `${target.verbId}:${target.tenseId}:${target.personId}`))
      const newSelectionCount = [...newSelections].filter(key => !usage.has(key)).length
      const stableTieBreak = Number.parseInt(checksum(sentence.key).slice(0, 8), 16) / 0xffffffff
      const score = newModeTenses * 100000 + rarity + newSelectionCount * 100 - Math.abs(sentence.wordCount - 16) + stableTieBreak
      if (score > bestScore) {
        best = sentence
        bestScore = score
      }
    }
    if (!best) break
    remaining.delete(best)
    orderedCandidates.push(best)
    const articleKey = best.sourceUrl || best.chapter || ''
    articleUsage.set(articleKey, (articleUsage.get(articleKey) || 0) + 1)
    for (const target of best.targets) {
      if (highConfidenceOnly && target.confidence !== 'high') continue
      const selectionKey = `${target.verbId}:${target.tenseId}:${target.personId}`
      const verbTenseKey = `${target.verbId}:${target.tenseId}`
      if ((usage.get(selectionKey) || 0) >= candidateLimit || (verbTenseUsage.get(verbTenseKey) || 0) >= verbTenseLimit) continue
      usage.set(selectionKey, (usage.get(selectionKey) || 0) + 1)
      verbTenseUsage.set(verbTenseKey, (verbTenseUsage.get(verbTenseKey) || 0) + 1)
      const modeTenseKey = modeTenseByTenseId.get(target.tenseId) || String(target.tenseId)
      modeTenseUsage.set(modeTenseKey, (modeTenseUsage.get(modeTenseKey) || 0) + 1)
    }
  }
  usage.clear()
  verbTenseUsage.clear()
}
else orderedCandidates.push(...defaultOrder)

for (const sentence of orderedCandidates) {
  if (selected.length >= maximumSentences) break
  const retainedTargets = sentence.targets.filter((target) => {
    if (highConfidenceOnly && target.confidence !== 'high') return false
    const key = `${target.verbId}:${target.tenseId}:${target.personId}`
    const sentenceSelectionKey = `${key}:${matchKey(sentence.text)}`
    if (usedSentencesBySelection.has(sentenceSelectionKey)) return false
    const count = usage.get(key) || 0
    if (count >= candidateLimit) return false
    const verbTenseKey = `${target.verbId}:${target.tenseId}`
    const verbTenseCount = verbTenseUsage.get(verbTenseKey) || 0
    if (verbTenseCount >= verbTenseLimit) return false
    usage.set(key, count + 1)
    verbTenseUsage.set(verbTenseKey, verbTenseCount + 1)
    usedSentencesBySelection.add(sentenceSelectionKey)
    return true
  })
  if (retainedTargets.length) selected.push({ ...sentence, targets: retainedTargets })
}

const payload = {
  source: {
    key: sourceKey,
    author,
    title,
    edition,
    sourceUrl,
    license,
    publicDomainBasis,
    register: languageRegister,
    checksum: checksum(`${raw}\u0000candidate-limit-by-person:${candidateLimit}\u0000verb-tense-limit:${verbTenseLimit}\u0000max:${maximumWords}:${maximumCharacters}\u0000youth:${youthSafeOnly}\u0000common:${commonLanguageOnly}\u0000high-confidence:${highConfidenceOnly}\u0000diversity:${diversityFirst}:${maximumSentences}:${articleLimit}\u0000extras:${extraPastParticiples.join(',')}\u0000extractor-v9-current-sources`),
  },
  sentences: selected.sort((left, right) => left.locator.localeCompare(right.locator, 'fr', { numeric: true })),
}

await writeFile(output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
await database.end()

const targetCount = selected.reduce((total, sentence) => total + sentence.targets.length, 0)
const ambiguousCount = selected.reduce((total, sentence) => total + sentence.targets.filter(target => target.confidence === 'ambiguous').length, 0)
console.log(JSON.stringify({
  source: `${author} — ${title}`,
  scannedSentences: sentenceNumber,
  matchedSentences: discovered.length,
  retainedSentences: selected.length,
  retainedTargets: targetCount,
  ambiguousTargets: ambiguousCount,
  candidateLimitPerVerbTenseAndPerson: candidateLimit,
  candidateLimitPerVerbAndTense: verbTenseLimit,
  output,
}, null, 2))
