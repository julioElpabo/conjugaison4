import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  conjugationModeOrder,
  conjugationTenseLabel,
  conjugationTenseOrder,
  conjugationTenseRow,
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
    const tenses = ['futur antérieur', 'passé simple', 'présent', 'futur proche', 'plus-que-parfait', 'futur', 'imparfait', 'passé composé', 'passé antérieur']
    assert.deepEqual(tenses.sort((left, right) => conjugationTenseOrder('indicatif', left) - conjugationTenseOrder('indicatif', right)), [
      'présent', 'passé composé', 'imparfait', 'plus-que-parfait', 'passé simple', 'passé antérieur', 'futur proche', 'futur', 'futur antérieur',
    ])
  })

  it('place chaque temps simple sur la même ligne que son temps composé', () => {
    const pairs = [
      ['indicatif', 'présent', 'passé composé'],
      ['indicatif', 'imparfait', 'plus-que-parfait'],
      ['indicatif', 'passé simple', 'passé antérieur'],
      ['indicatif', 'futur', 'futur antérieur'],
      ['subjonctif', 'présent', 'passé'],
      ['subjonctif', 'imparfait', 'plus-que-parfait'],
      ['conditionnel', 'présent', 'passé 1'],
      ['impératif', 'présent', 'passé'],
    ]
    for (const [mode, simple, compound] of pairs) {
      assert.equal(conjugationTenseRow(mode, simple), conjugationTenseRow(mode, compound))
    }
  })

  it('réserve la dernière ligne de l’indicatif au futur simple et au futur antérieur', () => {
    assert.ok(conjugationTenseRow('indicatif', 'futur') > conjugationTenseRow('indicatif', 'futur proche'))
    assert.equal(conjugationTenseRow('indicatif', 'futur'), conjugationTenseRow('indicatif', 'futur antérieur'))
  })

  it('utilise les intitulés complets et distingue les modes personnels', () => {
    assert.equal(conjugationTenseLabel('indicatif', 'futur'), 'futur simple')
    assert.equal(conjugationTenseLabel('conditionnel', 'passé 1'), 'passé première forme')
    assert.equal(conjugationTenseLabel('conditionnel', 'passé 2'), 'passé deuxième forme')
    assert.equal(isFiniteConjugationMode('subjonctif'), true)
    assert.equal(isFiniteConjugationMode('participe'), false)
  })
})
