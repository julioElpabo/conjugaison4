import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import {
  applicableLearnerErrorTypes,
  type LearnerErrorTypeCode,
} from '~~/shared/utils/learner-error-diagnostics'
import {
  buildLearnerErrorProgress,
  type LearnerErrorProgressDailySource,
} from '~~/shared/utils/learner-error-progress'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface DailyStatRow extends RowDataPacket {
  code: LearnerErrorTypeCode
  statDate: string
  opportunities: number
  errors: number
}

interface RunQuestionRow extends RowDataPacket {
  runId: number
  statDate: string
  questionJson: string
}

interface RunErrorRow extends RowDataPacket {
  runId: number
  code: LearnerErrorTypeCode
  errors: number
}

function jsonQuestion(source: string) {
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
  const [[runQuestions], [runErrors], [dailyRows]] = await Promise.all([
    database.execute<RunQuestionRow[]>(`
      SELECT r.id AS runId,
             DATE_FORMAT(COALESCE(r.completed_at, r.last_answered_at), '%Y-%m-%d') AS statDate,
             q.question_json AS questionJson
      FROM learner_challenge_runs r
      INNER JOIN learner_run_questions q ON q.run_id=r.id
      WHERE r.account_id=? AND r.last_answered_at IS NOT NULL
      ORDER BY COALESCE(r.completed_at, r.last_answered_at), r.id, q.question_index
    `, [learner.id]),
    database.execute<RunErrorRow[]>(`
      SELECT a.run_id AS runId, t.error_type_code AS code, COUNT(*) AS errors
      FROM learner_challenge_runs r
      INNER JOIN learner_answer_attempts a ON a.run_id=r.id
      INNER JOIN learner_attempt_error_tags t ON t.attempt_id=a.id
      WHERE r.account_id=? AND t.is_initial=1
      GROUP BY a.run_id, t.error_type_code
    `, [learner.id]),
    database.execute<DailyStatRow[]>(`
    SELECT error_type_code AS code,
           DATE_FORMAT(stat_date, '%Y-%m-%d') AS statDate,
           opportunities,
           errors
    FROM learner_skill_daily_stats
    WHERE account_id=?
    ORDER BY error_type_code, stat_date
    `, [learner.id]),
  ])

  if (!runQuestions.length) {
    return buildLearnerErrorProgress(dailyRows.map((row): LearnerErrorProgressDailySource => ({
      code: row.code,
      statDate: row.statDate,
      opportunities: Number(row.opportunities),
      errors: Number(row.errors),
    })))
  }

  const runStats = new Map<string, LearnerErrorProgressDailySource>()
  for (const row of runQuestions) {
    const question = jsonQuestion(row.questionJson)
    if (!question) continue
    for (const code of applicableLearnerErrorTypes(question)) {
      const key = `${row.runId}\u0000${code}`
      const stat = runStats.get(key) || {
        code,
        statDate: row.statDate,
        sequence: Number(row.runId),
        opportunities: 0,
        errors: 0,
      }
      stat.opportunities += 1
      runStats.set(key, stat)
    }
  }
  for (const row of runErrors) {
    const stat = runStats.get(`${row.runId}\u0000${row.code}`)
    if (stat) stat.errors = Math.min(stat.opportunities, Number(row.errors) || 0)
  }

  return buildLearnerErrorProgress([...runStats.values()].map((row): LearnerErrorProgressDailySource => ({
    code: row.code,
    statDate: row.statDate,
    sequence: row.sequence,
    opportunities: row.opportunities,
    errors: row.errors,
  })))
})
