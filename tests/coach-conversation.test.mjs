import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  answerTurnPlan,
  CHAT_INCORRECT_DELAY_MS,
  chatMessageHasVisibleContent,
  chatReactionAllowsMedia,
} from '../shared/utils/coach-conversation.ts'

describe('enchaînement du chat après une réponse', () => {
  it('annonce l’erreur, encourage, puis passe à la question suivante', () => {
    assert.deepEqual(answerTurnPlan({ correct: false, hasNext: true }), [
      { kind: 'reaction', eventType: 'incorrect' },
      { kind: 'reaction', eventType: 'encouragement' },
      { kind: 'delay', milliseconds: CHAT_INCORRECT_DELAY_MS },
      { kind: 'next-question' },
    ])
  })

  it('conserve la correction spécialisée avant l’encouragement', () => {
    assert.deepEqual(answerTurnPlan({ correct: false, hasNext: false, incorrectEvent: 'cod-before' }), [
      { kind: 'reaction', eventType: 'cod-before' },
      { kind: 'reaction', eventType: 'encouragement' },
      { kind: 'delay', milliseconds: CHAT_INCORRECT_DELAY_MS },
      { kind: 'finish' },
    ])
  })

  it('interdit tout média d’erreur lorsque le caractère n’en a sélectionné aucun', () => {
    assert.equal(chatReactionAllowsMedia('incorrect', true, false), false)
    assert.equal(chatReactionAllowsMedia('cod-before', true, false), false)
    assert.equal(chatReactionAllowsMedia('encouragement', true, true), false)
    assert.equal(chatReactionAllowsMedia('incorrect', true, true), true)
    assert.equal(chatReactionAllowsMedia('correct', true, false), true)
  })

  it('ne rend jamais une bulle sans contenu visible', () => {
    assert.equal(chatMessageHasVisibleContent({ text: '' }), false)
    assert.equal(chatMessageHasVisibleContent({ text: '   ' }), false)
    assert.equal(chatMessageHasVisibleContent({ text: '', errorDetails: [] }), false)
    assert.equal(chatMessageHasVisibleContent({ text: '', answerComparison: { mode: 'focused' } }), true)
    assert.equal(chatMessageHasVisibleContent({ text: '', errorDetails: [{ code: 'orthography.copied_complement' }] }), true)
    assert.equal(chatMessageHasVisibleContent({ text: '', media: { id: 1 } }), true)
    assert.equal(chatMessageHasVisibleContent({ text: '', literaryCitation: { target: 'commencera' } }), true)
    assert.equal(chatMessageHasVisibleContent({ text: '', identificationForm: { target: 'commencera' } }), true)
  })
})
