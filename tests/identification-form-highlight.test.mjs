import assert from 'node:assert/strict'
import test from 'node:test'

import { identificationFormParts } from '../shared/utils/identification-form.ts'

function question(overrides) {
  return {
    titre: 'Identifier',
    consigne: '',
    reponses: ['indicatif présent'],
    reponsesPourCorrige: ['indicatif présent'],
    ...overrides,
  }
}

test('isole la forme conjuguée dans un énoncé simple', () => {
  assert.deepEqual(identificationFormParts(question({
    consigne: 'il abandonnait',
    conjugaison1: 'abandonnait',
  })), {
    before: 'il ',
    target: 'abandonnait',
    after: '',
  })
})

test('isole la forme conjuguée après un pronom élidé', () => {
  assert.deepEqual(identificationFormParts(question({
    consigne: "j'attends",
    conjugaison1: 'attends',
  })), {
    before: "j'",
    target: 'attends',
    after: '',
  })
})

test('reprend directement le découpage d’une citation littéraire', () => {
  assert.deepEqual(identificationFormParts(question({
    consigne: 'ignoré',
    literaryCitation: {
      before: 'Il ', target: 'viendra', after: ' demain.',
      author: 'Auteur', work: 'Œuvre', sourceUrl: '',
    },
  })), {
    before: 'Il ',
    target: 'viendra',
    after: ' demain.',
  })
})

test('retrouve seulement la forme composée dans une ancienne question enregistrée', () => {
  assert.deepEqual(identificationFormParts(question({
    consigne: 'Nous étions arrivés à l’auberge du « Donjon ».',
    pronom: 'nous',
    isCompound: true,
  })), {
    before: 'Nous ',
    target: 'étions arrivés',
    after: ' à l’auberge du « Donjon ».',
  })
})

test('reconnaît un temps composé même si une ancienne reprise a perdu son indicateur', () => {
  assert.deepEqual(identificationFormParts(question({
    consigne: 'Nous étions arrivés à l’auberge du « Donjon ».',
    pronom: 'nous',
    temps: 'plus-que-parfait',
    isCompound: false,
  })), {
    before: 'Nous ',
    target: 'étions arrivés',
    after: ' à l’auberge du « Donjon ».',
  })
})

test('ne surligne jamais toute une phrase quand la forme ne peut pas être isolée', () => {
  assert.equal(identificationFormParts(question({
    consigne: 'Une phrase dont la cible est inconnue.',
  })), null)
})
