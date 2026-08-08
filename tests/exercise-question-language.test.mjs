import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { coachQuestionBubbles } from '../shared/utils/coach-question.ts'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('langue des questions de conjugaison', () => {
  it('construit toujours la formule avec les libellés grammaticaux français de la question', () => {
    const result = coachQuestionBubbles({
      consigne: 'il | ouvrir | imparfait (indicatif)',
      pronom: 'il',
      infinitif: 'ouvrir',
      mode: 'indicatif',
      temps: 'imparfait',
    })

    assert.equal(result.formula, 'il | ouvrir | indicatif imparfait')
  })

  it('ne traduit pas la formule dans les parcours classique et chat', async () => {
    const [classic, chat, formatter] = await Promise.all([
      read('../app/components/exercise/ClassicExercise.vue'),
      read('../app/components/exercise/ChatExercise.vue'),
      read('../shared/utils/coach-question.ts'),
    ])

    assert.match(classic, /\{\{ currentQuestion\.instruction \}\}/u)
    assert.match(classic, /<strong>\{\{ currentQuestion\.mode \}\}<\/strong>/u)
    assert.match(classic, /<strong>\{\{ currentQuestion\.temps \}\}<\/strong>/u)
    assert.doesNotMatch(chat, /addCoachText\(uiLabel\(question\.instruction\)\)/u)
    assert.doesNotMatch(chat, /modeLabel:\s*uiLabel/u)
    assert.doesNotMatch(chat, /tenseLabel:\s*uiLabel/u)
    assert.doesNotMatch(formatter, /modeLabel|tenseLabel/u)
  })
})
