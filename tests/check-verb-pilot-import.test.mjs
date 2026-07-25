import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  pastParticiples,
  simpleForms,
} from '../scripts/check-verb-pilot-import.mjs'

const candidate = {
  forms: {
    'indicative|present|singular|firstPerson|-': ['aime'],
    'imperative|present|singular|secondPerson|-': ['aime'],
    'participle|past|plural|-|masculine': ['aimés'],
  },
}

describe('préparation des formes du lot pilote', () => {
  it('associe une forme simple à la personne du site', () => {
    assert.deepEqual(simpleForms(candidate, 'indicative', 'present', 4), ['aime'])
  })

  it('ne remplit que les trois personnes de l’impératif', () => {
    assert.deepEqual(simpleForms(candidate, 'imperative', 'present', 5), ['aime'])
    assert.deepEqual(simpleForms(candidate, 'imperative', 'present', 4), [])
  })

  it('sélectionne le participe pluriel pour les temps avec être', () => {
    assert.deepEqual(pastParticiples(candidate, 7), ['aimés'])
  })
})
