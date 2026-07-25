import { createReadStream } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'

import { normalizeFrench } from './audit-missing-french-verbs.mjs'

const REQUIRED_PARADIGMS = [
  ['indicative', 'present', 6],
  ['indicative', 'imperfect', 6],
  ['indicative', 'future', 6],
  ['indicative', 'simplePast', 6],
  ['conditional', 'present', 6],
  ['subjunctive', 'present', 6],
  ['subjunctive', 'imperfect', 6],
  ['imperative', 'present', 3],
  ['participle', 'present', 1],
  ['participle', 'past', 1],
]

function option(name, fallback = '') {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) || fallback
}

function morphologyKey({ mode, tense, number, person, gender }) {
  return [mode, tense, number, person, gender].join('|')
}

export function parseMorphalouRow(line, context = {}) {
  const columns = line.replace(/\r$/u, '').split(';')
  if (columns.length < 18) return null
  const explicitLemma = columns[0]?.trim() || ''
  const lemma = explicitLemma || context.lemma || ''
  const category = explicitLemma ? columns[2]?.trim() || '' : context.category || ''
  if (!lemma || category !== 'Verbe') return null
  return {
    lemma,
    category,
    form: columns[9]?.trim() || '',
    number: columns[11]?.trim() || '-',
    mode: columns[12]?.trim() || '-',
    gender: columns[13]?.trim() || '-',
    tense: columns[14]?.trim() || '-',
    person: columns[15]?.trim() || '-',
    source: columns[17]?.trim() || '',
  }
}

export async function readMorphalouParadigms(path, lemmas) {
  const wanted = new Map(lemmas.map(lemma => [normalizeFrench(lemma), lemma]))
  const paradigms = new Map(lemmas.map(lemma => [lemma, new Map()]))
  let context = { lemma: '', category: '' }
  const lines = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Number.POSITIVE_INFINITY,
  })

  for await (const line of lines) {
    const columns = line.split(';')
    if (columns[0]?.trim()) {
      context = {
        lemma: columns[0].trim(),
        category: columns[2]?.trim() || '',
      }
    }
    const row = parseMorphalouRow(line, context)
    if (!row?.form) continue
    const selectedLemma = wanted.get(normalizeFrench(row.lemma))
    if (!selectedLemma) continue
    const key = morphologyKey(row)
    const paradigm = paradigms.get(selectedLemma)
    if (!paradigm.has(key)) paradigm.set(key, new Set())
    paradigm.get(key).add(row.form.normalize('NFC'))
  }
  return paradigms
}

function paradigmSlots(paradigm, mode, tense) {
  const slots = []
  for (const [key] of paradigm) {
    const [rowMode, rowTense] = key.split('|')
    if (rowMode === mode && rowTense === tense) slots.push(key)
  }
  return slots
}

function inspectCandidate(candidate, paradigm) {
  const checks = REQUIRED_PARADIGMS.map(([mode, tense, minimum]) => {
    const slots = paradigmSlots(paradigm, mode, tense)
    return {
      mode,
      tense,
      minimum,
      count: slots.length,
      ok: slots.length >= minimum,
    }
  })
  const forms = Object.fromEntries(
    [...paradigm.entries()]
      .sort(([left], [right]) => left.localeCompare(right, 'fr'))
      .map(([key, values]) => [key, [...values].sort((left, right) => left.localeCompare(right, 'fr'))]),
  )
  const blockingChecks = candidate.isDefective ? checks.filter(check => (
    check.mode === 'participle' || (check.mode === 'indicative' && check.tense === 'present')
  )) : checks
  return {
    ...candidate,
    morphalouStatus: paradigm.size ? 'attesté' : 'introuvable',
    morphologyCount: Object.values(forms).reduce((total, values) => total + values.length, 0),
    checks,
    blockingIssues: blockingChecks.filter(check => !check.ok).map(check => (
      `${check.mode}/${check.tense} : ${check.count}/${check.minimum}`
    )),
    forms,
  }
}

function markdownCell(value) {
  return String(value ?? '').replace(/\|/gu, '\\|').replace(/\r?\n/gu, ' ')
}

function renderReport(sourceReport, morphalouPath, candidates) {
  const ready = candidates.filter(candidate => (
    candidate.morphalouStatus === 'attesté' && candidate.blockingIssues.length === 0
  ))
  const blocked = candidates.filter(candidate => !ready.includes(candidate))
  const lines = [
    '# Contrôle Morphalou du lot pilote',
    '',
    `Rapport généré le ${new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}.`,
    '',
    'Ce contrôle est en lecture seule. Aucun verbe n’a été ajouté à MySQL.',
    '',
    '## Résumé',
    '',
    `- candidats contrôlés : ${candidates.length} ;`,
    `- paradigmes complets ou acceptables : ${ready.length} ;`,
    `- candidats bloqués : ${blocked.length}.`,
    '',
    '## Résultats',
    '',
    '| Priorité | Infinitif | Formes distinctes | Contrôle | Modèle Académie |',
    '|---:|---|---:|---|---|',
    ...candidates.map((candidate, index) => {
      const status = candidate.blockingIssues.length
        ? candidate.blockingIssues.join(' ; ')
        : candidate.morphalouStatus
      return `| ${index + 1} | ${markdownCell(candidate.lemma)} | ${candidate.morphologyCount} | ${markdownCell(status)} | ${markdownCell(candidate.model || candidate.groupDescription)} |`
    }),
    '',
    '## Décision',
    '',
    blocked.length
      ? 'Le lot ne doit pas encore être importé : les candidats bloqués doivent être corrigés ou remplacés.'
      : 'Les paradigmes simples du lot sont confirmés. Il reste à contrôler les auxiliaires, les temps composés et les données pédagogiques avant import.',
    '',
    '## Traçabilité',
    '',
    `- rapport source : \`${markdownCell(sourceReport)}\` ;`,
    `- fichier Morphalou : \`${markdownCell(morphalouPath)}\` ;`,
    '- version : Morphalou 3.1, ATILF-CNRS, licence LGPL-LR.',
    '',
  ]
  return `${lines.join('\n')}\n`
}

export async function runMorphalouValidation({
  inputPath,
  morphalouPath,
  outputPath,
  jsonOutputPath,
}) {
  const source = JSON.parse(await readFile(inputPath, 'utf8'))
  const candidates = source.candidates || []
  const paradigms = await readMorphalouParadigms(morphalouPath, candidates.map(candidate => candidate.lemma))
  const inspected = candidates.map(candidate => inspectCandidate(candidate, paradigms.get(candidate.lemma)))
  const ready = inspected.filter(candidate => (
    candidate.morphalouStatus === 'attesté' && candidate.blockingIssues.length === 0
  ))
  const blocked = inspected.filter(candidate => !ready.includes(candidate))
  const result = {
    generatedAt: new Date().toISOString(),
    sourceReport: inputPath.split(/[\\/]/u).pop() || inputPath,
    morphalouVersion: '3.1',
    candidates: inspected,
    readyCount: ready.length,
    blocked: blocked.map(candidate => ({
      lemma: candidate.lemma,
      status: candidate.morphalouStatus,
      issues: candidate.blockingIssues,
    })),
  }
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderReport(result.sourceReport, morphalouPath, inspected), 'utf8')
  await mkdir(dirname(jsonOutputPath), { recursive: true })
  await writeFile(jsonOutputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  return result
}

async function main() {
  const morphalouArgument = option('morphalou', process.env.MORPHALOU_PATH)
  if (!morphalouArgument) {
    throw new Error('Chemin Morphalou absent (--morphalou=... ou MORPHALOU_PATH).')
  }
  const inputPath = resolve(option('input', 'reports/missing-french-verbs-academie.json'))
  const morphalouPath = resolve(morphalouArgument)
  const outputPath = resolve(option('output', 'reports/missing-french-verbs-morphalou.md'))
  const jsonOutputPath = resolve(option('json-output', 'reports/missing-french-verbs-morphalou.json'))
  const result = await runMorphalouValidation({
    inputPath,
    morphalouPath,
    outputPath,
    jsonOutputPath,
  })
  console.log(`Morphalou : ${result.readyCount}/${result.candidates.length} candidat(s) sans blocage.`)
  console.log(`Rapports : ${outputPath} et ${jsonOutputPath}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
