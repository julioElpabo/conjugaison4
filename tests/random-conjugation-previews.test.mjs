import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { randomConjugationPreviews } from '../shared/utils/random-conjugation-previews.ts'

const modes = [
  { id: 1, name: 'Indicatif' },
  { id: 2, name: 'Conditionnel' },
  { id: 3, name: 'Subjonctif' },
  { id: 4, name: 'Impératif' },
  { id: 5, name: 'Participe' },
]

const tenses = modes.flatMap(mode => [
  { id: mode.id * 10, modeId: mode.id, name: 'présent' },
  { id: mode.id * 10 + 1, modeId: mode.id, name: 'passé' },
])

const conjugations = tenses.flatMap(tense => [
  { tenseId: tense.id, personId: 1, pronom: 'je', conjugaison1: 'forme 1' },
  { tenseId: tense.id, personId: 2, pronom: 'tu', conjugaison1: 'forme 2' },
])

describe('tirage des aperçus de conjugaison', () => {
  it('tire quatre formes appartenant à quatre modes différents', () => {
    const result = randomConjugationPreviews(modes, tenses, conjugations, 4, () => 0.42)
    assert.equal(result.length, 4)
    assert.equal(new Set(result.map(item => item.modeName)).size, 4)
    assert.ok(result.every(item => item.tenseName && item.pronoun))
  })

  it('ignore les modes et les formes qui ne possèdent aucune conjugaison', () => {
    const usableConjugations = conjugations.filter(form => form.tenseId < 40 && form.personId === 1)
    const result = randomConjugationPreviews(modes, tenses, usableConjugations, 4, () => 0)
    assert.equal(result.length, 3)
    assert.deepEqual(new Set(result.map(item => item.modeName)), new Set(['Indicatif', 'Conditionnel', 'Subjonctif']))
  })
})
