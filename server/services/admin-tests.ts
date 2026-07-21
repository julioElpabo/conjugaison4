import { execFile } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { conjugationScenarioResults } from './postman-conjugation-results'
import { listCoaches } from './coaches'
import { auditCoachCredibility } from '../../shared/utils/coach-credibility'

const TEST_DIRECTORY = resolve(process.cwd(), 'tests')
const MAX_OUTPUT_LENGTH = 200_000

const TEST_CATALOG: Record<string, { title: string, description: string, category: string }> = {
  'postman-conjugation.test.mjs': {
    title: 'Formes verbales par mode',
    description: '30 situations de conjugaison : indicatif, subjonctif, conditionnel, impératif, accords et apostrophes.',
    category: 'Conjugaison française',
  },
  'answer.test.mjs': {
    title: 'Correcteur, apostrophes et saisie',
    description: 'Vérifie les apostrophes droites ou typographiques, les accents, les espaces et les réponses alternatives.',
    category: 'Conjugaison française',
  },
  'conjugation-display.test.mjs': {
    title: 'Ordre des modes et des temps',
    description: 'Contrôle l’ordre de présentation des modes et des temps dans l’éditeur de verbes.',
    category: 'Conjugaison française',
  },
  'conjugation-rules.test.mjs': {
    title: 'Règles du français et correcteur',
    description: 'Formes multiples, compléments d’objet, apostrophes, accords, impératif, participe et gérondif.',
    category: 'Conjugaison française',
  },
  'verb-complements.test.mjs': {
    title: 'Catalogue des COD et COI',
    description: 'Contrôle la transitivité, les constructions et les compléments naturels COD ou COI proposés dans les phrases.',
    category: 'Conjugaison française',
  },
  'complement-placement.test.mjs': {
    title: 'Position et morphologie des compléments',
    description: 'Contrôle l’antéposition, les déterminants, les élisions, le genre et le nombre des COD.',
    category: 'Conjugaison française',
  },
  'cod-agreement.test.mjs': {
    title: 'COD avant/après et accords',
    description: 'Teste les COD avant et après le verbe au masculin, féminin, singulier et pluriel, ainsi que les temps simples, composés et l’impératif.',
    category: 'Conjugaison française',
  },
  'conjugation-database.test.mjs': {
    title: 'Références et intégrité des 488 verbes',
    description: 'Compare les formes sensibles à des références explicites et audite toutes les données du catalogue.',
    category: 'Conjugaison française',
  },
  'verb-search.test.mjs': {
    title: 'Recherche et autocomplétion des verbes',
    description: 'Vérifie les accents, le classement des suggestions et la recherche vide dans le catalogue administrateur.',
    category: 'Administration',
  },
  'challenge-presets.test.mjs': {
    title: 'Catalogue des défis',
    description: 'Contrôle les sélections de verbes, de temps et le nombre de questions des défis prédéfinis.',
    category: 'Exercices et défis',
  },
  'challenge-validation.test.mjs': {
    title: 'Validation des défis partagés',
    description: 'Vérifie les liens de défi, leurs options et la compatibilité avec l’ancien format.',
    category: 'Exercices et défis',
  },
  'admin-users.test.mjs': {
    title: 'Validation des utilisateurs',
    description: 'Contrôle les adresses électroniques, mots de passe, rôles et données de compte.',
    category: 'Administration',
  },
  'coach-conversation-scenarios.test.mjs': {
    title: 'Conversations et crédibilité des coaches',
    description: 'Simule les échanges, les délais, les corrections, les GIFs et 60 interventions par coach pour détecter les répétitions mécaniques.',
    category: 'Exercices et défis',
  },
}

const RESULT_GROUP_CATALOG: Record<string, { title: string, description: string }> = {
  'autocomplétion des verbes administrés': { title: 'Autocomplétion des verbes', description: 'Normalisation des accents et classement des meilleures suggestions.' },
  'validation des utilisateurs administrés': { title: 'Utilisateurs — validation des données', description: 'Formats, rôles et règles appliqués lors de la création ou modification d’un compte.' },
  normalizeAnswer: { title: 'Apostrophes, accents, casse et espaces', description: 'Façons différentes d’écrire une même réponse sans transformer une faute en bonne réponse.' },
  getAlternativeCorrections: { title: 'Solutions multiples', description: 'Autres formes correctes proposées après une réponse juste, par exemple « assieds » et « assois ».' },
  isAnswerCorrect: { title: 'Décision du correcteur', description: 'Réponses que le correcteur doit accepter ou refuser.' },
  validateAnswer: { title: 'Diagnostic du correcteur', description: 'Motif précis retourné pour une bonne réponse, une réponse vide ou une erreur.' },
  challengePresets: { title: 'Catalogue des défis', description: 'Contenu et cohérence des défis proposés aux utilisateurs.' },
  'conversion du format historique': { title: 'Anciens défis', description: 'Compatibilité avec les défis créés dans l’ancienne version du site.' },
  inspectPresetCompatibility: { title: 'Compatibilité avec la base', description: 'Détection des verbes ou temps absents de la base de données.' },
  'validation des défis partagés': { title: 'Défis partagés', description: 'Lecture, options et sécurité des liens de défi.' },
  'validation des questionnaires': { title: 'Questionnaires', description: 'Normalisation des paramètres historiques des questionnaires.' },
  'ordre d’affichage des conjugaisons': { title: 'Ordre des modes et des temps', description: 'Présentation des conjugaisons dans l’ordre attendu par l’interface.' },
  'collection Postman — formatage des conjugaisons': { title: 'Formes verbales par mode', description: 'Scénarios détaillés dans l’interface de conjugaison ci-dessous.' },
  'formes multiples reconnues par le correcteur': { title: 'Formes multiples', description: 'Acceptation et annonce des autres solutions correctes.' },
  'apostrophes et élisions françaises': { title: 'Apostrophes et élisions', description: 'Voyelles, h muet, h aspiré et tournures du subjonctif.' },
  'compléments d’objet dans les questions': { title: 'Phrases avec un COD', description: 'Présentation de la phrase et acceptation de la forme seule ou de la phrase complète.' },
  'compléments d’objet validés': { title: 'Données des compléments', description: 'Quantité, transitivité, absence de doublons et cohérence des associations lexicales.' },
  'préparation grammaticale des COD antéposés': { title: 'COD placés avant le verbe', description: 'Déterminants, élisions, genre et nombre nécessaires à l’accord.' },
  'accords du participe passé': { title: 'Accord du participe passé', description: 'Accords avec être, absence d’accord avec avoir et formes inclusives.' },
  'impératif et ponctuation': { title: 'Impératif, tirets et ponctuation', description: 'Absence de pronom sujet, formes pronominales et s euphonique devant y ou en.' },
  'participe, infinitif et gérondif': { title: 'Formes non personnelles', description: 'Participe présent/passé et gérondif présent/passé.' },
  'couverture de tous les temps personnels': { title: 'Tous les modes et temps personnels', description: 'Une forme de référence pour chacun des 17 temps personnels du catalogue.' },
  'variantes reconnues par les ouvrages de référence': { title: 'Variantes de référence', description: 'Asseoir, payer, essayer et pouvoir.' },
  'familles à modification orthographique': { title: 'Modifications orthographiques', description: 'Verbes en -ger, -cer, changements de radical, tréma et futur irrégulier.' },
  'verbes irréguliers fondamentaux': { title: 'Verbes irréguliers', description: 'Être, avoir, aller, faire, dire, venir, tenir et prendre.' },
  'verbes défectifs et impersonnels': { title: 'Verbes défectifs', description: 'Falloir et pleuvoir sans génération de personnes inexistantes.' },
  'intégrité des 488 verbes du catalogue': { title: 'Audit complet du catalogue', description: 'Doublons, métadonnées, variantes, relations, formes manquantes et auxiliaires.' },
  'scénarios chronologiques du chat': { title: 'Déroulement des conversations', description: 'Ordre des bulles, consigne finale, correction, délai de trois secondes, grammaire et fin du questionnaire.' },
  'crédibilité des douze coaches': { title: 'Crédibilité des coaches', description: 'Diversité des formulations, absence de répétitions immédiates et variété des réactions visuelles.' },
}

async function coachCredibilityResults() {
  const coaches = await listCoaches(useDatabase(), true)
  return coaches.map((coach, index) => auditCoachCredibility(coach, 10_000 + index))
}

export async function availableAdminTests() {
  const categoryOrder = ['Conjugaison française', 'Exercices et défis', 'Administration', 'Technique']
  const entries = await readdir(TEST_DIRECTORY, { withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && /^[a-z0-9-]+\.test\.mjs$/u.test(entry.name))
    .map(entry => ({
      id: entry.name,
      title: TEST_CATALOG[entry.name]?.title || entry.name.replace(/\.test\.mjs$/u, '').replace(/-/gu, ' '),
      description: TEST_CATALOG[entry.name]?.description || 'Tests techniques automatisés.',
      category: TEST_CATALOG[entry.name]?.category || 'Technique',
    }))
    .sort((left, right) => categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category) || left.title.localeCompare(right.title, 'fr'))
}

function summaryValue(output: string, label: string) {
  return [...output.matchAll(new RegExp(`^# ${label} (\\d+)$`, 'gmu'))]
    .reduce((total, match) => total + Number(match[1] || 0), 0)
}

function structuredTestGroups(output: string, category: string) {
  const pendingTitles = new Map<number, string>()
  const groups = new Map<string, Array<{ title: string, passed: boolean, skipped: boolean }>>()

  for (const line of output.split('\n')) {
    const subtest = line.match(/^(\s*)# Subtest: (.+)$/u)
    if (subtest) {
      pendingTitles.set(Math.floor(subtest[1]!.length / 4), subtest[2]!)
      continue
    }

    const status = line.match(/^(\s*)(not )?ok \d+ - (.+?)(?: # (SKIP|TODO).*)?$/u)
    if (!status) continue
    const depth = Math.floor(status[1]!.length / 4)
    if (depth === 0) continue
    const groupTitle = pendingTitles.get(depth - 1) || 'Autres contrôles'
    const cases = groups.get(groupTitle) || []
    cases.push({
      title: status[3]!,
      passed: !status[2],
      skipped: Boolean(status[4]),
    })
    groups.set(groupTitle, cases)
  }

  return [...groups].map(([sourceTitle, cases]) => ({
    title: RESULT_GROUP_CATALOG[sourceTitle]?.title || sourceTitle,
    description: RESULT_GROUP_CATALOG[sourceTitle]?.description || 'Contrôles automatisés de cette partie du site.',
    category,
    kind: sourceTitle.startsWith('collection Postman') ? 'conjugation' : 'general',
    passed: cases.every(testCase => testCase.passed || testCase.skipped),
    cases,
  }))
}

function repairPrompt(
  files: string[],
  groups: ReturnType<typeof structuredTestGroups>,
  scenarios: Awaited<ReturnType<typeof conjugationScenarioResults>>,
  coachReports: Awaited<ReturnType<typeof coachCredibilityResults>>,
  output: string,
) {
  const failedGroups = groups
    .map(group => ({ ...group, cases: group.cases.filter(testCase => !testCase.passed && !testCase.skipped) }))
    .filter(group => group.cases.length > 0)
  const failedScenarios = scenarios.filter(scenario => !scenario.passed)
  const failedCoaches = coachReports.filter(report => !report.passed)
  if (failedGroups.length === 0 && failedScenarios.length === 0 && failedCoaches.length === 0) return ''

  const lines = [
    'Analyse et répare les tests de conjugaison en échec dans ce projet.',
    '',
    'Contraintes :',
    '- corriger le code ou les données responsables, sans affaiblir ni supprimer les tests ;',
    '- préserver les formes alternatives valides ;',
    '- vérifier les règles de conjugaison française et les accords ;',
    '- relancer les fichiers concernés puis toute la suite de tests ;',
    '',
    `Fichiers exécutés : ${files.join(', ')}`,
    '',
    'Tests en échec :',
  ]
  for (const group of failedGroups) {
    lines.push(`- ${group.title}`)
    for (const testCase of group.cases) lines.push(`  - ${testCase.title}`)
  }
  for (const scenario of failedScenarios) {
    lines.push(`- ${scenario.title}`)
    lines.push(`  Objectif : ${scenario.purpose}`)
    for (const assertion of scenario.assertions.filter(assertion => !assertion.passed)) {
      lines.push(`  - ${assertion.property} : attendu ${JSON.stringify(assertion.expected)}, obtenu ${JSON.stringify(assertion.actual)}`)
    }
  }
  for (const report of failedCoaches) {
    lines.push(`- Crédibilité de ${report.coachName} — score ${report.score} %`)
    for (const check of report.checks.filter(check => !check.passed)) {
      lines.push(`  - ${check.label} : attendu ${check.expected}, obtenu ${check.actual}`)
    }
  }
  lines.push('', 'Journal technique utile :', '```text', output.slice(-14_000), '```')
  return lines.join('\n')
}

export async function runAdminTests(requestedFiles: string[]) {
  const available = await availableAdminTests()
  const allowed = new Set(available.map(test => test.id))
  const files = requestedFiles.length > 0 ? [...new Set(requestedFiles)] : [...allowed]
  if (files.length === 0 || files.some(file => !allowed.has(file))) {
    throw createError({ statusCode: 400, statusMessage: 'Sélection de tests invalide' })
  }

  const startedAt = Date.now()
  const testsById = new Map(available.map(test => [test.id, test]))
  const filesByCategory = new Map<string, string[]>()
  for (const file of files) {
    const category = testsById.get(file)?.category || 'Technique'
    filesByCategory.set(category, [...(filesByCategory.get(category) || []), file])
  }

  const executions: Array<{ category: string, files: string[], exitCode: number, output: string, timedOut: boolean }> = []
  for (const [category, categoryFiles] of filesByCategory) {
    const execution = await new Promise<{ exitCode: number, stdout: string, stderr: string, timedOut: boolean }>((resolveExecution) => {
      execFile(
        process.execPath,
        ['--env-file-if-exists=.env', '--import', 'tsx', '--test', '--test-concurrency=1', '--test-reporter=tap', ...categoryFiles.map(file => join(TEST_DIRECTORY, file))],
        { cwd: process.cwd(), timeout: 60_000, maxBuffer: 2_000_000 },
        (error, stdout, stderr) => {
          const exitCode = error && typeof error.code === 'number' ? error.code : (error ? 1 : 0)
          resolveExecution({
            exitCode,
            stdout: String(stdout || ''),
            stderr: String(stderr || ''),
            timedOut: Boolean(error && 'killed' in error && error.killed),
          })
        }
      )
    })
    executions.push({
      category,
      files: categoryFiles,
      exitCode: execution.exitCode,
      output: `${execution.stdout}${execution.stderr ? `\n${execution.stderr}` : ''}`,
      timedOut: execution.timedOut,
    })
  }

  const output = executions
    .map(execution => `# Suite : ${execution.category}\n${execution.output}`)
    .join('\n\n')
    .slice(-MAX_OUTPUT_LENGTH)
  const totalFor = (label: string) => executions.reduce((total, execution) => total + summaryValue(execution.output, label), 0)
  const conjugationScenarios = files.includes('postman-conjugation.test.mjs')
    ? await conjugationScenarioResults()
    : []
  const coachCredibility = files.includes('coach-conversation-scenarios.test.mjs')
    ? await coachCredibilityResults()
    : []
  const groups = executions.flatMap(execution => structuredTestGroups(execution.output, execution.category))
  const suiteResults = executions.map(execution => ({
    title: execution.category,
    passed: execution.exitCode === 0,
    files: execution.files.length,
    tests: summaryValue(execution.output, 'tests'),
    failed: summaryValue(execution.output, 'fail'),
  }))
  return {
    success: executions.every(execution => execution.exitCode === 0),
    exitCode: executions.find(execution => execution.exitCode !== 0)?.exitCode || 0,
    timedOut: executions.some(execution => execution.timedOut),
    durationMs: Date.now() - startedAt,
    files,
    summary: {
      tests: totalFor('tests'),
      suites: totalFor('suites'),
      passed: totalFor('pass'),
      failed: totalFor('fail'),
      skipped: totalFor('skipped'),
    },
    suiteResults,
    groups,
    conjugationScenarios,
    coachCredibility,
    repairPrompt: repairPrompt(files, groups, conjugationScenarios, coachCredibility, output),
    output,
  }
}
