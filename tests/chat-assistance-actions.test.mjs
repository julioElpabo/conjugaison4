import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const component = readFileSync(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8')

test('le chat réserve la réponse assistée au mode CIF/FLE', () => {
  assert.match(component, /const usesCifFleSupport = computed/u)
  assert.match(component, /v-if="usesCifFleSupport"[^>]*class="chat-composer__help-actions"/u)
  assert.match(component, /@click="revealCurrentAnswer"[^>]*>\{\{ ui\('Voir la réponse'\) \}\}/u)
  assert.match(component, /answerHeardBeforeSubmission\.value = true/u)
  assert.doesNotMatch(component, /requestCurrentHint|skipCurrentQuestion/u)
  assert.doesNotMatch(component, /ui\('Un indice'\)|ui\('Autre question'\)/u)
})
