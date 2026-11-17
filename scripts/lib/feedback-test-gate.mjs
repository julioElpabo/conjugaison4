import { spawn } from 'node:child_process'
import { join } from 'node:path'

// Les anciens scénarios restent dans cette liste lorsque de nouveaux sont ajoutés.
// Suites sans connexion MySQL : ce contrôle ne doit jamais écrire dans la base du site.
export const FEEDBACK_REGRESSION_FILES = [
  'tests/answer.test.mjs',
  'tests/answer-difference.test.mjs',
  'tests/pronoun-missing-flow.test.mjs',
  'tests/compound-auxiliary.test.mjs',
  'tests/pronominal-generation.test.mjs',
  'tests/conjugation-help.test.mjs',
  'tests/coach-help.test.mjs',
  'tests/coach-help-approaches.test.mjs',
  'tests/coach-condensed-help.test.mjs',
  'tests/coach-condensed-help-audit.mjs',
  'tests/coach-complete-help-audit.mjs',
  'tests/coach-help-audit.test.mjs',
  'tests/coach-help-feedback-submit.test.mjs',
  'tests/coach-help-reminder.test.mjs',
  'tests/coach-conversation.test.mjs',
  'tests/coach-dialogue.test.mjs',
  'tests/coach-question.test.mjs',
  'tests/coach-feedback-regressions.test.mjs',
  'tests/coach-error-feedback-scenarios.test.mjs',
  'tests/coach-construction-feedback.test.mjs',
  'tests/user-feedback-improvements.test.mjs',
  'tests/admin-feedbacks-workflow.test.mjs',
  'tests/learner-error-diagnostics.test.mjs',
  'tests/learner-identification-history.test.mjs',
  'tests/i18n.test.mjs',
  'tests/coach-stem-feedback.test.mjs',
  'tests/learner-feedback-safety.test.mjs',
  'tests/learner-feedback-audit.test.mjs',
  'tests/moser-feedback-regressions.test.mjs',
  'tests/feedback-release-gate.test.mjs',
]

/** Un code de sortie 0 ne suffit pas si Node a ignoré des tests ou n'a rien exécuté. */
export function assertCompleteTapRun(output, label) {
  const totals = Object.fromEntries([...output.matchAll(/^# (tests|pass|fail|cancelled|skipped|todo) (\d+)\r?$/gm)]
    .map(([, key, count]) => [key, Number(count)]))
  if (!['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'].every(key => Number.isInteger(totals[key]))) {
    throw new Error(`${label} : bilan des tests absent ou incomplet.`)
  }
  if (totals.tests < 1 || totals.tests !== totals.pass || totals.fail || totals.cancelled || totals.skipped || totals.todo) {
    throw new Error(`${label} : contrôle refusé (${totals.pass}/${totals.tests} réussis, ${totals.fail} échec(s), ${totals.skipped} ignoré(s), ${totals.todo} à faire, ${totals.cancelled} annulé(s)).`)
  }
  return totals
}

async function runSuite(root, files, label, onOutput) {
  const env = { ...process.env, FEEDBACK_BROWSER_TESTS: '1', TSX_TSCONFIG_PATH: join(root, 'tests/tsconfig.json'), NO_COLOR: '1' }
  delete env.FORCE_COLOR
  delete env.NODE_TEST_CONTEXT
  const child = spawn(process.execPath, ['--import', 'tsx', '--test', '--test-reporter=tap', ...files], {
    cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8')
    stream.on('data', chunk => { output += chunk; onOutput(chunk) })
  }
  const code = await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('close', (exitCode, signal) => resolve(signal ? 1 : exitCode ?? 1))
  })
  if (code !== 0) throw new Error(`${label} : les tests ont échoué (code ${code}).`)
  return assertCompleteTapRun(output, label)
}

export async function runFeedbackChecks(root, onOutput = chunk => process.stdout.write(chunk)) {
  onOutput('\n[1/2] Non-régression des réponses, aides et commentaires\n')
  const regressions = await runSuite(root, FEEDBACK_REGRESSION_FILES, 'Non-régression', onOutput)
  onOutput('\n[2/2] Rendus Chrome obligatoires : langues, profils, clavier, mobile et thème sombre\n')
  const browser = await runSuite(root, ['tests/learner-feedback-browser.test.mjs'], 'Navigateur', onOutput)
  onOutput(`\nContrôle des feedbacks validé : ${regressions.pass} tests de non-régression et ${browser.pass} test navigateur, aucun test ignoré.\n`)
  return { regressions, browser }
}
