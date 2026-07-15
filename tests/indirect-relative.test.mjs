import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { indirectRelative } from '../server/services/indirect-relative.ts'

describe('antéposition des compléments indirects', () => {
  it('forme auquel et à laquelle', () => {
    assert.deepEqual(indirectRelative('à une réunion', 'à'), {
      antecedent: 'la réunion', relativePronoun: 'à laquelle',
    })
    assert.deepEqual(indirectRelative('au projet', 'à'), {
      antecedent: 'le projet', relativePronoun: 'auquel',
    })
    assert.deepEqual(indirectRelative('à cette autre réunion', 'à'), {
      antecedent: 'l’autre réunion', relativePronoun: 'à laquelle',
    })
  })

  it('forme duquel et de laquelle', () => {
    assert.deepEqual(indirectRelative("d'une décision", 'de'), {
      antecedent: 'la décision', relativePronoun: 'de laquelle',
    })
    assert.deepEqual(indirectRelative('du résultat', 'de'), {
      antecedent: 'le résultat', relativePronoun: 'duquel',
    })
  })

  it('écarte les groupes dont le genre ne peut pas être établi sûrement', () => {
    assert.equal(indirectRelative('aux débats', 'à'), null)
    assert.equal(indirectRelative('à ses amis', 'à'), null)
  })
})
