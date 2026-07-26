import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildChallengeProgress, challengeAchievement } from '../shared/utils/challenge-progress.ts'

function run(id, correctCount, incorrectCount) {
  return {
    id,
    correctCount,
    incorrectCount,
    occurredAt: `2026-07-${String(20 + id).padStart(2, '0')}T10:00:00.000Z`,
  }
}

describe('progression des répétitions complètes d’un défi', () => {
  it('calcule les pourcentages et ordonne les séances', () => {
    const summary = buildChallengeProgress([
      run(2, 8, 2),
      run(1, 5, 5),
    ])
    assert.deepEqual(summary.points.map(point => point.successPercent), [50, 80])
    assert.equal(summary.successTrend.direction, 'up')
    assert.equal(summary.successTrend.delta, 30)
    assert.equal(summary.errorTrend.direction, 'down')
    assert.equal(summary.errorTrend.delta, -3)
  })

  it('compare les moyennes des deux moitiés avec plusieurs répétitions', () => {
    const summary = buildChallengeProgress([
      run(1, 4, 6),
      run(2, 6, 4),
      run(3, 8, 2),
      run(4, 9, 1),
      run(5, 10, 0),
      run(6, 9, 1),
    ])
    assert.equal(summary.successTrend.direction, 'up')
    assert.equal(summary.successTrend.delta, 33.3)
    assert.equal(summary.errorTrend.direction, 'down')
    assert.equal(summary.errorTrend.delta, -3.3)
  })

  it('attend deux séances avant de tirer une conclusion', () => {
    const summary = buildChallengeProgress([run(1, 8, 2)])
    assert.equal(summary.successTrend.direction, 'insufficient')
    assert.equal(summary.errorTrend.direction, 'insufficient')
  })

  it('fusionne les entraînements ciblés ayant le même jour et les mêmes questions', () => {
    const summary = buildChallengeProgress([
      { ...run(1, 2, 1), occurredAt: '2026-07-26T08:00:00.000Z', groupKey: '2026-07-26|questions-a-b' },
      { ...run(2, 3, 0), occurredAt: '2026-07-26T17:00:00.000Z', groupKey: '2026-07-26|questions-a-b' },
      { ...run(3, 1, 1), occurredAt: '2026-07-26T18:00:00.000Z', groupKey: '2026-07-26|questions-a-c' },
    ])

    assert.equal(summary.points.length, 2)
    assert.deepEqual(summary.points[0], {
      id: 2,
      occurredAt: '2026-07-26T17:00:00.000Z',
      correctCount: 5,
      incorrectCount: 1,
      totalCount: 6,
      successPercent: 83,
      runIds: [1, 2],
    })
    assert.deepEqual(summary.points[1].runIds, [3])
  })

  it('ne valide le défi sans faute que si toutes ses questions ont été faites', () => {
    assert.deepEqual(challengeAchievement([
      { correctCount: 3, incorrectCount: 0, answeredQuestionCount: 3, expectedQuestionCount: 10 },
    ]), {
      questionCount: 10,
      completedWithoutError: false,
    })
    assert.equal(challengeAchievement([
      { correctCount: 3, incorrectCount: 0, answeredQuestionCount: 3, expectedQuestionCount: 10 },
      { correctCount: 10, incorrectCount: 0, answeredQuestionCount: 10, expectedQuestionCount: 10 },
    ]).completedWithoutError, true)
    assert.equal(challengeAchievement([
      { correctCount: 10, incorrectCount: 1, answeredQuestionCount: 10, expectedQuestionCount: 10 },
    ]).completedWithoutError, false)
  })
})
