import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  conjugationModeOrder,
  conjugationTenseLabel,
  conjugationTenseOrder,
  isFiniteConjugationMode,
} from '../shared/data/conjugation-display.ts'

describe('ordre d’affichage des conjugaisons', () => {
  it('suit l’ordre des modes du site de référence', () => {
    const modes = ['gérondif', 'impératif', 'indicatif', 'participe', 'conditionnel', 'subjonctif', 'infinitif']
    assert.deepEqual(modes.sort((left, right) => conjugationModeOrder(left) - conjugationModeOrder(right)), [
      'indicatif', 'subjonctif', 'conditionnel', 'impératif', 'participe', 'infinitif', 'gérondif',
    ])
  })

  it('alterne les temps simples et composés de l’indicatif', () => {
    const tenses = ['futur antérieur', 'passé simple', 'présent', 'plus-que-parfait', 'futur', 'imparfait', 'passé composé', 'passé antérieur']
    assert.deepEqual(tenses.sort((left, right) => conjugationTenseOrder('indicatif', left) - conjugationTenseOrder('indicatif', right)), [
      'présent', 'passé composé', 'imparfait', 'plus-que-parfait', 'passé simple', 'passé antérieur', 'futur', 'futur antérieur',
    ])
  })

  it('utilise les intitulés complets et distingue les modes personnels', () => {
    assert.equal(conjugationTenseLabel('indicatif', 'futur'), 'futur simple')
    assert.equal(conjugationTenseLabel('conditionnel', 'passé 1'), 'passé première forme')
    assert.equal(conjugationTenseLabel('conditionnel', 'passé 2'), 'passé deuxième forme')
    assert.equal(isFiniteConjugationMode('subjonctif'), true)
    assert.equal(isFiniteConjugationMode('participe'), false)
  })
})
