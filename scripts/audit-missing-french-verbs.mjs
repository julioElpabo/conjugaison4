import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'

const DEFAULT_LIMIT = 100
const PEDAGOGICAL_EXCLUSIONS = new Map([
  ['chier', 'registre vulgaire'],
  ['déconner', 'registre vulgaire'],
  ['emmerder', 'registre vulgaire'],
  ['pisser', 'registre vulgaire'],
])

function option(name, fallback = '') {
  const prefix = `--${name}=`
  return process.argv.find(argument => argument.startsWith(prefix))?.slice(prefix.length) || fallback
}

export function normalizeFrench(value) {
  return String(value || '').trim().normalize('NFC').toLocaleLowerCase('fr')
}

export function searchableFrench(value) {
  return normalizeFrench(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/gu, "'")
}

function decodeHtmlEntities(value) {
  const named = new Map([
    ['amp', '&'],
    ['apos', "'"],
    ['gt', '>'],
    ['lt', '<'],
    ['nbsp', '\u00A0'],
    ['quot', '"'],
  ])
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/giu, (entity, code) => {
    if (code.startsWith('#x')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    return named.get(code.toLocaleLowerCase('en')) ?? entity
  })
}

/**
 * Accepte le TSV brut de Lexique 4 ou la page « file » produite par Stagit,
 * utilisée comme miroir lorsque le téléchargement officiel est indisponible.
 */
export function lexiqueDataLines(source) {
  const preStart = source.indexOf('<pre id="blob">')
  const preEnd = preStart >= 0 ? source.indexOf('</pre>', preStart) : -1
  const content = preStart >= 0 && preEnd > preStart
    ? source.slice(preStart + '<pre id="blob">'.length, preEnd)
    : source

  return content
    .split(/\r?\n/gu)
    .map((line) => {
      const withoutLineAnchor = line.replace(/^<a\b[^>]*>[^<]*<\/a>\s?/u, '')
      return decodeHtmlEntities(withoutLineAnchor.replace(/<[^>]+>/gu, ''))
    })
    .filter(Boolean)
}

export function parseLexiqueVerbLemmas(source) {
  const lines = lexiqueDataLines(source)
  const headerIndex = lines.findIndex(line => line.startsWith('1_Mot\t'))
  if (headerIndex < 0) {
    throw new Error('En-tête Lexique 4 introuvable.')
  }

  const headers = lines[headerIndex].split('\t')
  const indexes = new Map(headers.map((header, index) => [header, index]))
  for (const required of ['4_Lemme', '5_Cgram', '9_InfoVER', '12_FreqLemme', '14_IsLem']) {
    if (!indexes.has(required)) throw new Error(`Colonne Lexique manquante : ${required}.`)
  }

  const byLemma = new Map()
  for (const line of lines.slice(headerIndex + 1)) {
    const columns = line.split('\t')
    if (columns[indexes.get('5_Cgram')] !== 'VER') continue
    if (columns[indexes.get('14_IsLem')] !== '1') continue
    if (columns[indexes.get('9_InfoVER')] !== 'inf') continue

    const lemma = normalizeFrench(columns[indexes.get('4_Lemme')])
    if (!lemma || !/^[\p{L}][\p{L}’'-]*$/u.test(lemma)) continue
    const frequency = Number.parseFloat(columns[indexes.get('12_FreqLemme')] || '0') || 0
    const previous = byLemma.get(lemma)
    if (!previous || frequency > previous.frequency) {
      byLemma.set(lemma, { lemma, frequency })
    }
  }

  return [...byLemma.values()]
    .sort((left, right) => right.frequency - left.frequency || left.lemma.localeCompare(right.lemma, 'fr'))
}

export function probableConjugationFamily(infinitive) {
  const value = normalizeFrench(infinitive)
  if (value.endsWith('ger')) return 'ger'
  if (value.endsWith('cer')) return 'cer'
  if (value.endsWith('yer')) return 'yer'
  if (/(eler|eter)$/u.test(value)) return 'eler-eter'
  if (value.endsWith('er') && value !== 'aller') return 'er-regulier ou alternance'
  if (/(venir|tenir)$/u.test(value)) return 'venir-tenir'
  if (value.endsWith('prendre')) return 'prendre'
  if (/(mettre|battre)$/u.test(value)) return 'mettre-battre'
  if (/(voir|cevoir)$/u.test(value)) return 'voir-recevoir'
  if (/(ouvrir|offrir|souffrir|cueillir)$/u.test(value)) return 'ouvrir-cueillir'
  if (value.endsWith('ir')) return '2e groupe ou 3e groupe en -ir'
  if (/(dre|tre)$/u.test(value)) return 'dre-tre'
  if (value.endsWith('oir')) return '3e groupe en -oir'
  return 'irrégulier ou à déterminer'
}

export function estimatedImportDifficulty(infinitive) {
  const family = probableConjugationFamily(infinitive)
  if (['ger', 'cer', 'yer', 'eler-eter', 'er-regulier ou alternance'].includes(family)) return 'faible'
  if (['venir-tenir', 'prendre', 'mettre-battre', 'voir-recevoir', 'ouvrir-cueillir', 'dre-tre'].includes(family)) {
    return 'moyenne'
  }
  return 'à contrôler'
}

export function missingVerbCandidates(lexiqueLemmas, catalogueRows) {
  const bySearchable = new Map()
  for (const row of catalogueRows) {
    const names = [row.infinitif, row.forme_canonique].filter(Boolean)
    for (const name of names) {
      const normalizedName = normalizeFrench(name)
      const bareName = normalizedName.replace(/^se\s+/u, '').replace(/^s[’']/u, '')
      for (const key of new Set([searchableFrench(normalizedName), searchableFrench(bareName)])) {
        const existing = bySearchable.get(key)
        if (!existing || (!Number(row.est_archive) && Number(existing.est_archive))) {
          bySearchable.set(key, row)
        }
      }
    }
  }

  return lexiqueLemmas.map((candidate) => {
    const existing = bySearchable.get(searchableFrench(candidate.lemma))
    const canonical = normalizeFrench(existing?.forme_canonique || existing?.infinitif)
    const localInfinitive = normalizeFrench(existing?.infinitif)
      .replace(/^se\s+/u, '')
      .replace(/^s[’']/u, '')
    const canonicalBase = canonical.replace(/^se\s+/u, '').replace(/^s[’']/u, '')
    const spellingConflict = Boolean(existing && (
      canonicalBase !== candidate.lemma || localInfinitive !== candidate.lemma
    ))
    const exclusionReason = PEDAGOGICAL_EXCLUSIONS.get(candidate.lemma) || ''
    return {
      ...candidate,
      status: !existing
        ? 'absent'
        : Number(existing.est_archive)
          ? 'archivé'
          : spellingConflict
            ? 'présent — graphie à vérifier'
            : 'présent',
      existingId: existing ? Number(existing.id) : null,
      existingInfinitive: existing?.infinitif || '',
      family: probableConjugationFamily(candidate.lemma),
      difficulty: estimatedImportDifficulty(candidate.lemma),
      exclusionReason,
    }
  })
}

function markdownCell(value) {
  return String(value ?? '').replace(/\|/gu, '\\|').replace(/\r?\n/gu, ' ')
}

function renderReport({
  sourcePath,
  sourceHash,
  lexiqueCount,
  catalogueSummary,
  allCandidates,
  selectedCandidates,
  excludedCandidates,
  spellingConflicts,
}) {
  const lines = [
    '# Verbes français fréquents manquants',
    '',
    `Rapport généré le ${new Intl.DateTimeFormat('fr-CH', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}.`,
    '',
    'Ce rapport est produit en lecture seule. Il ne modifie aucune donnée MySQL.',
    '',
    '## Sources et périmètre',
    '',
    `- fichier Lexique analysé : \`${markdownCell(sourcePath)}\` ;`,
    `- empreinte SHA-256 : \`${sourceHash}\` ;`,
    `- lemmes verbaux infinitifs distincts dans Lexique : ${lexiqueCount.toLocaleString('fr-CH')} ;`,
    `- fiches locales : ${catalogueSummary.total} au total, ${catalogueSummary.active} actives et ${catalogueSummary.archived} archivées ;`,
    `- fiches actives déjà validées : ${catalogueSummary.validated} ;`,
    `- fiches actives encore à vérifier : ${catalogueSummary.toReview} ;`,
    `- fiches actives avec un rang de fréquence : ${catalogueSummary.withFrequency} ;`,
    `- candidats Lexique absents du catalogue : ${allCandidates.length.toLocaleString('fr-CH')}.`,
    '',
    'La fréquence correspond au champ `12_FreqLemme` de Lexique 4. Elle sert à classer les candidats, pas à valider leur conjugaison.',
    '',
    '## Cent premiers candidats à examiner',
    '',
    '| Priorité | Infinitif canonique | Fréquence | Famille probable | Difficulté estimée |',
    '|---:|---|---:|---|---|',
    ...selectedCandidates.map((candidate, index) => (
      `| ${index + 1} | ${markdownCell(candidate.lemma)} | ${candidate.frequency.toLocaleString('fr-CH')} | ${markdownCell(candidate.family)} | ${candidate.difficulty} |`
    )),
    '',
    '## Candidats fréquents écartés automatiquement du lot pédagogique',
    '',
  ]

  if (!excludedCandidates.length) {
    lines.push('Aucun candidat écarté automatiquement.')
  }
  else {
    lines.push(
      '| Infinitif | Fréquence | Motif |',
      '|---|---:|---|',
      ...excludedCandidates.map(candidate => (
        `| ${markdownCell(candidate.lemma)} | ${candidate.frequency.toLocaleString('fr-CH')} | ${markdownCell(candidate.exclusionReason)} |`
      )),
    )
  }

  lines.push(
    '',
    '## Conflits de graphie repérés dans le catalogue actuel',
    '',
  )

  if (!spellingConflicts.length) {
    lines.push('Aucun conflit d’accent ou de graphie détecté avec les lemmes Lexique.')
  }
  else {
    lines.push(
      '| ID local | Infinitif local | Forme Lexique | Fréquence |',
      '|---:|---|---|---:|',
      ...spellingConflicts.map(candidate => (
        `| ${candidate.existingId} | ${markdownCell(candidate.existingInfinitive)} | ${markdownCell(candidate.lemma)} | ${candidate.frequency.toLocaleString('fr-CH')} |`
      )),
    )
  }

  lines.push(
    '',
    '## Contrôles à effectuer avant tout import',
    '',
    '- [ ] confirmer que chaque candidat est bien un verbe français contemporain ;',
    '- [ ] confirmer son infinitif canonique dans une deuxième source ;',
    '- [ ] vérifier son groupe et son modèle de conjugaison ;',
    '- [ ] vérifier son participe présent et son participe passé ;',
    '- [ ] vérifier son auxiliaire et ses éventuels changements selon le sens ;',
    '- [ ] repérer les verbes impersonnels ou défectifs ;',
    '- [ ] vérifier les variantes admises ;',
    '- [ ] ne traiter les emplois pronominaux que dans un lot séparé.',
    '',
    '## Décision',
    '',
    'Aucun de ces verbes ne doit être importé avant validation du lot pilote.',
    '',
  )

  return `${lines.join('\n')}\n`
}

export async function runMissingVerbAudit({
  lexiquePath,
  outputPath,
  jsonOutputPath,
  limit = DEFAULT_LIMIT,
  databaseConfig,
}) {
  const source = await readFile(lexiquePath, 'utf8')
  const sourceHash = createHash('sha256').update(source).digest('hex')
  const lexiqueLemmas = parseLexiqueVerbLemmas(source)
  const database = await mysql.createConnection(databaseConfig)

  try {
    const [catalogueRows] = await database.execute(`
      SELECT id, infinitif, forme_canonique, est_archive, statut_validation, rang_frequence
      FROM verbes
      ORDER BY id
    `)
    const compared = missingVerbCandidates(lexiqueLemmas, catalogueRows)
    const allCandidates = compared.filter(candidate => candidate.status === 'absent')
    const excludedCandidates = allCandidates.filter(candidate => candidate.exclusionReason)
    const candidatePool = allCandidates
      .filter(candidate => !candidate.exclusionReason)
      .slice(0, Math.max(limit * 2, 200))
    const selectedCandidates = allCandidates
      .filter(candidate => !candidate.exclusionReason)
      .slice(0, limit)
    const spellingConflicts = compared
      .filter(candidate => candidate.status === 'présent — graphie à vérifier')
      .sort((left, right) => right.frequency - left.frequency)
    const active = catalogueRows.filter(row => !Number(row.est_archive)).length
    const catalogueSummary = {
      total: catalogueRows.length,
      active,
      archived: catalogueRows.length - active,
      validated: catalogueRows.filter(row => !Number(row.est_archive) && row.statut_validation === 'valide').length,
      toReview: catalogueRows.filter(row => !Number(row.est_archive) && row.statut_validation !== 'valide').length,
      withFrequency: catalogueRows.filter(row => !Number(row.est_archive) && row.rang_frequence !== null).length,
    }
    const report = renderReport({
      sourcePath: basename(lexiquePath),
      sourceHash,
      lexiqueCount: lexiqueLemmas.length,
      catalogueSummary,
      allCandidates,
      selectedCandidates,
      excludedCandidates,
      spellingConflicts,
    })
    const jsonReport = {
      generatedAt: new Date().toISOString(),
      source: {
        file: basename(lexiquePath),
        sha256: sourceHash,
        lexiqueVerbLemmaCount: lexiqueLemmas.length,
      },
      catalogue: catalogueSummary,
      missingCount: allCandidates.length,
      candidates: selectedCandidates,
      candidatePool,
      pedagogicallyExcluded: excludedCandidates,
      spellingConflicts,
    }

    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, report, 'utf8')
    await mkdir(dirname(jsonOutputPath), { recursive: true })
    await writeFile(jsonOutputPath, `${JSON.stringify(jsonReport, null, 2)}\n`, 'utf8')
    return jsonReport
  }
  finally {
    await database.end()
  }
}

async function main() {
  const lexiquePath = resolve(option('lexique', process.env.LEXIQUE_PATH || ''))
  if (!option('lexique') && !process.env.LEXIQUE_PATH) {
    throw new Error('Source Lexique absente. Utilisez --lexique=/chemin/Lexique4.tsv ou LEXIQUE_PATH.')
  }
  const outputPath = resolve(option('output', 'reports/missing-french-verbs.md'))
  const jsonOutputPath = resolve(option('json-output', 'reports/missing-french-verbs.json'))
  const limit = Number.parseInt(option('limit', String(DEFAULT_LIMIT)), 10)
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
    throw new Error('La limite doit être un entier compris entre 1 et 1000.')
  }

  const databaseConfig = {
    host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
    port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
    database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
    user: process.env.DB_USER || process.env.NUXT_DB_USER,
    password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
  }
  if (!databaseConfig.host || !databaseConfig.database || !databaseConfig.user) {
    throw new Error('Configuration MySQL absente (DB_* ou NUXT_DB_*).')
  }

  const report = await runMissingVerbAudit({
    lexiquePath,
    outputPath,
    jsonOutputPath,
    limit,
    databaseConfig,
  })
  console.log(
    `Audit terminé : ${report.candidates.length} candidat(s) prioritaire(s), `
    + `${report.missingCount} verbe(s) absent(s), `
    + `${report.spellingConflicts.length} conflit(s) de graphie.`
  )
  console.log(`Rapports : ${outputPath} et ${jsonOutputPath}`)
}

const isDirectExecution = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectExecution) {
  await main()
}
