import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [classic, chat] = await Promise.all([
  readFile(new URL('../app/components/exercise/ClassicExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
])

test('le classique affiche une bulle sans enregistrer une faute de pronom', () => {
  const missing = classic.indexOf('if (missingSubjectPronoun && !falcMode.value)')
  const earlyReturn = classic.indexOf('return', missing)
  const tracking = classic.indexOf("track('answer_submitted'", missing)

  assert.ok(missing >= 0 && missing < earlyReturn && earlyReturn < tracking)
  assert.match(classic.slice(missing, tracking), /missingSubjectPronoun && !falcMode\.value/u)
  assert.match(classic, /missingPronounMessageVisible[\s\S]*ui\('Il manque le pronom'\)/u)
})

test('le chat répond avec un émoticône sans enregistrer une faute de pronom', () => {
  const missing = chat.indexOf("if (result.reason === 'missing-subject-pronoun')")
  const earlyReturn = chat.indexOf('return', missing)
  const tracking = chat.indexOf("track('answer_submitted'", missing)

  assert.ok(missing >= 0 && missing < earlyReturn && earlyReturn < tracking)
  assert.match(chat.slice(missing, tracking), /Il manque le pronom[\s\S]*🙂/u)
  assert.match(chat.slice(missing, tracking), /restartHelpReminderTimer\(\)[\s\S]*focusAnswerInput\(\)/u)
})

test('le chat ne demande pas d’écrire le pronom à l’impératif', () => {
  assert.match(chat, /normalizedInfinitive\(currentQuestion\.value\?\.mode\) === 'imperatif'/u)
  assert.match(chat, /À l'impératif, la personne est indiquée, mais n'écris pas le pronom\./u)
})
