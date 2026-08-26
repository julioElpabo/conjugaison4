import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  answerTurnPlan,
  CHAT_INCORRECT_DELAY_MS,
  chatMessageHasVisibleContent,
  chatReactionAllowsMedia,
  coachReactionText,
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
    assert.equal(chatMessageHasVisibleContent({ text: '', spokenAnswer: 'Vous faites' }), true)
  })

  it('annonce toujours explicitement une erreur si aucune réaction compatible n’existe', () => {
    assert.equal(coachReactionText('', '', 'C’est faux.'), 'C’est faux.')
    assert.equal(coachReactionText('Essaie encore.', '', 'C’est faux.'), 'Essaie encore.')
    assert.equal(coachReactionText('', 'Relis la consigne.', 'C’est faux.'), 'C’est faux. Relis la consigne.')
  })

  it('ajoute la correction sauf si la réaction du coach la contient déjà', () => {
    const correction = 'La bonne réponse est « ils ont réagi ».'
    assert.equal(
      coachReactionText('C’est faux.', correction, '', 'ils ont réagi'),
      `C’est faux. ${correction}`,
    )
    assert.equal(
      coachReactionText('C’est faux. La bonne réponse est <b>« ils ont réagi »</b>.', correction, '', 'ils ont réagi'),
      'C’est faux. La bonne réponse est <b>« ils ont réagi »</b>.',
    )
  })
})
