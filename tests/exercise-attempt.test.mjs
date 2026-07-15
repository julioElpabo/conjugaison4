import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { evaluateExerciseAnswer } from '../shared/utils/exercise-attempt.ts'

describe('deuxième tentative avant correction', () => {
  it('offre une nouvelle tentative après la première erreur', () => {
    const evaluation = evaluateExerciseAnswer('aimes', ['aime'], false)
    assert.equal(evaluation.result.isCorrect, false)
    assert.equal(evaluation.shouldRetry, true)
  })

  it('termine la question après une seconde erreur', () => {
    const evaluation = evaluateExerciseAnswer('aimes', ['aime'], true)
    assert.equal(evaluation.result.isCorrect, false)
    assert.equal(evaluation.shouldRetry, false)
  })

  it('valide immédiatement une réponse correcte', () => {
    const evaluation = evaluateExerciseAnswer('aime', ['aime'], false)
    assert.equal(evaluation.result.isCorrect, true)
    assert.equal(evaluation.shouldRetry, false)
  })
})
