import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildAnswerComparison } from '../shared/utils/answer-difference.ts'

function changedText(parts) {
  return parts.filter(part => part.kind === 'changed').map(part => part.text).join('')
}

describe('mise en évidence pédagogique des erreurs', () => {
  it('isole une terminaison manquante', () => {
    const comparison = buildAnswerComparison("les phrases qu’elle a dit", ["les phrases qu’elle a dite"])
    assert.equal(comparison?.mode, 'focused')
    assert.equal(changedText(comparison?.expectedParts || []), 'e')
    assert.equal(changedText(comparison?.learnerParts || []), '')
  })

  it('montre les deux caractères lors d’un remplacement', () => {
    const comparison = buildAnswerComparison('tu fini', ['tu finis'])
    assert.equal(comparison?.mode, 'focused')
    assert.equal(changedText(comparison?.expectedParts || []), 's')
  })

  it('barre un élément superflu', () => {
    const comparison = buildAnswerComparison('vous finissezz', ['vous finissez'])
    assert.equal(comparison?.learnerParts.some(part => part.kind === 'extra' && part.text === 'z'), true)
  })

  it('choisit la variante officielle la plus proche', () => {
    const comparison = buildAnswerComparison("j’assois", ["j’assieds", "j’assois"])
    assert.equal(comparison?.expectedAnswer, "j’assois")
  })

  it('préfère la forme saisie dans les blancs à la phrase de correction complète', () => {
    const comparison = buildAnswerComparison(
      'eusse fini',
      ['eusse finis'],
      ["Ce sont les seuls travaux que j’eusse finis"],
    )
    assert.equal(comparison?.mode, 'focused')
    assert.equal(comparison?.expectedAnswer, "Ce sont les seuls travaux que j’eusse finis")
    assert.equal(changedText(comparison?.expectedParts || []), 's')
    assert.equal(comparison?.expectedParts.map(part => part.text).join(''), "Ce sont les seuls travaux que j’eusse finis")
  })

  it('ne morcelle pas deux réponses sans rapport', () => {
    const comparison = buildAnswerComparison('bonjour monsieur', ['nous eussions fini'])
    assert.equal(comparison?.mode, 'full')
    assert.deepEqual(comparison?.learnerParts, [{ text: 'bonjour monsieur', kind: 'same' }])
    assert.deepEqual(comparison?.expectedParts, [{ text: 'nous eussions fini', kind: 'same' }])
  })

  it('ignore casse et variante d’apostrophe dans le calcul des différences', () => {
    const comparison = buildAnswerComparison("LES PHRASES QU'ELLE A DIT", ["les phrases qu’elle a dite"])
    assert.equal(changedText(comparison?.expectedParts || []), 'e')
  })
})
