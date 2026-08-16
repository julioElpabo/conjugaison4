import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  ExerciseSummaryInputError,
  normalizeExerciseSummaryToken,
  parseExerciseSummaryShareRequest,
} from '../server/services/exercise-summaries.ts'

const validSummary = {
  version: 1,
  locale: 'fr',
  presentation: 'classic',
  items: [{
    index: 42,
    status: 'correct',
    questionLabel: 'nous | donner | imparfait',
    learnerAnswer: 'nous donnions',
    expectedAnswer: 'nous donnions',
    errorLabels: [],
  }],
  verbs: ['donner'],
  tenses: [{ name: 'imparfait', mode: 'indicatif' }],
}

test('normalise les données d’un bilan partagé', () => {
  assert.deepEqual(parseExerciseSummaryShareRequest(validSummary), {
    ...validSummary,
    items: [{ ...validSummary.items[0], index: 1 }],
  })
})

test('refuse un bilan vide ou une langue inconnue', () => {
  assert.throws(
    () => parseExerciseSummaryShareRequest({ ...validSummary, items: [] }),
    ExerciseSummaryInputError,
  )
  assert.throws(
    () => parseExerciseSummaryShareRequest({ ...validSummary, locale: 'xx' }),
    ExerciseSummaryInputError,
  )
})

test('valide les jetons opaques de partage', () => {
  assert.equal(normalizeExerciseSummaryToken('AbCdEfGhIjKlMnOpQrStUvWx'), 'AbCdEfGhIjKlMnOpQrStUvWx')
  assert.throws(() => normalizeExerciseSummaryToken('../bilan'), ExerciseSummaryInputError)
})

test('monte explicitement le modal et ordonne les actions du bilan', async () => {
  for (const component of ['ClassicExercise.vue', 'ChatExercise.vue']) {
    const source = await readFile(new URL(`../app/components/exercise/${component}`, import.meta.url), 'utf8')
    assert.match(source, /import ShareExerciseSummaryDialog from/u)
    assert.match(source, /import \{[^}]*faArrowUpFromBracket[^}]*\} from '@fortawesome\/free-solid-svg-icons'/u)
    assert.match(source, /import \{[^}]*faPrint[^}]*\} from '@fortawesome\/free-solid-svg-icons'/u)
    assert.match(source, /<FontAwesomeIcon :icon="faArrowUpFromBracket" \/>/u)
    assert.match(source, /<FontAwesomeIcon :icon="faPrint" \/>/u)
    assert.doesNotMatch(source, /<span aria-hidden="true">(?:↗|⎙)<\/span>/u)
    const share = source.indexOf("ui('Partager mon bilan')")
    const print = source.indexOf("ui('Imprimer mon bilan')")
    const close = Math.max(source.indexOf("ui('Fermer')", print), source.indexOf("ui('Quitter le chat')", print))
    assert.ok(share >= 0 && share < print)
    assert.ok(print < close)
  }
})

test('limite les liens à un mois et protège le nettoyage administratif', async () => {
  const service = await readFile(new URL('../server/services/exercise-summaries.ts', import.meta.url), 'utf8')
  const modal = await readFile(new URL('../app/components/exercise/ShareExerciseSummaryDialog.vue', import.meta.url), 'utf8')
  const adminGet = await readFile(new URL('../server/api/admin/exercise-summaries/index.get.ts', import.meta.url), 'utf8')
  const adminDelete = await readFile(new URL('../server/api/admin/exercise-summaries/index.delete.ts', import.meta.url), 'utf8')

  assert.match(modal, /Le lien restera disponible pendant un mois\./u)
  assert.match(service, /created_at >= DATE_SUB\(CURRENT_TIMESTAMP, INTERVAL 1 MONTH\)/u)
  assert.match(service, /DELETE FROM shared_exercise_summaries[\s\S]*created_at < DATE_SUB\(CURRENT_TIMESTAMP, INTERVAL 1 MONTH\)/u)
  assert.match(adminGet, /requireAdministrator\(event\)/u)
  assert.match(adminDelete, /requireAdministrator\(event\)/u)
})
