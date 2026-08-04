import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [api, historyDialog, learnerSpace, classic, chat] = await Promise.all([
  readFile(new URL('../server/api/learner/challenge-summary.get.ts', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/learner/HistorySessionSummaryDialog.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/learner/LearnerSpace.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ClassicExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
])

test('le bilan MyPage transmet et affiche la citation des erreurs d’identification', () => {
  assert.match(api, /isIdentificationExercise[\s\S]*identificationFormParts\(question\)/u)
  assert.match(api, /literaryCitation: !mastered \? question\.literaryCitation : undefined/u)
  assert.match(api, /mastered \|\| isIdentificationExercise \? \[\] : learnerErrorDetails/u)
  assert.match(api, /isIdentification: isIdentificationExercise/u)
  assert.match(historyDialog, /v-if="item\.identificationForm"/u)
  assert.match(historyDialog, /<mark>\{\{ item\.identificationForm\.target \}\}<\/mark>/u)
  assert.match(historyDialog, /item\.literaryCitation\.author/u)
  assert.match(historyDialog, /item\.literaryCitation\.work/u)
  assert.match(historyDialog, /v-if="item\.isIdentification">\{\{ item\.learnerAnswer/u)
  assert.match(historyDialog, /v-if="item\.isIdentification">\{\{ item\.expectedAnswer/u)
})

test('le bilan d’un défi littéraire porte le titre Phrases littéraires', () => {
  assert.match(learnerSpace, /function challengeDisplayLabel[\s\S]*identificationSource === 'literary-corpus'[\s\S]*ui\('Phrases littéraires'\)/u)
  assert.match(learnerSpace, /<h3>\{\{ challengeDisplayLabel\(challenge\) \}\}<\/h3>/u)
  assert.match(learnerSpace, /:title="historySummaryTitle"/u)
})

test('les bilans immédiats classique et chat affichent aussi la citation des erreurs', () => {
  assert.match(classic, /attempt\.status === 'incorrect'[\s\S]*identificationFormParts\(attempt\.question\)/u)
  assert.match(classic, /<mark>\{\{ incorrectSummaryForms\[index\]\?\.target \}\}<\/mark>/u)
  assert.match(chat, /attempt\.status === 'incorrect'[\s\S]*identificationFormParts\(attempt\.question\)/u)
  assert.match(chat, /<mark>\{\{ item\.identificationForm\.target \}\}<\/mark>/u)
})
