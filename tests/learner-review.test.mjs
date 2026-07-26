import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildLearnerReview } from '../shared/utils/learner-review.ts'

function attempt(overrides = {}) {
  return {
    formKey: 'prendre-passe-simple-nous',
    infinitive: 'prendre',
    mode: 'indicatif',
    tense: 'passé simple',
    person: 'nous',
    learnerAnswer: 'prennâmes',
    expectedAnswers: ['nous prîmes'],
    answeredAt: '2026-07-25T10:00:00.000Z',
    ...overrides,
  }
}

describe('synthèse des formes à revoir', () => {
  it('regroupe les fautes d’une même forme et conserve les corrections', () => {
    const summary = buildLearnerReview([
      attempt(),
      attempt({
        learnerAnswer: 'prenîmes',
        expectedAnswers: ['nous prîmes', 'prîmes'],
        answeredAt: '2026-07-26T10:00:00.000Z',
      }),
    ])

    assert.equal(summary.totalErrors, 2)
    assert.equal(summary.forms.length, 1)
    assert.equal(summary.forms[0].errorCount, 2)
    assert.deepEqual(summary.forms[0].learnerAnswers, ['prennâmes', 'prenîmes'])
    assert.deepEqual(summary.forms[0].expectedAnswers, ['nous prîmes', 'prîmes'])
    assert.equal(summary.forms[0].lastErrorAt, '2026-07-26T10:00:00.000Z')
  })

  it('signale un temps dominant quand au moins 60 % de cinq fautes le concernent', () => {
    const attempts = [
      ...Array.from({ length: 4 }, (_, index) => attempt({
        formKey: `past-${index}`,
        answeredAt: `2026-07-2${index + 1}T10:00:00.000Z`,
      })),
      attempt({
        formKey: 'present-1',
        tense: 'présent',
        learnerAnswer: 'prend',
        expectedAnswers: ['tu prends'],
      }),
    ]
    const summary = buildLearnerReview(attempts)

    assert.deepEqual(summary.insight, {
      dimension: 'tense',
      label: 'passé simple',
      errorCount: 4,
      totalErrors: 5,
      percent: 80,
    })
  })

  it('ne fabrique pas de tendance à partir de trop peu de fautes', () => {
    assert.equal(buildLearnerReview([attempt(), attempt()]).insight, null)
  })
})
