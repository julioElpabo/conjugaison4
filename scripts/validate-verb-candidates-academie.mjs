import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { mkdir } from 'node:fs/promises'

import { normalizeFrench } from './audit-missing-french-verbs.mjs'
import { isDirectScriptExecution } from './utils/direct-execution.mjs'

const SEARCH_URL = 'https://www.dictionnaire-academie.fr/search'
const PILOT_EXCLUSIONS = new Map([
  ['bosser', 'registre familier : à conserver pour un lot ultérieur'],
  ['bénir', 'participe variable selon le sens (béni/bénit) : validation manuelle nécessaire'],
  ['choper', 'registre familier : à conserver pour un lot ultérieur'],
  ['convenir', 'auxiliaire variable selon le sens : validation éditoriale nécessaire'],
  ['empirer', 'auxiliaire variable selon l’emploi : validation éditoriale nécessaire'],
  ['ficher', 'forte polysémie et emplois familiers : contrôle éditorial nécessaire'],
  ['foirer', 'registre familier : à conserver pour un lot ultérieur'],
  ['kidnapper', 'sens sensible : contrôle éditorial nécessaire avant publication'],
  ['parfaire', 'verbe défectif : validation manuelle nécessaire avant publication'],
  ['piger', 'registre familier : à conserver pour un lot ultérieur'],
  ['repartir', 'plusieurs paradigmes homographes dans Morphalou : validation manuelle nécessaire'],
  ['ressortir', 'deux conjugaisons selon le sens : validation manuelle nécessaire'],
])

function option(name, fallback = '') {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) || fallback
}

function decodeHtml(value) {
  const named = new Map([
    ['agrave', 'à'], ['amp', '&'], ['apos', "'"], ['eacute', 'é'],
    ['egrave', 'è'], ['ecirc', 'ê'], ['gt', '>'], ['icirc', 'î'],
    ['lt', '<'], ['nbsp', ' '], ['ocirc', 'ô'], ['quot', '"'],
    ['rsquo', '’'], ['ucirc', 'û'],
  ])
  return value
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/giu, (entity, code) => {
      if (code.startsWith('#x')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
      if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
      return named.get(code.toLocaleLowerCase('en')) ?? entity
    })
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function academyLabelLemma(value) {
  return normalizeFrench(value)
    .replace(/\s+\((?:s[’']|se)\)$/u, '')
}

export function selectAcademySearchHit(lemma, results) {
  const normalizedLemma = normalizeFrench(lemma)
  const exactVerbHits = results.filter(result => (
    academyLabelLemma(result.label) === normalizedLemma
    && /\bv\./iu.test(result.nature || '')
  ))
  if (!exactVerbHits.length) return null
  return exactVerbHits.find(result => !/^v\.\s*pron\./iu.test(result.nature || ''))
    || exactVerbHits[0]
}

export function academyCandidateKind(nature) {
  const value = normalizeFrench(nature)
  if (/^v\.\s*pron\./u.test(value)) return 'pronominal essentiel'
  if (/\bv\./u.test(value)) return 'verbe de base'
  return 'non verbal'
}

export function conjugationMetadata(html) {
  const text = decodeHtml(html)
  const groupMatch = text.match(/Verbe(?: régulier)? du ([^,.]{1,80}?groupe[^,.]{0,80})[,.]/iu)
  const modelMatch = text.match(/se conjugue comme ([\p{L}’'-]+)/iu)
  const auxiliaryMatch = text.match(
    /se conjugue avec l[’']auxiliaire (avoir|être)(?: ou (avoir|être))?/iu,
  )
  return {
    groupDescription: groupMatch?.[1]?.trim() || '',
    model: modelMatch?.[1]?.trim() || '',
    auxiliary: auxiliaryMatch
      ? [...new Set(auxiliaryMatch.slice(1).filter(Boolean).map(value => value.toLocaleLowerCase('fr')))].join('/')
      : 'avoir',
    isImpersonal: /Ce verbe est impersonnel/iu.test(text),
    isDefective: /Ce verbe est défectif/iu.test(text),
    allowsPronominal: /peut se conjuguer à la forme pronominale/iu.test(text),
    requiresAdverbialPronoun: /forme pronominale, avec le pronom adverbial (?:en|y)/iu.test(text),
  }
}

async function validateCandidate(candidate) {
  try {
    const body = new URLSearchParams({ term: candidate.lemma, options: '1' })
    const searchResponse = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
      },
      body,
    })
    if (!searchResponse.ok) {
      return { ...candidate, academyStatus: `recherche HTTP ${searchResponse.status}` }
    }

    const search = await searchResponse.json()
    const hit = selectAcademySearchHit(candidate.lemma, search.result || [])
    if (!hit) return { ...candidate, academyStatus: 'introuvable comme verbe' }

    const articleId = hit.url.split('/').pop()
    const conjugationUrl = `https://www.dictionnaire-academie.fr/conjuguer/${articleId}`
    const conjugationResponse = await fetch(conjugationUrl)
    const metadata = conjugationResponse.ok
        ? conjugationMetadata(await conjugationResponse.text())
        : {
          groupDescription: '',
          model: '',
          auxiliary: 'avoir',
          isImpersonal: false,
          isDefective: false,
          allowsPronominal: false,
          requiresAdverbialPronoun: false,
        }

    return {
      ...candidate,
      academyStatus: conjugationResponse.ok ? 'attesté' : `conjugaison HTTP ${conjugationResponse.status}`,
      academyLabel: hit.label,
      academyNature: hit.nature,
      academyKind: academyCandidateKind(hit.nature),
      academyArticleUrl: hit.url,
      academyConjugationUrl: conjugationUrl,
      ...metadata,
    }
  }
  catch (error) {
    return { ...candidate, academyStatus: `erreur : ${error instanceof Error ? error.message : String(error)}` }
  }
}

async function validateInBatches(candidates, batchSize = 8) {
  const validated = []
  for (let index = 0; index < candidates.length; index += batchSize) {
    const batch = candidates.slice(index, index + batchSize)
    validated.push(...await Promise.all(batch.map(validateCandidate)))
    console.error(`Académie : ${Math.min(index + batchSize, candidates.length)}/${candidates.length}`)
  }
  return validated
}

function markdownCell(value) {
  return String(value ?? '').replace(/\|/gu, '\\|').replace(/\r?\n/gu, ' ')
}

function renderValidatedReport(sourceReport, validated, selected, excluded, essential, unresolved) {
  const lines = [
    '# Lot pilote de verbes validé auprès de l’Académie',
    '',
    `Rapport généré le ${new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}.`,
    '',
    'Cette validation est en lecture seule. Aucun verbe n’a été ajouté à MySQL.',
    '',
    '## Résumé',
    '',
    `- candidats contrôlés : ${validated.length} ;`,
    `- verbes de base retenus pour examen : ${selected.length} ;`,
    `- verbes attestés écartés du premier lot : ${excluded.length} ;`,
    `- verbes uniquement pronominaux séparés du lot : ${essential.length} ;`,
    `- candidats non résolus : ${unresolved.length}.`,
    '',
    '## Lot pilote proposé',
    '',
    '| Priorité | Infinitif | Fréquence | Nature Académie | Groupe ou modèle | Source |',
    '|---:|---|---:|---|---|---|',
    ...selected.map((candidate, index) => {
      const model = candidate.model
        ? `comme ${candidate.model}`
        : candidate.groupDescription || candidate.family
      return `| ${index + 1} | ${markdownCell(candidate.lemma)} | ${candidate.frequency.toLocaleString('fr-CH')} | ${markdownCell(candidate.academyNature)} | ${markdownCell(model)} | [article](${candidate.academyArticleUrl}) |`
    }),
    '',
    '## Verbes attestés écartés du premier lot',
    '',
  ]

  if (!excluded.length) {
    lines.push('Aucun.')
  }
  else {
    lines.push(
      '| Infinitif | Motif | Source |',
      '|---|---|---|',
      ...excluded.map(candidate => (
        `| ${markdownCell(candidate.lemma)} | ${markdownCell(candidate.pilotExclusionReason)} | [article](${candidate.academyArticleUrl}) |`
      )),
    )
  }

  lines.push(
    '',
    '## Verbes pronominaux essentiels à traiter séparément',
    '',
  )

  if (!essential.length) {
    lines.push('Aucun dans le groupe contrôlé.')
  }
  else {
    lines.push(
      '| Lemme Lexique | Entrée Académie | Fréquence | Source |',
      '|---|---|---:|---|',
      ...essential.map(candidate => (
        `| ${markdownCell(candidate.lemma)} | ${markdownCell(candidate.academyLabel)} | ${candidate.frequency.toLocaleString('fr-CH')} | [article](${candidate.academyArticleUrl}) |`
      )),
    )
  }

  lines.push(
    '',
    '## Candidats non résolus automatiquement',
    '',
  )
  if (!unresolved.length) {
    lines.push('Aucun.')
  }
  else {
    lines.push(
      '| Infinitif | Fréquence | Résultat |',
      '|---|---:|---|',
      ...unresolved.map(candidate => (
        `| ${markdownCell(candidate.lemma)} | ${candidate.frequency.toLocaleString('fr-CH')} | ${markdownCell(candidate.academyStatus)} |`
      )),
    )
  }

  lines.push(
    '',
    '## Contrôles encore nécessaires avant import',
    '',
    '- [ ] comparer les paradigmes complets avec Morphalou ;',
    '- [ ] valider les auxiliaires et les participes ;',
    '- [ ] contrôler les registres familiers et les sens sensibles ;',
    '- [ ] confirmer les verbes défectifs ou impersonnels ;',
    '- [ ] rédiger les définitions FALC minimales ;',
    '- [ ] exécuter une simulation transactionnelle du lot.',
    '',
    '## Traçabilité',
    '',
    `- rapport source : \`${markdownCell(sourceReport)}\` ;`,
    '- autorité de validation : Dictionnaire de l’Académie française, édition disponible au moment du contrôle.',
    '',
  )
  return `${lines.join('\n')}\n`
}

export async function runAcademyValidation({
  inputPath,
  outputPath,
  jsonOutputPath,
  limit = 100,
}) {
  const audit = JSON.parse(await readFile(inputPath, 'utf8'))
  const pool = audit.candidatePool || audit.candidates || []
  const validated = await validateInBatches(pool)
  const baseCandidates = validated.filter(candidate => (
    candidate.academyStatus === 'attesté'
    && candidate.academyKind === 'verbe de base'
    && !candidate.requiresAdverbialPronoun
  ))
  const excluded = baseCandidates
    .filter(candidate => PILOT_EXCLUSIONS.has(candidate.lemma))
    .map(candidate => ({
      ...candidate,
      pilotExclusionReason: PILOT_EXCLUSIONS.get(candidate.lemma),
    }))
  const selected = baseCandidates
    .filter(candidate => !PILOT_EXCLUSIONS.has(candidate.lemma))
    .slice(0, limit)
  const essential = validated.filter(candidate => candidate.academyKind === 'pronominal essentiel')
  const unresolved = validated.filter(candidate => candidate.academyStatus !== 'attesté')
  const report = renderValidatedReport(
    basenameForReport(inputPath),
    validated,
    selected,
    excluded,
    essential,
    unresolved,
  )
  const json = {
    generatedAt: new Date().toISOString(),
    sourceReport: basenameForReport(inputPath),
    controlledCount: validated.length,
    candidates: selected,
    excludedFromPilot: excluded,
    essentialPronominals: essential,
    unresolved,
  }

  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, report, 'utf8')
  await mkdir(dirname(jsonOutputPath), { recursive: true })
  await writeFile(jsonOutputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8')
  return json
}

function basenameForReport(path) {
  return path.split(/[\\/]/u).pop() || path
}

async function main() {
  const inputPath = resolve(option('input', 'reports/missing-french-verbs.json'))
  const outputPath = resolve(option('output', 'reports/missing-french-verbs-academie.md'))
  const jsonOutputPath = resolve(option('json-output', 'reports/missing-french-verbs-academie.json'))
  const limit = Number.parseInt(option('limit', '100'), 10)
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
    throw new Error('La limite doit être un entier compris entre 1 et 1000.')
  }
  const report = await runAcademyValidation({ inputPath, outputPath, jsonOutputPath, limit })
  console.log(
    `Validation Académie terminée : ${report.candidates.length} verbe(s) de base retenu(s), `
    + `${report.essentialPronominals.length} pronominal(aux) essentiel(s), `
    + `${report.unresolved.length} non résolu(s).`
  )
  console.log(`Rapports : ${outputPath} et ${jsonOutputPath}`)
}

if (isDirectScriptExecution(import.meta.url, 'validate-verb-candidates-academie.mjs')) {
  await main()
}
