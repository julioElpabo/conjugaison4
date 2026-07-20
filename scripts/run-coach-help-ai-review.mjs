import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { homedir } from 'node:os'
import { access, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import mysql from 'mysql2/promise'
import { COACH_HELP_REVIEW_VERSION } from '../shared/utils/coach-help-review.ts'

const ROOT = new URL('../', import.meta.url)
const QUEUE_FILE = new URL('../reports/coach-help-ai-review-queue.json', import.meta.url)
const AUDIT_FILE = new URL('../reports/coach-help-semantic-audit.json', import.meta.url)
const STATE_FILE = new URL('../reports/coach-help-ai-review-state.json', import.meta.url)
const SUMMARY_FILE = new URL('../reports/coach-help-ai-review-summary.json', import.meta.url)
const SAMPLE_STATE_FILE = new URL('../reports/coach-help-ai-review-sample-state.json', import.meta.url)
const SAMPLE_SUMMARY_FILE = new URL('../reports/coach-help-ai-review-sample-summary.json', import.meta.url)
const PEDAGOGY_STATE_FILE = new URL('../reports/coach-help-ai-pedagogy-review-state.json', import.meta.url)
const PEDAGOGY_SUMMARY_FILE = new URL('../reports/coach-help-ai-pedagogy-review-summary.json', import.meta.url)
const PEDAGOGY_SAMPLE_STATE_FILE = new URL('../reports/coach-help-ai-pedagogy-review-sample-state.json', import.meta.url)
const PEDAGOGY_SAMPLE_SUMMARY_FILE = new URL('../reports/coach-help-ai-pedagogy-review-sample-summary.json', import.meta.url)
const MOCK_STATE_FILE = new URL('../reports/coach-help-ai-review-state.mock.json', import.meta.url)
const MOCK_SUMMARY_FILE = new URL('../reports/coach-help-ai-review-summary.mock.json', import.meta.url)
const SCHEMA_FILE = new URL('./data/coach-help-ai-verdict.schema.json', import.meta.url)
const EVALUATOR_DIR = new URL('../reports/.coach-help-ai-evaluator/', import.meta.url)

const argument = name => process.argv.find(value => value.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const batchSize = Math.max(1, Math.min(20, Number.parseInt(argument('batch-size') || '8', 10)))
const maxBatches = Math.max(0, Number.parseInt(argument('max-batches') || '0', 10))
const randomForms = Math.max(0, Number.parseInt(argument('random-forms') || '0', 10))
const categoryForms = Math.max(0, Number.parseInt(argument('category-forms') || '0', 10))
const randomSeed = argument('seed') || new Date().toISOString().slice(0, 10)
const model = argument('model') || 'gpt-5.5'
const reasoningEffort = argument('reasoning') || 'high'
if (!['low', 'medium', 'high', 'xhigh'].includes(reasoningEffort)) throw new Error('Le raisonnement doit être low, medium, high ou xhigh.')
const reset = process.argv.includes('--reset')
const finalizeOnly = process.argv.includes('--finalize-only')
const dryRun = process.argv.includes('--dry-run')
const mock = process.argv.includes('--mock')
const pedagogyReview = process.argv.includes('--pedagogy')
if (randomForms > 0 && categoryForms > 0) throw new Error('Utilise soit --random-forms, soit --category-forms, pas les deux.')
const sampleRun = randomForms > 0 || categoryForms > 0
const activeStateFile = mock
  ? MOCK_STATE_FILE
  : pedagogyReview
    ? sampleRun ? PEDAGOGY_SAMPLE_STATE_FILE : PEDAGOGY_STATE_FILE
    : sampleRun ? SAMPLE_STATE_FILE : STATE_FILE
const activeSummaryFile = mock
  ? MOCK_SUMMARY_FILE
  : pedagogyReview
    ? sampleRun ? PEDAGOGY_SAMPLE_SUMMARY_FILE : PEDAGOGY_SUMMARY_FILE
    : sampleRun ? SAMPLE_SUMMARY_FILE : SUMMARY_FILE

function hash(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex')
}

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'))
}

function semanticEvaluatorPrompt(units) {
  return `Tu es linguiste spécialiste de la conjugaison française et pédagogue FLE/FALC.

Évalue CHAQUE unité ci-dessous. Le HTML est le rendu exact montré à l'apprenant. Il peut contenir des badges séparant visuellement un radical et une terminaison : lis leur texte dans l'ordre.

Une unité est « approved » seulement si :
- la forme attendue, la règle, le radical, la terminaison, l'auxiliaire et les accords sont exacts ;
- la procédure permet réellement de trouver la réponse sans partir de la réponse elle-même ;
- la forme repère choisie est pertinente pour ce temps, ce mode et ce verbe ;
- les consignes ne se contredisent pas et ne créent pas de boucle pédagogique ;
- le français est compréhensible et suffisamment simple pour une personne allophone ;
- les cas irréguliers sont annoncés ou appris par cœur quand une règle régulière ne suffit pas.

Ne rejette pas pour une préférence stylistique mineure. Rejette toute erreur linguistique ou pédagogique susceptible d'apprendre une règle fausse. Pour un rejet, donne un code stable, un détail précis et une correction concrète.

Le schéma exige aussi un objet "pedagogy" pour chaque verdict. Dans cette revue sémantique, remplis-le brièvement : clarity, actionable, learnerLevelFit, cognitiveLoad, redundancy, mainPedagogicalRisk et suggestedRewrite.

Réponds uniquement selon le schéma JSON demandé, avec exactement un verdict par unitId.

UNITÉS À ÉVALUER :
${JSON.stringify(units, null, 2)}`
}

function pedagogyEvaluatorPrompt(units) {
  return `Tu es pédagogue FLE/FALC et spécialiste de la conjugaison française.

Évalue CHAQUE unité ci-dessous du point de vue d'un élève allophone ou fragile en conjugaison. Le HTML est le rendu exact montré à l'apprenant. Il peut contenir des badges, tableaux et blocs visuels : lis leur texte dans l'ordre.

Objectif de l'évaluation : dire si l'aide "porte" pédagogiquement, c'est-à-dire si un élève qui connaît mal la conjugaison peut réellement comprendre quoi faire pour répondre.

Une unité est « approved » seulement si :
- l'explication est grammaticalement exacte ;
- la procédure ne part pas de la réponse elle-même ;
- la forme repère est présentée comme quelque chose à apprendre par cœur quand c'est nécessaire ;
- les étapes sont dans un ordre utile : comprendre le contexte, savoir quoi retenir, construire la réponse, vérifier ;
- le vocabulaire est accessible à un élève allophone/FALC ou les mots techniques sont utiles et contextualisés ;
- l'aide est actionnable : après lecture, l'élève sait précisément quelle action faire ;
- la charge cognitive est raisonnable : pas trop d'informations simultanées, pas trop de règles secondaires au mauvais endroit ;
- il n'y a pas de redondance problématique : pas de répétition qui alourdit sans clarifier, pas deux blocs qui disent la même chose, pas une consigne reformulée plusieurs fois sans valeur ajoutée ;
- les blocs visuels aident la compréhension et ne créent pas de confusion.

Ne rejette pas une préférence stylistique mineure. Rejette si l'aide est exacte mais trop abstraite, trop lourde, ambiguë, redondante, ou insuffisamment actionnable pour un élève fragile.

Pour chaque verdict, remplis aussi l'objet "pedagogy" :
- clarity : good, medium ou poor ;
- actionable : true si l'élève sait quoi faire ;
- learnerLevelFit : good, medium ou poor ;
- cognitiveLoad : low, medium ou high ;
- redundancy : none, minor ou problematic ;
- mainPedagogicalRisk : risque principal en une phrase courte, ou chaîne vide ;
- suggestedRewrite : reformulation concrète si utile, ou chaîne vide.

Pour un rejet, donne un code stable, un détail précis et une correction concrète dans "issues". Réponds uniquement selon le schéma JSON demandé, avec exactement un verdict par unitId.

UNITÉS À ÉVALUER :
${JSON.stringify(units, null, 2)}`
}

function evaluatorPrompt(units) {
  return pedagogyReview ? pedagogyEvaluatorPrompt(units) : semanticEvaluatorPrompt(units)
}

function neutralPedagogyVerdict() {
  return {
    clarity: 'good',
    actionable: true,
    learnerLevelFit: 'good',
    cognitiveLoad: 'low',
    redundancy: 'none',
    mainPedagogicalRisk: '',
    suggestedRewrite: '',
  }
}

async function isExecutable(path) {
  try {
    await access(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}

async function findCodexBinary() {
  const explicit = process.env.CODEX_BIN || process.env.CODEX_CLI_PATH
  if (explicit && await isExecutable(explicit)) return explicit
  for (const directory of (process.env.PATH || '').split(':').filter(Boolean)) {
    const candidate = join(directory, 'codex')
    if (await isExecutable(candidate)) return candidate
  }
  const home = homedir()
  const extensionRoot = join(home, '.vscode', 'extensions')
  const extensionDirectories = await readdir(extensionRoot).catch(() => [])
  const extensionCandidates = extensionDirectories
    .filter(name => name.startsWith('openai.chatgpt-'))
    .sort((left, right) => right.localeCompare(left))
    .flatMap(name => [
      join(extensionRoot, name, 'bin', 'macos-aarch64', 'codex'),
      join(extensionRoot, name, 'bin', 'macos-x64', 'codex'),
      join(extensionRoot, name, 'bin', 'linux-x64', 'codex'),
    ])
  for (const candidate of [
    ...extensionCandidates,
    '/opt/homebrew/bin/codex',
    '/usr/local/bin/codex',
  ]) {
    if (await isExecutable(candidate)) return candidate
  }
  throw new Error('Binaire Codex introuvable. Définis CODEX_BIN=/chemin/vers/codex ou ajoute codex au PATH.')
}

const codexBinary = mock || finalizeOnly ? null : await findCodexBinary()

async function runCodexBatch(units, batchNumber) {
  if (mock) {
    return {
      verdicts: units.map(unit => ({
        unitId: unit.id,
        verdict: 'approved',
        confidence: 'high',
        pedagogy: neutralPedagogyVerdict(),
        issues: [],
      })),
    }
  }
  await mkdir(EVALUATOR_DIR, { recursive: true })
  const outputFile = new URL(`verdict-${process.pid}-${batchNumber}.json`, EVALUATOR_DIR)
  const args = [
    'exec', '--ephemeral', '--sandbox', 'read-only',
    '--model', model, '--config', `model_reasoning_effort="${reasoningEffort}"`,
    '--skip-git-repo-check', '--output-schema', SCHEMA_FILE.pathname,
    '--output-last-message', outputFile.pathname, '-',
  ]
  const child = spawn(codexBinary, args, {
    cwd: EVALUATOR_DIR.pathname,
    stdio: ['pipe', 'inherit', 'inherit'],
    env: process.env,
  })
  let stdinError
  child.stdin.once('error', error => {
    if (error?.code !== 'EPIPE') stdinError = error
  })
  child.stdin.end(evaluatorPrompt(units))
  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', code => resolve(code ?? 1))
  })
  if (stdinError) throw stdinError
  if (exitCode !== 0) throw new Error(`Codex a quitté le lot ${batchNumber} avec le code ${exitCode}.`)
  try {
    return await readJson(outputFile)
  } finally {
    await unlink(outputFile).catch(() => {})
  }
}

function validateVerdicts(units, response) {
  const expected = new Set(units.map(unit => unit.id))
  const verdicts = Array.isArray(response?.verdicts) ? response.verdicts : []
  if (verdicts.length !== units.length) throw new Error(`Le modèle a rendu ${verdicts.length} verdicts pour ${units.length} unités.`)
  const seen = new Set()
  for (const verdict of verdicts) {
    if (!expected.has(verdict.unitId)) throw new Error(`Verdict inattendu : ${verdict.unitId}.`)
    if (seen.has(verdict.unitId)) throw new Error(`Verdict dupliqué : ${verdict.unitId}.`)
    if (!['approved', 'rejected'].includes(verdict.verdict)) throw new Error(`Verdict invalide pour ${verdict.unitId}.`)
    const pedagogy = verdict.pedagogy
    if (!pedagogy || typeof pedagogy !== 'object') throw new Error(`Critères pédagogiques manquants pour ${verdict.unitId}.`)
    if (!['good', 'medium', 'poor'].includes(pedagogy.clarity)) throw new Error(`Clarté invalide pour ${verdict.unitId}.`)
    if (typeof pedagogy.actionable !== 'boolean') throw new Error(`Critère actionable invalide pour ${verdict.unitId}.`)
    if (!['good', 'medium', 'poor'].includes(pedagogy.learnerLevelFit)) throw new Error(`Niveau apprenant invalide pour ${verdict.unitId}.`)
    if (!['low', 'medium', 'high'].includes(pedagogy.cognitiveLoad)) throw new Error(`Charge cognitive invalide pour ${verdict.unitId}.`)
    if (!['none', 'minor', 'problematic'].includes(pedagogy.redundancy)) throw new Error(`Redondance invalide pour ${verdict.unitId}.`)
    seen.add(verdict.unitId)
  }
  return verdicts
}

function seededRandom(seed) {
  let state = Number.parseInt(hash(seed).slice(0, 8), 16) || 1
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function shuffle(items, seed) {
  const random = seededRandom(seed)
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swapIndex]
    copy[swapIndex] = current
  }
  return copy
}

function exactRenderedFormUnits(queue, count, seed) {
  const cases = []
  const seen = new Set()
  for (const unit of queue.units || []) {
    for (const item of unit.cases || []) {
      if (!item.html || seen.has(item.key)) continue
      seen.add(item.key)
      cases.push({
        id: `random-form:${item.key}`,
        kind: 'random-form',
        layers: [...new Set([...(unit.layers || []), 'random-form'])],
        key: item.key,
        verbId: item.verbId,
        verb: item.verb,
        mode: item.mode,
        tense: item.tense,
        person: item.person,
        expected: item.expected,
        signature: item.signature,
        html: item.html,
      })
    }
  }
  const selected = shuffle(cases, seed).slice(0, count)
  if (selected.length < count) {
    throw new Error(`Seulement ${selected.length} formes avec HTML exact sont disponibles pour l’échantillon demandé (${count}).`)
  }
  return {
    ...queue,
    sample: { randomForms: count, seed },
    units: selected,
  }
}

function normalized(value = '') {
  return String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[’]/gu, "'").replace(/\s+/gu, ' ').trim().toLocaleLowerCase('fr')
}

function visibleText(html = '') {
  return String(html)
    .replace(/&nbsp;/giu, ' ')
    .replace(/&#(?:0*39);|&#x0*27;|&apos;/giu, "'")
    .replace(/&quot;/giu, '"')
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function caseCategories(item, unit) {
  const signatureParts = String(item.signature || '').split('|')
  const mode = normalized(item.mode)
  const tense = normalized(item.tense)
  const person = normalized(item.person).replace(/^que\s+/, '')
  const strategy = signatureParts[4] || 'unknown-strategy'
  const spelling = signatureParts[5] || 'none'
  const family = signatureParts[6] || 'unknown-family'
  const htmlText = normalized(visibleText(item.html))
  const categories = new Set([
    `mode:${mode || 'unknown'}`,
    `tense:${mode || 'unknown'}:${tense || 'unknown'}`,
    `person:${person || 'unknown'}`,
    `strategy:${strategy}`,
    `family:${family}`,
  ])
  if (String(item.signature || '').includes('|compound|') || htmlText.includes('verbe auxiliaire')) categories.add('form:compound')
  else categories.add('form:simple')
  if (unit?.kind) categories.add(`queue:${unit.kind}`)
  for (const layer of unit?.layers || []) categories.add(`layer:${layer}`)
  if (spelling && spelling !== 'none') categories.add(`spelling:${spelling}`)
  if (/^(?:se\s+|s['’])/iu.test(item.verb || '')) categories.add('risk:pronominal')
  if (/\b(?:j'|j’)[a-zàâéèêëîïôùûüÿç]/iu.test(visibleText(item.html))) categories.add('risk:elision-je')
  if (htmlText.includes("n'ajoute pas de terminaison")) categories.add('risk:empty-ending')
  if (htmlText.includes('pronom reflechi')) categories.add('risk:reflexive-pronoun')
  if (htmlText.includes('s ou pas s avec tu')) categories.add('risk:imperative-tu-s')
  if (htmlText.includes("n'ecris pas le pronom sujet")) categories.add('risk:imperative-no-subject-pronoun')
  if (htmlText.includes('accord du participe passe')) categories.add('risk:past-participle-agreement')
  if (htmlText.includes('cod est place avant') || htmlText.includes('cod est place')) categories.add('risk:cod-before')
  if (htmlText.includes('quel verbe auxiliaire')) categories.add('risk:compound-auxiliary')
  if (htmlText.includes('avoir') && htmlText.includes('etre') && htmlText.includes('participe passe')) categories.add('risk:auxiliary-choice')
  if (htmlText.includes('la lettre g')) categories.add('risk:letter-g')
  if (htmlText.includes('la lettre c')) categories.add('risk:letter-c')
  if (htmlText.includes('cedille')) categories.add('risk:cedilla')
  if (htmlText.includes('pref') || /[éèê]/iu.test(item.verb || '') && /[éèê]/iu.test(item.expected || '')) categories.add('risk:e-accent-alternation')
  if (mode === 'subjonctif' && tense === 'present' && htmlText.includes('deux formes reperes')) categories.add('risk:subjunctive-present-two-stems')
  if (mode === 'subjonctif' && tense === 'imparfait') categories.add('risk:subjunctive-imperfect')
  if (mode === 'conditionnel' && tense === 'present') categories.add('risk:conditional-future-stem')
  if (mode === 'imperatif') categories.add('risk:imperative')
  if (strategy.includes('memorized')) categories.add('risk:memorized')
  if (strategy.includes('future')) categories.add('risk:future-stem')
  if (strategy.includes('past-simple')) categories.add('risk:past-simple-reference')
  if (strategy.includes('present-ils')) categories.add('risk:present-ils-reference')
  if (strategy.includes('present-nous')) categories.add('risk:present-nous-reference')
  if (family.includes('venir') || family.includes('tenir')) categories.add('risk:venir-tenir')
  if (family.includes('dre') || family.includes('tre')) categories.add('risk:third-group-ending')
  if ((item.expected || '').includes('ç')) categories.add('risk:target-cedilla')
  if ((item.expected || '').includes('ge')) categories.add('risk:target-ge')
  return [...categories].sort((left, right) => left.localeCompare(right, 'fr'))
}

function exactRenderedCases(queue, kind) {
  const cases = []
  const seen = new Set()
  for (const unit of queue.units || []) {
    for (const item of unit.cases || []) {
      if (!item.html || seen.has(item.key)) continue
      seen.add(item.key)
      const categories = caseCategories(item, unit)
      cases.push({
        id: `${kind}:${item.key}`,
        kind,
        layers: [...new Set([...(unit.layers || []), kind])],
        key: item.key,
        verbId: item.verbId,
        verb: item.verb,
        mode: item.mode,
        tense: item.tense,
        person: item.person,
        expected: item.expected,
        signature: item.signature,
        categories,
        html: item.html,
      })
    }
  }
  return cases
}

function categorizedRenderedFormUnits(queue, count, seed) {
  const candidates = exactRenderedCases(queue, 'category-form')
  const selected = []
  const selectedKeys = new Set()
  const covered = new Set()
  const allCategories = new Set(candidates.flatMap(item => item.categories))
  const ranked = candidates.map(item => ({ item, rank: hash(`${seed}:${item.key}`) }))
  while (selected.length < count && covered.size < allCategories.size) {
    let best = null
    for (const current of ranked) {
      if (selectedKeys.has(current.item.key)) continue
      const gain = current.item.categories.filter(category => !covered.has(category)).length
      if (!gain) continue
      if (!best
        || gain > best.gain
        || (gain === best.gain && current.item.categories.length > best.item.categories.length)
        || (gain === best.gain && current.item.categories.length === best.item.categories.length && current.rank.localeCompare(best.rank) < 0)) {
        best = { ...current, gain }
      }
    }
    if (!best) break
    selected.push(best.item)
    selectedKeys.add(best.item.key)
    for (const category of best.item.categories) covered.add(category)
  }
  if (selected.length < count) {
    const remaining = shuffle(candidates.filter(item => !selectedKeys.has(item.key)), seed)
    for (const item of remaining.slice(0, count - selected.length)) {
      selected.push(item)
      selectedKeys.add(item.key)
      for (const category of item.categories) covered.add(category)
    }
  }
  if (selected.length < count) {
    throw new Error(`Seulement ${selected.length} formes avec HTML exact sont disponibles pour l’échantillon demandé (${count}).`)
  }
  return {
    ...queue,
    sample: {
      categoryForms: count,
      seed,
      availableCases: candidates.length,
      availableCategories: allCategories.size,
      coveredCategories: covered.size,
      categories: [...covered].sort((left, right) => left.localeCompare(right, 'fr')),
    },
    units: selected,
  }
}

async function writeSampleSummary({ queue, state }) {
  const results = Object.values(state.results || {})
  const rejected = results.filter(item => item.verdict === 'rejected')
  const byUnit = new Map((queue.units || []).map(unit => [unit.id, unit]))
  const summary = {
    schemaVersion: 1,
    sample: true,
    reviewKind: pedagogyReview ? 'pedagogy' : 'semantic',
    reviewVersion: COACH_HELP_REVIEW_VERSION,
    generatedAt: new Date().toISOString(),
    help: queue.help,
    selection: queue.sample,
    units: {
      total: queue.units.length,
      reviewed: results.length,
      remaining: queue.units.length - results.length,
      approved: results.filter(item => item.verdict === 'approved').length,
      rejected: rejected.length,
    },
    rejected: rejected.map(verdict => ({
      unit: byUnit.get(verdict.unitId) || { id: verdict.unitId },
      confidence: verdict.confidence,
      pedagogy: verdict.pedagogy || null,
      issues: verdict.issues,
    })),
    approved: results
      .filter(item => item.verdict === 'approved')
      .map(verdict => byUnit.get(verdict.unitId) || { id: verdict.unitId }),
  }
  await writeFile(activeSummaryFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  return summary
}

function requiredUnitIds(review, cases, caseUnitIds) {
  const verbCases = cases.filter(item => item.verbId === review.verbId)
  const ids = new Set(verbCases.map(item => `model:${item.signature}`))
  const sampleKeys = new Set(review.layers?.sample?.keys || [])
  for (const item of verbCases) {
    const irregular = !item.referenceKind || String(item.referenceKind).startsWith('memorized')
    const suspicious = item.issues.length > 0 || Boolean(item.suggestedCorrection)
    if (irregular || suspicious || sampleKeys.has(item.key)) {
      for (const unitId of caseUnitIds.get(item.key) || []) ids.add(unitId)
    }
  }
  return [...ids]
}

async function persistCompletedReviews({ audit, queue, state }) {
  const results = new Map(Object.entries(state.results || {}))
  const caseUnitIds = new Map()
  for (const unit of queue.units) {
    for (const key of unit.caseKeys || []) {
      const ids = caseUnitIds.get(key) || []
      ids.push(unit.id)
      caseUnitIds.set(key, ids)
    }
  }
  const completed = []
  const pending = []
  for (const automatic of audit.verbReviews) {
    const required = requiredUnitIds(automatic, audit.cases, caseUnitIds)
    const missing = required.filter(id => !results.has(id))
    if (missing.length) {
      pending.push({ verbId: automatic.verbId, verb: automatic.verb, remaining: missing.length })
      continue
    }
    const aiVerdicts = required.map(id => results.get(id))
    const aiIssues = aiVerdicts.flatMap(verdict => verdict.verdict === 'rejected'
      ? verdict.issues.map(issue => ({ unitId: verdict.unitId, confidence: verdict.confidence, ...issue }))
      : [])
    const automaticIssues = automatic.issues || []
    const issues = [...automaticIssues, ...aiIssues]
    completed.push({
      ...automatic,
      status: issues.length ? 'rejected' : 'approved',
      issueCount: issues.length,
      issues,
      requiredUnits: required.length,
    })
  }

  if (!dryRun && completed.length) {
    const database = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      charset: 'utf8mb4',
    })
    try {
      await database.beginTransaction()
      await database.execute('DELETE FROM coach_help_verb_reviews WHERE help_id=? AND audit_version=?', [audit.help.id, COACH_HELP_REVIEW_VERSION])
      for (const review of completed) {
        const layers = {
          ...review.layers,
          ai: { complete: true, checked: review.requiredUnits },
        }
        await database.execute(`INSERT INTO coach_help_verb_reviews
          (help_id,verb_id,status,audit_version,help_updated_at,help_fingerprint,verb_fingerprint,
           checked_cases,total_cases,checked_signatures,issue_count,review_layers,issues_json,reviewed_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`, [
          audit.help.id, review.verbId, review.status, COACH_HELP_REVIEW_VERSION,
          audit.help.updatedAt, audit.help.fingerprint, review.verbFingerprint,
          review.checkedCases, review.totalCases, review.checkedSignatures,
          review.issueCount, JSON.stringify(layers), JSON.stringify(review.issues),
        ])
      }
      await database.commit()
    } catch (error) {
      await database.rollback()
      throw error
    } finally {
      await database.end()
    }
  }

  const summary = {
    schemaVersion: 1,
    reviewKind: pedagogyReview ? 'pedagogy' : 'semantic',
    reviewVersion: COACH_HELP_REVIEW_VERSION,
    generatedAt: new Date().toISOString(),
    help: queue.help,
    units: {
      total: queue.units.length,
      reviewed: results.size,
      remaining: queue.units.length - results.size,
      approved: [...results.values()].filter(item => item.verdict === 'approved').length,
      rejected: [...results.values()].filter(item => item.verdict === 'rejected').length,
    },
    verbs: {
      total: audit.verbReviews.length,
      completed: completed.length,
      pending: pending.length,
      approved: completed.filter(item => item.status === 'approved').length,
      rejected: completed.filter(item => item.status === 'rejected').length,
    },
    pending: pending.slice(0, 100),
  }
  await writeFile(activeSummaryFile, `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  return summary
}

const baseQueue = await readJson(QUEUE_FILE)
const audit = await readJson(AUDIT_FILE)
if (pedagogyReview && !sampleRun && !dryRun) {
  throw new Error('La revue pédagogique complète n’écrit pas encore dans les tags verbes. Utilise --category-forms=N ou --random-forms=N, ou ajoute --dry-run.')
}
if (baseQueue.help?.fingerprint !== audit.help?.fingerprint) throw new Error('La file IA et l’audit automatique ne concernent pas la même version de l’aide. Relance d’abord l’audit automatique.')
const queue = categoryForms > 0
  ? categorizedRenderedFormUnits(baseQueue, categoryForms, randomSeed)
  : randomForms > 0
    ? exactRenderedFormUnits(baseQueue, randomForms, randomSeed)
    : baseQueue

const queueFingerprint = hash(queue)
let state
if (!reset) {
  state = await readJson(activeStateFile).catch(() => null)
}
if (state && state.queueFingerprint !== queueFingerprint) {
  throw new Error('L’aide ou la file de test a changé. Relance avec --reset pour commencer une nouvelle campagne IA.')
}
state ||= {
  schemaVersion: 1,
  reviewVersion: COACH_HELP_REVIEW_VERSION,
  queueFingerprint,
  help: queue.help,
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  results: {},
}
if (state.reviewVersion !== COACH_HELP_REVIEW_VERSION) {
  throw new Error('Cette campagne utilise une ancienne version du test. Relance avec --reset.')
}

let interrupted = false
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { interrupted = true })

if (!finalizeOnly) {
  const pending = queue.units.filter(unit => !state.results[unit.id])
  if (pedagogyReview) console.log('Mode revue IA : pédagogie / clarté / redondance.')
  if (categoryForms > 0) console.log(`Échantillon IA catégoriel : ${queue.units.length.toLocaleString('fr-CH')} formes · ${queue.sample.coveredCategories} / ${queue.sample.availableCategories} catégories couvertes · seed ${randomSeed}.`)
  else if (sampleRun) console.log(`Échantillon IA : ${queue.units.length.toLocaleString('fr-CH')} formes au hasard · seed ${randomSeed}.`)
  console.log(`${pending.length.toLocaleString('fr-CH')} unités IA restantes sur ${queue.units.length.toLocaleString('fr-CH')}.`)
  let batches = 0
  for (let offset = 0; offset < pending.length && !interrupted; offset += batchSize) {
    if (maxBatches && batches >= maxBatches) break
    const units = pending.slice(offset, offset + batchSize)
    const batchNumber = Math.floor(Object.keys(state.results).length / batchSize) + 1
    console.log(`\nLot IA ${batchNumber} · ${units.length} unités…`)
    const response = await runCodexBatch(units, batchNumber)
    for (const verdict of validateVerdicts(units, response)) state.results[verdict.unitId] = verdict
    state.updatedAt = new Date().toISOString()
    await writeFile(activeStateFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
    batches += 1
    const reviewed = Object.keys(state.results).length
    console.log(`${reviewed.toLocaleString('fr-CH')} / ${queue.units.length.toLocaleString('fr-CH')} unités revues (${(reviewed / queue.units.length * 100).toFixed(1)} %).`)
  }
}

const summary = sampleRun
  ? await writeSampleSummary({ queue, state })
  : await persistCompletedReviews({ audit, queue, state })
console.log(`\nRevue IA : ${summary.units.reviewed.toLocaleString('fr-CH')} / ${summary.units.total.toLocaleString('fr-CH')} unités.`)
if (sampleRun) {
  console.log(`${summary.units.approved} approuvées · ${summary.units.rejected} rejetées.`)
  console.log(`Résumé échantillon : ${activeSummaryFile.pathname}`)
} else {
  console.log(`Verbes finalisés : ${summary.verbs.completed} / ${summary.verbs.total} · ${summary.verbs.approved} approuvés · ${summary.verbs.rejected} rejetés.`)
  if (summary.units.remaining) console.log('Relance la même commande pour reprendre exactement où le test s’est arrêté.')
  else console.log('Campagne IA terminée. Les tags « Approuvé » correspondent maintenant aux deux contrôles.')
}
