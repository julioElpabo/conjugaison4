import assert from 'node:assert/strict'
import { test } from 'node:test'

import { identificationQuestion } from '../server/services/questionnaire.ts'
import { TENSE_IDENTIFICATION_INSTRUCTION } from '../shared/utils/exercise-instructions.ts'

test('utilise la même question pour identifier le mode et le temps', () => {
  const question = identificationQuestion({
    id: 1,
    verbe_id: 12,
    personne_id: 6,
    temp_id: 2,
    conjugaison1: 'abandonnait',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'abandonner',
    auxiliaire: 'avoir',
    participe_present: 'abandonnant',
    participe_passe: 'abandonné',
    auxiliaire_infinitif: null,
    auxiliaire_participe_present: null,
    pronom: 'il',
    temps_name: 'imparfait',
    is_compound: 0,
    mode_name: 'indicatif',
  })

  assert.equal(question.instruction, TENSE_IDENTIFICATION_INSTRUCTION)
  assert.equal(question.instruction, 'Quel est le mode et le temps de cette forme conjuguée?')
  assert.equal(question.consigne, 'il abandonnait')
  assert.deepEqual(question.reponsesPourCorrige, ["L'imparfait de l'indicatif"])
})
