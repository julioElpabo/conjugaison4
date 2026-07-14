import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildTenseExamples } from '../server/services/tense-examples.ts'

describe('exemples des infobulles de temps', () => {
  it('choisit une personne de manger et place le complément après le verbe', () => {
    const examples = buildTenseExamples(
      [{ id: 1, mode: 'indicatif', name: 'présent' }],
      [
        { temp_id: 1, pronom: 'je', conjugaison1: 'mange', mode_name: 'indicatif' },
        { temp_id: 1, pronom: 'nous', conjugaison1: 'mangeons', mode_name: 'indicatif' },
      ],
      (() => {
        const values = [0.99, 0.2]
        return () => values.shift() ?? 0
      })(),
    )

    assert.equal(examples.get(1), 'Nous mangeons un sandwich.')
  })

  it('respecte la syntaxe du subjonctif et de l’impératif', () => {
    const examples = buildTenseExamples(
      [
        { id: 10, mode: 'subjonctif', name: 'présent' },
        { id: 9, mode: 'impératif', name: 'présent' },
      ],
      [
        { temp_id: 10, pronom: 'elle', conjugaison1: 'mange', mode_name: 'subjonctif' },
        { temp_id: 9, pronom: 'tu', conjugaison1: 'mange', mode_name: 'impératif' },
      ],
      () => 0,
    )

    assert.equal(examples.get(10), "Qu'elle mange une pomme.")
    assert.equal(examples.get(9), 'Mange une pomme !')
  })

  it('fournit aussi les exemples sans pronom du participe et du gérondif', () => {
    const examples = buildTenseExamples([
      { id: 20, mode: 'participe', name: 'présent' },
      { id: 21, mode: 'participe', name: 'passé' },
      { id: 22, mode: 'gérondif', name: 'présent' },
      { id: 23, mode: 'gérondif', name: 'passé' },
    ], [], (() => {
      const values = [0, 0.2, 0.4, 0.6]
      return () => values.shift() ?? 0
    })())

    assert.deepEqual([...examples.values()], [
      'Mangeant une pomme.',
      'Ayant mangé un sandwich.',
      'En mangeant son goûter.',
      'En ayant mangé une soupe.',
    ])
  })
})
