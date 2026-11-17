import { fileURLToPath } from 'node:url'
import { runFeedbackChecks } from './lib/feedback-test-gate.mjs'

if (process.argv.length > 2) {
  console.error('Usage : npm run test:feedback — toutes les suites et Chrome sont obligatoires, sans option de contournement.')
  process.exitCode = 1
}
else {
  try {
    await runFeedbackChecks(fileURLToPath(new URL('..', import.meta.url)))
  }
  catch (error) {
    console.error(`\nPublication bloquée : ${error.message}`)
    process.exitCode = 1
  }
}
