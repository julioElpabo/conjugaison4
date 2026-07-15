import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import mysql from 'mysql2/promise'

import { listCoaches } from '../server/services/coaches.ts'
import { answerTurnPlan, CHAT_BUBBLE_DELAY_MS, CHAT_NEXT_QUESTION_DELAY_MS, openingTurnPlan } from '../shared/utils/coach-conversation.ts'
import { auditCoachCredibility } from '../shared/utils/coach-credibility.ts'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
const config = {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
}

describe('scénarios chronologiques du chat', () => {
  it('présente le coach puis termine toujours par la consigne seule', () => {
    assert.deepEqual(openingTurnPlan(), [
      { kind: 'reaction', eventType: 'introduction' },
      { kind: 'reaction', eventType: 'question' },
      { kind: 'instruction' },
    ])
    assert.equal(CHAT_BUBBLE_DELAY_MS, 1_000)
  })

  it('réagit à une bonne réponse puis relance après trois secondes', () => {
    assert.deepEqual(answerTurnPlan({ correct: true, hasNext: true }), [
      { kind: 'reaction', eventType: 'correct' },
      { kind: 'delay', milliseconds: CHAT_NEXT_QUESTION_DELAY_MS },
      { kind: 'next-question' },
    ])
  })

  it('annonce une variante correcte avant de poursuivre', () => {
    assert.deepEqual(answerTurnPlan({ correct: true, hasAlternative: true, hasNext: true }).slice(0, 2), [
      { kind: 'reaction', eventType: 'correct-alternative' },
      { kind: 'alternative' },
    ])
  })

  it('corrige une erreur sans la féliciter puis relance', () => {
    const plan = answerTurnPlan({ correct: false, hasNext: true })
    assert.equal(plan[0].eventType, 'incorrect')
    assert.equal(plan.some(step => step.kind === 'reaction' && step.eventType === 'correct'), false)
    assert.deepEqual(plan.at(-1), { kind: 'next-question' })
  })

  it('ne plaque pas une explication grammaticale indépendante après la correction', () => {
    const plan = answerTurnPlan({ correct: false, hasNext: true })
    assert.equal(plan.filter(step => step.kind === 'reaction').length, 1)
    assert.equal(plan[0].eventType, 'incorrect')
  })

  it('félicite une série sans remplacer la question suivante', () => {
    const plan = answerTurnPlan({ correct: true, streak: true, hasNext: true })
    assert.equal(plan.some(step => step.kind === 'reaction' && step.eventType === 'streak'), true)
    assert.deepEqual(plan.at(-1), { kind: 'next-question' })
  })

  it('termine la conversation sans poser une question supplémentaire', () => {
    const plan = answerTurnPlan({ correct: true, hasNext: false })
    assert.deepEqual(plan.at(-1), { kind: 'finish' })
    assert.equal(plan.some(step => step.kind === 'next-question'), false)
  })
})

describe('crédibilité des douze coaches', { skip: !databaseConfigured }, () => {
  it('simule 60 interventions par coach sans répétition mécanique', async () => {
    const db = await mysql.createConnection(config)
    try {
      const coaches = await listCoaches(db, true)
      assert.equal(coaches.length, 12)
      for (const [index, coach] of coaches.entries()) {
        const report = auditCoachCredibility(coach, 10_000 + index)
        assert.equal(report.passed, true, `${report.coachName} (${report.score} %) : ${report.checks.filter(check => !check.passed).map(check => `${check.label}: ${check.actual}`).join('; ')}`)
      }
    } finally { await db.end() }
  })
})
