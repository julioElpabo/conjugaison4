import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { evaluateExerciseAnswer } from '../shared/utils/exercise-attempt.ts'

describe('deuxième tentative avant correction', () => {
  it('offre une nouvelle tentative après la première erreur', () => {
    const evaluation = evaluateExerciseAnswer('tu aimes', { reponses: ['tu aime'] }, false)
    assert.equal(evaluation.result.isCorrect, false)
    assert.equal(evaluation.shouldRetry, true)
  })

  it('termine la question après une seconde erreur', () => {
    const evaluation = evaluateExerciseAnswer('tu aimes', { reponses: ['tu aime'] }, true)
    assert.equal(evaluation.result.isCorrect, false)
    assert.equal(evaluation.shouldRetry, false)
  })

  it('valide immédiatement une réponse correcte', () => {
    const evaluation = evaluateExerciseAnswer('tu aimes', {
      reponses: ['tu aimes'], pronom: 'tu', mode: 'indicatif',
    }, false, true)
    assert.equal(evaluation.result.isCorrect, true)
    assert.equal(evaluation.shouldRetry, false)
  })

  it('refuse une réponse sans le pronom demandé', () => {
    const evaluation = evaluateExerciseAnswer('aimes', {
      reponses: ['aimes', 'tu aimes'], pronom: 'tu', mode: 'indicatif',
    }, false, true)
    assert.equal(evaluation.result.isCorrect, false)
    assert.equal(evaluation.result.reason, 'missing-subject-pronoun')
    assert.equal(evaluation.missingSubjectPronoun, true)
    assert.equal(evaluation.shouldRetry, false)
  })
})
