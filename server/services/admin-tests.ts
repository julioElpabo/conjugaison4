import { execFile } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { conjugationScenarioResults } from './postman-conjugation-results'

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
    description: 'Formes multiples, apostrophes, élisions, accords, impératif, participe et gérondif.',
    category: 'Conjugaison française',
  },
  'conjugation-database.test.mjs': {
    title: 'Références et intégrité des 486 verbes',
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
  'accords du participe passé': { title: 'Accord du participe passé', description: 'Accords avec être, absence d’accord avec avoir et formes inclusives.' },
  'impératif et ponctuation': { title: 'Impératif, tirets et ponctuation', description: 'Absence de pronom sujet, formes pronominales et s euphonique devant y ou en.' },
  'participe, infinitif et gérondif': { title: 'Formes non personnelles', description: 'Participe présent/passé et gérondif présent/passé.' },
  'couverture de tous les temps personnels': { title: 'Tous les modes et temps personnels', description: 'Une forme de référence pour chacun des 17 temps personnels du catalogue.' },
  'variantes reconnues par les ouvrages de référence': { title: 'Variantes de référence', description: 'Asseoir, payer, essayer et pouvoir.' },
  'familles à modification orthographique': { title: 'Modifications orthographiques', description: 'Verbes en -ger, -cer, changements de radical, tréma et futur irrégulier.' },
  'verbes irréguliers fondamentaux': { title: 'Verbes irréguliers', description: 'Être, avoir, aller, faire, dire, venir, tenir et prendre.' },
  'verbes défectifs et impersonnels': { title: 'Verbes défectifs', description: 'Falloir et pleuvoir sans génération de personnes inexistantes.' },
  'intégrité des 486 verbes du catalogue': { title: 'Audit complet du catalogue', description: 'Doublons, métadonnées, variantes, relations, formes manquantes et auxiliaires.' },
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
  const match = output.match(new RegExp(`^# ${label} (\\d+)$`, 'mu'))
  return Number(match?.[1] || 0)
}

function structuredTestGroups(output: string) {
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
    kind: sourceTitle.startsWith('collection Postman') ? 'conjugation' : 'general',
    passed: cases.every(testCase => testCase.passed || testCase.skipped),
    cases,
  }))
}

function repairPrompt(
  files: string[],
  groups: ReturnType<typeof structuredTestGroups>,
  scenarios: Awaited<ReturnType<typeof conjugationScenarioResults>>,
  output: string,
) {
  const failedGroups = groups
    .map(group => ({ ...group, cases: group.cases.filter(testCase => !testCase.passed && !testCase.skipped) }))
    .filter(group => group.cases.length > 0)
  const failedScenarios = scenarios.filter(scenario => !scenario.passed)
  if (failedGroups.length === 0 && failedScenarios.length === 0) return ''

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
  const execution = await new Promise<{ exitCode: number, stdout: string, stderr: string, timedOut: boolean }>((resolveExecution) => {
    execFile(
      process.execPath,
      ['--env-file-if-exists=.env', '--experimental-strip-types', '--test', '--test-concurrency=1', '--test-reporter=tap', ...files.map(file => join(TEST_DIRECTORY, file))],
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
  const output = `${execution.stdout}${execution.stderr ? `\n${execution.stderr}` : ''}`.slice(-MAX_OUTPUT_LENGTH)
  const conjugationScenarios = files.includes('postman-conjugation.test.mjs')
    ? await conjugationScenarioResults()
    : []
  const groups = structuredTestGroups(output)
  return {
    success: execution.exitCode === 0,
    exitCode: execution.exitCode,
    timedOut: execution.timedOut,
    durationMs: Date.now() - startedAt,
    files,
    summary: {
      tests: summaryValue(output, 'tests'),
      suites: summaryValue(output, 'suites'),
      passed: summaryValue(output, 'pass'),
      failed: summaryValue(output, 'fail'),
      skipped: summaryValue(output, 'skipped'),
    },
    groups,
    conjugationScenarios,
    repairPrompt: repairPrompt(files, groups, conjugationScenarios, output),
    output,
  }
}
