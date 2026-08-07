import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [classic, chat] = await Promise.all([
  readFile(new URL('../app/components/exercise/ClassicExercise.vue', import.meta.url), 'utf8'),
  readFile(new URL('../app/components/exercise/ChatExercise.vue', import.meta.url), 'utf8'),
])

test('le classique affiche une bulle sans enregistrer une faute de pronom', () => {
  const missing = classic.indexOf('if (missingSubjectPronoun)')
  const earlyReturn = classic.indexOf('return', missing)
  const tracking = classic.indexOf("track('answer_submitted'", missing)

  assert.ok(missing >= 0 && missing < earlyReturn && earlyReturn < tracking)
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
