import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseDefiDefinition, parseQuestionnaireRequest, PublicInputError, serializeDefi } from '../server/services/public-api-validation.ts'
import { toQuestionnaireRequest, toSharedChallengeRequest } from '../app/composables/useChallengeApi.ts'
import { learnerChallengeSnapshot } from '../server/utils/learner-progress.ts'
import { includesChallengePerson } from '../shared/utils/challenge-persons.ts'
import { validateConjugationAnswer } from '../shared/utils/answer.ts'
import { evaluateExerciseAnswer } from '../shared/utils/exercise-attempt.ts'

const config = {
  verbIds: [1], tenseIds: [1], questionCount: 10, exerciseKind: 'conjugation',
  identificationSource: 'selected-verbs', pastSimplePronouns: 'all',
  inclusivePronouns: false, includeOnPronoun: false,
  learningSupportMode: 'normal', voiceMode: 'active',
  includeComplements: false, complementPlacement: 'after', complementOptions: [],
}

test('je, tu et vous survivent au partage, à la relecture et au suivi élève', () => {
  const selected = { ...config, personIds: [8, 4, 5, 5] }
  const saved = parseDefiDefinition(toSharedChallengeRequest(selected, 'FLE'))
  const loaded = parseDefiDefinition(JSON.parse(serializeDefi(saved)))
  const snapshot = learnerChallengeSnapshot(loaded)
  assert.deepEqual(saved.personIds, [4, 5, 8])
  assert.deepEqual(snapshot.personIds, [4, 5, 8])
  assert.deepEqual(parseQuestionnaireRequest(toQuestionnaireRequest(loaded)).personIds, [4, 5, 8])
  assert.equal(config.personIds, undefined)
})

test('anciens défis et sélection complète gardent leur format sans personIds', () => {
  const legacy = parseDefiDefinition([[1], [1], 10, ['ililsonly']])
  assert.equal(legacy.pastSimplePronouns, 'third-person-only')
  assert.equal('personIds' in legacy, false)
  for (const personIds of [undefined, [4, 5, 6, 7, 8, 9]]) {
    const selected = { ...config, personIds }
    assert.equal('personIds' in toSharedChallengeRequest(selected), false)
    assert.equal('personIds' in parseDefiDefinition(selected), false)
    assert.equal('personIds' in parseQuestionnaireRequest(selected), false)
  }
})

test('l’API refuse une sélection vide, les identifiants étrangers et les types ambigus', () => {
  for (const personIds of [[], [1], [10], ['4'], [4.5], null, 'je', [4, 5, 6, 7, 8, 9, 4]]) {
    assert.throws(() => parseDefiDefinition({ ...config, personIds }), PublicInputError)
    assert.throws(() => parseQuestionnaireRequest({ ...config, personIds }), PublicInputError)
  }
})

test('le filtre distingue les personnes et conserve les formes sans personne', () => {
  assert.equal(includesChallengePerson([4, 5, 8], 6), false)
  assert.equal(includesChallengePerson([4, 5, 8], 8), true)
  assert.equal(includesChallengePerson([4], null), true)
  assert.equal(includesChallengePerson(undefined, 9), true)
})

test('les apostrophes de claviers mobiles passent dans les deux parcours de correction', () => {
  const question = { pronom: 'je', mode: 'indicatif', reponses: ["j'ai mangé"] }
  for (const apostrophe of ["'", '’', '‘', 'ʼ', '＇', '`', '´']) {
    const answer = `j${apostrophe}ai mangé`
    assert.equal(validateConjugationAnswer(answer, question).isCorrect, true, answer)
    assert.equal(evaluateExerciseAnswer(answer, question, false, true).result.isCorrect, true, answer)
  }
  assert.equal(validateConjugationAnswer('jai mangé', question).isCorrect, false)
  assert.equal(validateConjugationAnswer('j’ai mangè', question).isCorrect, false)
})
