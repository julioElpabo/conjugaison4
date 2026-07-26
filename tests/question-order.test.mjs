import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shuffledQuestionOrder } from '../shared/utils/question-order.ts'

describe('ordre des questions réentraînées', () => {
  it('change même lorsque le tirage aléatoire conserverait l’ordre initial', () => {
    const questions = ['a', 'b', 'c']
    const shuffled = shuffledQuestionOrder(questions, () => .999)

    assert.deepEqual(shuffled, ['b', 'c', 'a'])
    assert.deepEqual(questions, ['a', 'b', 'c'])
  })

  it('conserve exactement le même ensemble de questions', () => {
    const shuffled = shuffledQuestionOrder(['a', 'b', 'c', 'd'], () => 0)
    assert.deepEqual([...shuffled].sort(), ['a', 'b', 'c', 'd'])
    assert.notDeepEqual(shuffled, ['a', 'b', 'c', 'd'])
  })
})
