import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { areOnlyIndicativeTenses, withoutIndicativeMode } from '../shared/utils/chat-mode-display.ts'

describe('affichage simplifié du mode dans le chat', () => {
  const tense = (name, mode) => ({ id: 1, name, mode: { id: 1, name: mode, order: 1 }, isCompound: false, selected: true })

  it('ne simplifie que les sélections entièrement à l’indicatif', () => {
    assert.equal(areOnlyIndicativeTenses([tense('présent', 'indicatif'), tense('futur', 'indicatif')]), true)
    assert.equal(areOnlyIndicativeTenses([tense('présent', 'indicatif'), tense('présent', 'subjonctif')]), false)
    assert.equal(areOnlyIndicativeTenses([]), false)
  })

  it('retire proprement l’indicatif des formulations de discussion', () => {
    assert.equal(withoutIndicativeMode('je | aller | indicatif futur'), 'je | aller | futur')
    assert.equal(withoutIndicativeMode('Conjugue aller au futur de l’indicatif.'), 'Conjugue aller au futur.')
    assert.equal(withoutIndicativeMode('Le mode indicatif et le temps futur.'), 'Le temps futur.')
    assert.equal(withoutIndicativeMode('futur (indicatif)'), 'futur')
  })
})
