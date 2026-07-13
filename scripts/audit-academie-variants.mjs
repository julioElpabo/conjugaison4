import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import mysql from 'mysql2/promise'
import { decodeHTML } from 'entities'

const SOURCE_ROOT = 'https://www.dictionnaire-academie.fr'
const CACHE_DIR = '/private/tmp/conjugaison4-academie-cache'
const REPORT_PATH = new URL('../reports/academie-variants.json', import.meta.url)
const REQUEST_DELAY_MS = 220
const PRONOMINAL_ARTICLE_OVERRIDES = new Map([
  ['ecrier', 'A9E0355'],
  ['souvenir', 'A9S2476']
])
const PERSONS = ['je', 'tu', 'il', 'nous', 'vous', 'ils']
const IMPERATIVE_PERSONS = ['tu', 'nous', 'vous']
const MODE_SECTIONS = [
  ['par', 'participe'],
  ['ind', 'indicatif'],
  ['con', 'conditionnel'],
  ['sub', 'subjonctif'],
  ['imp', 'impératif']
]

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function normalized(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’]/gu, "'")
    .toLocaleLowerCase('fr')
    .trim()
}

function canonicalForm(value) {
  return String(value || '')
    .normalize('NFC')
    .replace(/[’]/gu, "'")
    .toLocaleLowerCase('fr')
    .replace(/\s+/gu, ' ')
    .trim()
}

function lookupInfinitive(infinitive) {
  return infinitive.replace(/^s['’]/iu, '').replace(/^se\s+/iu, '')
}

function isPronominal(infinitive) {
  return /^(?:s['’]|se\s+)/iu.test(infinitive)
}

function stripTags(value) {
  return decodeHTML(value.replace(/<[^>]+>/gu, ' '))
    .replace(/\s+/gu, ' ')
    .trim()
}

function mapTense(mode, academyTense) {
  const tense = normalized(academyTense)
  if (mode === 'indicatif' && tense === 'futur simple') return 'futur'
  if (mode === 'conditionnel' && tense === 'passe') return 'passé 1'
  return decodeHTML(academyTense).toLocaleLowerCase('fr').trim()
}

function extractModeSection(activeVoice, key, nextKey) {
  const marker = `<div id="active_${key}"`
  const start = activeVoice.indexOf(marker)
  if (start < 0) return ''
  if (!nextKey) return activeVoice.slice(start)
  const end = activeVoice.indexOf(`<div id="active_${nextKey}"`, start + marker.length)
  return end < 0 ? activeVoice.slice(start) : activeVoice.slice(start, end)
}

function parseAcademyVariants(html) {
  const activeStart = html.indexOf('<div id="voix_active">')
  const activeEnd = html.indexOf('<div id="voix_passive">', activeStart)
  if (activeStart < 0 || activeEnd < 0) return []
  const activeVoice = html.slice(activeStart, activeEnd)
  const variants = []

  for (let modeIndex = 0; modeIndex < MODE_SECTIONS.length; modeIndex += 1) {
    const [key, mode] = MODE_SECTIONS[modeIndex]
    if (mode === 'participe') continue
    const nextKey = MODE_SECTIONS[modeIndex + 1]?.[0]
    const section = extractModeSection(activeVoice, key, nextKey)
    const tensePattern = /<div class="tense"><h4[^>]*>([\s\S]*?)<\/h4><table[^>]*>([\s\S]*?)<\/table><\/div>/gu
    let tenseMatch
    while ((tenseMatch = tensePattern.exec(section))) {
      const tense = mapTense(mode, stripTags(tenseMatch[1]))
      const rowPattern = /<tr class="conj_line">([\s\S]*?)<\/tr>/gu
      let rowMatch
      let personIndex = 0
      while ((rowMatch = rowPattern.exec(tenseMatch[2]))) {
        const cells = [...rowMatch[1].matchAll(/<td class="([^"]+)"[^>]*>([\s\S]*?)<\/td>/gu)]
        const verbCell = cells.find(match => match[1].includes('conj_verb'))
        if (!verbCell || !/<span class="or">\s*ou\s*<\/span>/u.test(verbCell[2])) {
          personIndex += 1
          continue
        }

        const auxiliary = cells
          .filter(match => match[1].includes('conj_auxil'))
          .map(match => stripTags(match[2]))
          .join(' ')
        const forms = verbCell[2]
          .replace(/<span class="or">\s*ou\s*<\/span>/gu, '|||')
          .split('|||')
          .map(stripTags)
          .map(form => auxiliary ? `${auxiliary} ${form}` : form)
          .filter(Boolean)
        const people = mode === 'impératif' ? IMPERATIVE_PERSONS : PERSONS
        const pronoun = people[personIndex]
        if (pronoun && forms.length > 1) variants.push({ mode, tense, pronoun, forms })
        personIndex += 1
      }
    }
  }
  return variants
}

async function fetchWithCache(key, url, options = undefined) {
  const path = join(CACHE_DIR, `${key}.txt`)
  try {
    return await readFile(path, 'utf8')
  } catch {
    await sleep(REQUEST_DELAY_MS)
    const response = await fetch(url, {
      ...options,
      headers: {
        'accept': options?.headers?.accept || 'text/html,application/xhtml+xml',
        'user-agent': 'conjugaison4-variant-audit/1.0',
        ...(options?.headers || {})
      }
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} pour ${url}`)
    const text = await response.text()
    await writeFile(path, text)
    return text
  }
}

async function findArticle(infinitive) {
  const body = new URLSearchParams({ term: infinitive, options: '1' })
  const raw = await fetchWithCache(
    `search-${normalized(infinitive).replace(/[^a-z0-9]+/gu, '-')}`,
    `${SOURCE_ROOT}/search`,
    {
      method: 'POST',
      body,
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      }
    }
  )
  const payload = JSON.parse(raw)
  const candidates = Array.isArray(payload.result) ? payload.result : []
  return candidates.find(candidate => (
    normalized(candidate.label) === normalized(infinitive)
    && String(candidate.nature || '').includes('v.')
    && /\/article\/((?:A9|B0)[A-Z0-9]+)/u.test(candidate.url)
  ))
}

function rowKey(verbId, mode, tense, pronoun) {
  return `${verbId}:${normalized(mode)}:${normalized(tense)}:${normalized(pronoun)}`
}

function sameForm(left, right) {
  return canonicalForm(left) === canonicalForm(right)
}

function derivePronominal(primary, basePrimary, alternative) {
  const index = primary.indexOf(basePrimary)
  if (index >= 0) {
    return `${primary.slice(0, index)}${alternative}${primary.slice(index + basePrimary.length)}`
  }

  const baseTokens = basePrimary.split(' ')
  const alternativeTokens = alternative.split(' ')
  if (baseTokens.length !== alternativeTokens.length) return null
  const changedIndexes = baseTokens
    .map((token, tokenIndex) => sameForm(token, alternativeTokens[tokenIndex]) ? -1 : tokenIndex)
    .filter(tokenIndex => tokenIndex >= 0)
  if (changedIndexes.length !== 1) return null

  const changedIndex = changedIndexes[0]
  const baseToken = baseTokens[changedIndex]
  const alternativeToken = alternativeTokens[changedIndex]
  const primaryTokens = primary.split(' ')
  const targetIndex = primaryTokens.findLastIndex(token => {
    const canonicalToken = canonicalForm(token)
    const canonicalBase = canonicalForm(baseToken)
    return canonicalToken === canonicalBase
      || (/^(?:s|e|es)$/u.test(canonicalToken.slice(canonicalBase.length)) && canonicalToken.startsWith(canonicalBase))
  })
  if (targetIndex < 0) return null

  const suffix = primaryTokens[targetIndex].slice(baseToken.length)
  primaryTokens[targetIndex] = `${alternativeToken}${suffix}`
  return primaryTokens.join(' ')
}

await mkdir(CACHE_DIR, { recursive: true })
await mkdir(new URL('../reports/', import.meta.url), { recursive: true })

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
})

try {
  const [verbs] = await database.execute('SELECT id, infinitif FROM verbes ORDER BY infinitif, id')
  const [rows] = await database.execute(`
    SELECT vc.id, vc.verbe_id AS verbId, m.name AS mode, t.name AS tense,
           p.pronom, vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
    FROM verbesconjugues vc
    INNER JOIN temps t ON t.id = vc.temp_id
    INNER JOIN modes m ON m.id = t.mode_id
    INNER JOIN personnes p ON p.id = vc.personne_id
  `)
  const rowsByKey = new Map(rows.map(row => [rowKey(row.verbId, row.mode, row.tense, row.pronom), row]))
  const baseVerbs = new Map()
  for (const verb of verbs) {
    const lookup = lookupInfinitive(verb.infinitif)
    const key = normalized(lookup)
    const group = baseVerbs.get(key) || { lookup, simple: [], pronominal: [] }
    group[isPronominal(verb.infinitif) ? 'pronominal' : 'simple'].push(verb)
    baseVerbs.set(key, group)
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source: `${SOURCE_ROOT}/aide-en-ligne.html`,
    catalogueVerbCount: verbs.length,
    searchedBaseVerbCount: baseVerbs.size,
    matchedArticleCount: 0,
    candidateBaseVerbCount: 0,
    updates: [],
    primaryCorrections: [],
    unchanged: [],
    unresolved: [],
    missingArticles: []
  }

  let completed = 0
  for (const group of baseVerbs.values()) {
    completed += 1
    const article = await findArticle(group.lookup)
    const overriddenArticleId = PRONOMINAL_ARTICLE_OVERRIDES.get(normalized(group.lookup))
    if (!article && !overriddenArticleId) {
      report.missingArticles.push(group.lookup)
      console.log(`[${completed}/${baseVerbs.size}] article absent : ${group.lookup}`)
      continue
    }

    report.matchedArticleCount += 1
    const articleId = overriddenArticleId || article.url.match(/\/article\/((?:A9|B0)[A-Z0-9]+)/u)?.[1]
    const source = `${SOURCE_ROOT}/conjuguer/${articleId}`
    const html = await fetchWithCache(`conjugation-${articleId}`, `${SOURCE_ROOT}/conjuguer/${articleId}`)
    const academyVariants = parseAcademyVariants(html)
    if (academyVariants.length === 0) {
      if (completed % 25 === 0) console.log(`[${completed}/${baseVerbs.size}] ${group.lookup}`)
      continue
    }

    report.candidateBaseVerbCount += 1
    for (const verb of group.simple) {
      for (const variant of academyVariants) {
        const row = rowsByKey.get(rowKey(verb.id, variant.mode, variant.tense, variant.pronoun))
        if (!row) {
          report.unresolved.push({ verbId: verb.id, infinitive: verb.infinitif, ...variant, reason: 'ligne absente' })
          continue
        }
        const primaryIndex = variant.forms.findIndex(form => sameForm(form, row.conjugaison1))
        if (primaryIndex < 0) {
          const currentWithoutDiacritics = normalized(row.conjugaison1).replace(/\s+/gu, ' ')
          const matchesWithoutDiacritics = variant.forms.some(form => (
            normalized(form).replace(/\s+/gu, ' ') === currentWithoutDiacritics
          ))
          if (matchesWithoutDiacritics && !row.conjugaison2 && !row.conjugaison3 && variant.forms.length <= 3) {
            report.primaryCorrections.push({
              verbId: verb.id,
              infinitive: verb.infinitif,
              rowId: row.id,
              mode: variant.mode,
              tense: variant.tense,
              pronoun: variant.pronoun,
              previousPrimary: row.conjugaison1,
              primary: variant.forms[0],
              alternatives: variant.forms.slice(1),
              source
            })
            continue
          }
          report.unresolved.push({
            verbId: verb.id,
            infinitive: verb.infinitif,
            rowId: row.id,
            current: row.conjugaison1,
            ...variant,
            reason: 'forme principale différente de l’Académie'
          })
          continue
        }
        const alternatives = variant.forms.filter((_, index) => index !== primaryIndex)
        if (alternatives.length > 2) {
          report.unresolved.push({ verbId: verb.id, infinitive: verb.infinitif, rowId: row.id, ...variant, reason: 'plus de deux variantes' })
          continue
        }
        const expected = [alternatives[0] || '', alternatives[1] || '']
        const item = {
          verbId: verb.id,
          infinitive: verb.infinitif,
          rowId: row.id,
          mode: variant.mode,
          tense: variant.tense,
          pronoun: variant.pronoun,
          primary: row.conjugaison1,
          alternatives,
          source
        }
        if (sameForm(row.conjugaison2, expected[0]) && sameForm(row.conjugaison3, expected[1])) report.unchanged.push(item)
        else if (!row.conjugaison2 && !row.conjugaison3) report.updates.push(item)
        else report.unresolved.push({ ...item, currentAlternatives: [row.conjugaison2, row.conjugaison3], reason: 'variantes existantes différentes' })
      }
    }

    for (const verb of group.pronominal) {
      const baseVerb = group.simple[0]
      if (!baseVerb) {
        report.unresolved.push({ verbId: verb.id, infinitive: verb.infinitif, reason: 'verbe simple absent du catalogue' })
        continue
      }
      for (const variant of academyVariants) {
        const baseRow = rowsByKey.get(rowKey(baseVerb.id, variant.mode, variant.tense, variant.pronoun))
        const row = rowsByKey.get(rowKey(verb.id, variant.mode, variant.tense, variant.pronoun))
        if (!baseRow || !row) continue
        const primaryIndex = variant.forms.findIndex(form => sameForm(form, baseRow.conjugaison1))
        if (primaryIndex < 0) continue
        const alternatives = variant.forms
          .filter((_, index) => index !== primaryIndex)
          .map(form => derivePronominal(row.conjugaison1, baseRow.conjugaison1, form))
          .filter(form => !sameForm(form, row.conjugaison1))
        if (alternatives.some(form => !form)) {
          report.unresolved.push({ verbId: verb.id, infinitive: verb.infinitif, rowId: row.id, ...variant, reason: 'variante pronominale non dérivable' })
          continue
        }
        const expected = [alternatives[0] || '', alternatives[1] || '']
        const item = {
          verbId: verb.id,
          infinitive: verb.infinitif,
          rowId: row.id,
          mode: variant.mode,
          tense: variant.tense,
          pronoun: variant.pronoun,
          primary: row.conjugaison1,
          alternatives,
          source
        }
        if (sameForm(row.conjugaison2, expected[0]) && sameForm(row.conjugaison3, expected[1])) report.unchanged.push(item)
        else if (!row.conjugaison2 && !row.conjugaison3) report.updates.push(item)
        else report.unresolved.push({ ...item, currentAlternatives: [row.conjugaison2, row.conjugaison3], reason: 'variantes existantes différentes' })
      }
    }
    console.log(`[${completed}/${baseVerbs.size}] variantes : ${group.lookup}`)
  }

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({
    report: REPORT_PATH.pathname,
    matchedArticles: report.matchedArticleCount,
    candidateBaseVerbs: report.candidateBaseVerbCount,
    updates: report.updates.length,
    primaryCorrections: report.primaryCorrections.length,
    unchanged: report.unchanged.length,
    unresolved: report.unresolved.length,
    missingArticles: report.missingArticles.length
  }, null, 2))
} finally {
  await database.end()
}
