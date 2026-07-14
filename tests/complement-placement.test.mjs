import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { inferAnteposedComplement } from '../server/services/complement-placement.ts'

describe('préparation grammaticale des COD antéposés', () => {
  it('transforme les déterminants sans perdre le genre', () => {
    assert.deepEqual(inferAnteposedComplement('une pomme'), {
      text: 'la pomme', gender: 'feminin', number: 'singulier'
    })
    assert.deepEqual(inferAnteposedComplement('du pain'), {
      text: 'le pain', gender: 'masculin', number: 'singulier'
    })
  })

  it('élide le déterminant devant une voyelle', () => {
    assert.deepEqual(inferAnteposedComplement('un abricot'), {
      text: 'l’abricot', gender: 'masculin', number: 'singulier'
    })
    assert.deepEqual(inferAnteposedComplement('une activité'), {
      text: 'l’activité', gender: 'feminin', number: 'singulier'
    })
  })

  it('utilise un lexique contrôlé pour les pluriels', () => {
    assert.deepEqual(inferAnteposedComplement('des pommes'), {
      text: 'les pommes', gender: 'feminin', number: 'pluriel'
    })
    assert.deepEqual(inferAnteposedComplement('ses cheveux'), {
      text: 'les cheveux', gender: 'masculin', number: 'pluriel'
    })
  })

  it('refuse les genres ou h impossibles à déduire avec certitude', () => {
    assert.equal(inferAnteposedComplement('des objets inconnus'), null)
    assert.equal(inferAnteposedComplement('un héros'), null)
    assert.equal(inferAnteposedComplement('de l’eau'), null)
  })
})
