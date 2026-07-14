import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { decodeHTML } from 'entities'
import mysql from 'mysql2/promise'

const REPORT_PATH = resolve(process.cwd(), 'reports', 'academie-complements.json')
const CACHE_PATH = resolve(process.cwd(), 'reports', 'academie-articles-cache.json')
const SEARCH_URL = 'https://www.dictionnaire-academie.fr/search'

function plainText(html) {
  return decodeHTML(String(html || '').replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim())
}

function normalized(value) {
  return String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[’']/gu, "'").toLocaleLowerCase('fr').trim()
}

function flags(category) {
  const value = normalized(category)
  // Ne jamais chercher simplement « transitif » : le mot est aussi contenu
  // dans « intransitif » et produirait de nombreux faux positifs.
  const indirect = /(?:^|[^\p{L}])transitif indirect/u.test(value)
  const direct = /(?:^|[^\p{L}])transitif direct/u.test(value)
    || (/(?:^|[^\p{L}])verbe transitif/u.test(value) && !indirect)
    || /(?:^|[^\p{L}])transitif et/u.test(value)
  return { direct, indirect }
}

function parseArticle(html, infinitive, url) {
  const articleStart = html.search(/<div class="s_Article"/u)
  const article = articleStart >= 0 ? html.slice(articleStart) : html
  const header = article.match(/<div class="s_EnTete">[\s\S]*?<span class="s_cat"><span>([\s\S]*?)<\/span><\/span>/u)
  const category = plainText(header?.[1])
  const headings = [...article.matchAll(/<div class="titreBlocSection">([\s\S]*?)<\/div>/gu)]
    .map(match => ({ index: match.index, category: plainText(match[1]), ...flags(plainText(match[1])) }))
  const defaultFlags = flags(category)
  const examples = [...article.matchAll(/<span class="s_Exemple"><span class="s_im">([\s\S]*?)<\/span><\/span>/gu)]
    .map((match) => {
      const heading = headings.filter(item => item.index < match.index).at(-1)
      const text = plainText(match[1]).replace(/\s+([,.;!?])/gu, '$1').trim()
      return { text, direct: heading?.direct ?? defaultFlags.direct, indirect: heading?.indirect ?? defaultFlags.indirect }
    })
  const startPattern = new RegExp(`^(?:ne\\s+|n['’])?${infinitive.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?:\\s+|$)`, 'iu')
  const infinitiveExamples = examples
    .filter(example => startPattern.test(example.text))
    .map(example => ({ ...example, complement: example.text.replace(startPattern, '').replace(/[.!?]+$/gu, '').trim() }))
    .filter(example => example.complement.length >= 2 && example.complement.length <= 180)
  return {
    infinitive,
    url,
    category,
    direct: defaultFlags.direct || examples.some(example => example.direct),
    indirect: defaultFlags.indirect || examples.some(example => example.indirect),
    examples,
    infinitiveExamples,
  }
}

async function searchArticle(infinitive) {
  const body = new URLSearchParams({ term: infinitive, options: '1' })
  const response = await fetch(SEARCH_URL, {
    method: 'POST', headers: { accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' }, body,
  })
  if (!response.ok) throw new Error(`Recherche ${infinitive}: HTTP ${response.status}`)
  const data = await response.json()
  const exact = (data.result || []).filter(item => normalized(item.label) === normalized(infinitive) && /v\./iu.test(item.nature || ''))
  return exact[0]?.url || null
}

async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_PATH, 'utf8')) } catch { return {} }
}

const database = await mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
})

try {
  const [verbs] = await database.execute('SELECT infinitif FROM verbes WHERE est_archive=0 ORDER BY infinitif')
  const cache = await loadCache()
  const results = []
  for (const [index, row] of verbs.entries()) {
    const infinitive = row.infinitif
    try {
      let entry = cache[infinitive]
      if (!entry?.html) {
        const url = await searchArticle(infinitive)
        if (!url) throw new Error('article exact introuvable')
        const response = await fetch(url)
        if (!response.ok) throw new Error(`article HTTP ${response.status}`)
        entry = { url, html: await response.text() }
        cache[infinitive] = entry
      }
      results.push(parseArticle(entry.html, infinitive, entry.url))
    } catch (error) {
      results.push({ infinitive, error: error instanceof Error ? error.message : String(error) })
    }
    if ((index + 1) % 25 === 0) {
      await mkdir(resolve(process.cwd(), 'reports'), { recursive: true })
      await writeFile(CACHE_PATH, JSON.stringify(cache))
      console.log(`${index + 1}/${verbs.length} articles analysés`)
    }
  }
  const report = {
    generatedAt: new Date().toISOString(),
    source: 'Dictionnaire de l’Académie française, éditions 9 et 10',
    total: results.length,
    found: results.filter(item => !item.error).length,
    direct: results.filter(item => item.direct).length,
    indirect: results.filter(item => item.indirect).length,
    withInfinitiveExamples: results.filter(item => item.infinitiveExamples?.length).length,
    results,
  }
  await mkdir(resolve(process.cwd(), 'reports'), { recursive: true })
  await writeFile(CACHE_PATH, JSON.stringify(cache))
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({ total: report.total, found: report.found, direct: report.direct, indirect: report.indirect, withInfinitiveExamples: report.withInfinitiveExamples }, null, 2))
} finally {
  await database.end()
}
