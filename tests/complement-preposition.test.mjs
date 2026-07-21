import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  withComplementPreposition,
  withoutComplementPreposition,
} from '../shared/utils/complement-preposition.ts'

describe('prépositions des compléments indirects', () => {
  it('ajoute à avec les contractions attendues', () => {
    assert.equal(withComplementPreposition('ses amis', 'à'), 'à ses amis')
    assert.equal(withComplementPreposition('le projet', 'à'), 'au projet')
    assert.equal(withComplementPreposition('les élèves', 'à'), 'aux élèves')
    assert.equal(withComplementPreposition('à une amie', 'à'), 'à une amie')
  })

  it('ajoute de avec les contractions et élisions attendues', () => {
    assert.equal(withComplementPreposition('son projet', 'de'), 'de son projet')
    assert.equal(withComplementPreposition('le projet', 'de'), 'du projet')
    assert.equal(withComplementPreposition('les élèves', 'de'), 'des élèves')
    assert.equal(withComplementPreposition('une décision', 'de'), 'd’une décision')
  })

  it('restitue la forme sans préposition pour l’administration', () => {
    assert.equal(withoutComplementPreposition('aux élèves', 'à'), 'les élèves')
    assert.equal(withoutComplementPreposition('au projet', 'à'), 'le projet')
    assert.equal(withoutComplementPreposition('des élèves', 'de'), 'les élèves')
    assert.equal(withoutComplementPreposition('d’une décision', 'de'), 'une décision')
  })
})
