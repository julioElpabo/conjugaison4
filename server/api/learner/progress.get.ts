import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import {
  applicableLearnerErrorTypes,
  LEARNER_ERROR_TAXONOMY,
  learnerErrorDetails,
  learnerErrorDetailText,
  type LearnerErrorTypeCode,
} from '~~/shared/utils/learner-error-diagnostics'
import {
  buildLearnerErrorProgress,
  type LearnerErrorProgressDailySource,
  type LearnerErrorProgressExample,
} from '~~/shared/utils/learner-error-progress'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'
import { normalizeLocale } from '../../../shared/i18n/locales'

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

interface ErrorExampleRow extends RowDataPacket {
  id: number
  code: LearnerErrorTypeCode
  learnerAnswer: string
  questionJson: string
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
  const locale = normalizeLocale(getQuery(event).locale, 'fr')

  const database = useDatabase()
  const [[runQuestions], [runErrors], [dailyRows], [exampleRows]] = await Promise.all([
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
    database.execute<ErrorExampleRow[]>(`
      SELECT id, code, learnerAnswer, questionJson
      FROM (
        SELECT a.id, t.error_type_code AS code,
               a.learner_answer AS learnerAnswer,
               a.question_json AS questionJson,
               ROW_NUMBER() OVER (
                 PARTITION BY t.error_type_code
                 ORDER BY a.answered_at DESC, a.id DESC
               ) AS exampleRank
        FROM learner_answer_attempts a
        INNER JOIN learner_attempt_error_tags t ON t.attempt_id=a.id
        INNER JOIN learner_challenge_runs r ON r.id=a.run_id
        WHERE r.account_id=? AND t.is_initial=1
          AND t.confidence IN ('high', 'medium')
      ) rankedExamples
      WHERE exampleRank <= 5
      ORDER BY code, exampleRank
    `, [learner.id]),
  ])

  const adviceByCode = new Map(LEARNER_ERROR_TAXONOMY.map(item => [item.code, item.advice]))
  const examples = new Map<LearnerErrorTypeCode, LearnerErrorProgressExample[]>()
  for (const row of exampleRows) {
    const current = examples.get(row.code) || []
    if (current.length >= 5) continue
    const question = jsonQuestion(row.questionJson)
    if (!question) continue
    const detail = learnerErrorDetails(row.learnerAnswer, question)
      .find(candidate => candidate.code === row.code)
    const expectedAnswers = [...(question.reponsesPourCorrige?.length
      ? question.reponsesPourCorrige
      : question.reponses || [])]
      .filter(Boolean)
      .slice(0, 4)
    current.push({
      id: Number(row.id),
      question: question.consigne || [
        question.infinitif || question.titre,
        question.mode,
        question.temps,
        question.pronom || question.saisiePrefixe,
      ].filter(Boolean).join(' · '),
      learnerAnswer: row.learnerAnswer,
      expectedAnswers,
      reason: detail
        ? learnerErrorDetailText(detail, locale)
        : adviceByCode.get(row.code)
          || 'Compare ta réponse avec la correction pour repérer cette différence.',
    })
    examples.set(row.code, current)
  }

  if (!runQuestions.length) {
    return buildLearnerErrorProgress(dailyRows.map((row): LearnerErrorProgressDailySource => ({
      code: row.code,
      statDate: row.statDate,
      opportunities: Number(row.opportunities),
      errors: Number(row.errors),
    })), undefined, examples)
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
  })), undefined, examples)
})
