import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import type { LearnerErrorConfidence, LearnerErrorTypeCode } from '~~/shared/utils/learner-error-diagnostics'
import {
  buildLearnerErrorInsights,
  type LearnerErrorExample,
  type LearnerErrorStatSource,
} from '~~/shared/utils/learner-error-insights'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface StatRow extends RowDataPacket, LearnerErrorStatSource {}

interface ExampleRow extends RowDataPacket {
  code: LearnerErrorTypeCode
  confidence: LearnerErrorConfidence
  learnerAnswer: string
  infinitive: string
  mode: string
  tense: string
  questionJson: string
  answeredAt: Date
}

interface PrimaryCountRow extends RowDataPacket {
  code: LearnerErrorTypeCode
  primaryErrors: number
}

function questionFromJson(source: string) {
  try {
    return JSON.parse(source) as ExerciseQuestion
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const database = useDatabase()
  const [stats] = await database.execute<StatRow[]>(`
    SELECT error_type_code AS code,
           SUM(opportunities) AS opportunities,
           SUM(errors) AS errors,
           SUM(IF(stat_date >= CURRENT_DATE - INTERVAL 29 DAY, opportunities, 0)) AS recentOpportunities,
           SUM(IF(stat_date >= CURRENT_DATE - INTERVAL 29 DAY, errors, 0)) AS recentErrors,
           SUM(IF(stat_date BETWEEN CURRENT_DATE - INTERVAL 59 DAY
             AND CURRENT_DATE - INTERVAL 30 DAY, opportunities, 0)) AS previousOpportunities,
           SUM(IF(stat_date BETWEEN CURRENT_DATE - INTERVAL 59 DAY
             AND CURRENT_DATE - INTERVAL 30 DAY, errors, 0)) AS previousErrors
    FROM learner_skill_daily_stats
    WHERE account_id=?
    GROUP BY error_type_code
  `, [learner.id])
  const [rows] = await database.execute<ExampleRow[]>(`
    SELECT tags.error_type_code AS code, tags.confidence,
           attempts.learner_answer AS learnerAnswer, attempts.infinitive,
           attempts.mode_label AS mode, attempts.tense_label AS tense,
           attempts.question_json AS questionJson, attempts.answered_at AS answeredAt
    FROM learner_attempt_error_tags tags
    INNER JOIN learner_answer_attempts attempts ON attempts.id=tags.attempt_id
    INNER JOIN learner_challenge_runs runs ON runs.id=attempts.run_id
    WHERE runs.account_id=? AND tags.is_initial=1
      AND tags.confidence IN ('high', 'medium')
    ORDER BY attempts.answered_at DESC, attempts.id DESC
    LIMIT 500
  `, [learner.id])
  const [primaryCounts] = await database.execute<PrimaryCountRow[]>(`
    SELECT tags.error_type_code AS code, COUNT(*) AS primaryErrors
    FROM learner_attempt_error_tags tags
    INNER JOIN learner_answer_attempts attempts ON attempts.id=tags.attempt_id
    INNER JOIN learner_challenge_runs runs ON runs.id=attempts.run_id
    WHERE runs.account_id=? AND tags.is_initial=1 AND tags.is_primary=1
    GROUP BY tags.error_type_code
  `, [learner.id])
  const primaryByCode = new Map(primaryCounts.map(row => [row.code, Number(row.primaryErrors)]))
  const examples = new Map<LearnerErrorTypeCode, LearnerErrorExample[]>()
  for (const row of rows) {
    const current = examples.get(row.code) || []
    if (current.length >= 3) continue
    const question = questionFromJson(row.questionJson)
    current.push({
      learnerAnswer: row.learnerAnswer,
      expectedAnswers: [...(question?.reponsesPourCorrige?.length
        ? question.reponsesPourCorrige
        : question?.reponses || [])].slice(0, 4),
      infinitive: row.infinitive || question?.infinitif || '',
      mode: row.mode || question?.mode || '',
      tense: row.tense || question?.temps || '',
      person: question?.pronom || question?.saisiePrefixe || '',
      answeredAt: row.answeredAt.toISOString(),
      confidence: row.confidence,
    })
    examples.set(row.code, current)
  }
  return buildLearnerErrorInsights(stats.map(stat => ({
    ...stat,
    primaryErrors: primaryByCode.get(stat.code) || 0,
  })), examples)
})
