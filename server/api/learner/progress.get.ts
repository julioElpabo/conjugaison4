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
  challengeKey: string
  statDate: string
  questionJson: string
}

interface RunErrorAttemptRow extends RowDataPacket {
  id: number
  runId: number
  learnerAnswer: string
  questionJson: string
}

interface ErrorExampleRow extends RowDataPacket {
  id: number
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
             r.challenge_fingerprint AS challengeKey,
             DATE_FORMAT(COALESCE(r.completed_at, r.last_answered_at), '%Y-%m-%d') AS statDate,
             q.question_json AS questionJson
      FROM learner_challenge_runs r
      INNER JOIN learner_run_questions q ON q.run_id=r.id
      WHERE r.account_id=? AND r.last_answered_at IS NOT NULL
      ORDER BY COALESCE(r.completed_at, r.last_answered_at), r.id, q.question_index
    `, [learner.id]),
    database.execute<RunErrorAttemptRow[]>(`
      SELECT DISTINCT a.id, a.run_id AS runId,
             a.learner_answer AS learnerAnswer,
             a.question_json AS questionJson
      FROM learner_challenge_runs r
      INNER JOIN learner_answer_attempts a ON a.run_id=r.id
      INNER JOIN learner_attempt_error_tags t ON t.attempt_id=a.id
      WHERE r.account_id=? AND t.is_initial=1
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
      SELECT a.id,
             a.learner_answer AS learnerAnswer,
             a.question_json AS questionJson
      FROM learner_answer_attempts a
      INNER JOIN learner_challenge_runs r ON r.id=a.run_id
      WHERE r.account_id=?
        AND EXISTS (
          SELECT 1
          FROM learner_attempt_error_tags t
          WHERE t.attempt_id=a.id AND t.is_initial=1
        )
      ORDER BY a.answered_at DESC, a.id DESC
    `, [learner.id]),
  ])

  const adviceByCode = new Map(LEARNER_ERROR_TAXONOMY.map(item => [item.code, item.advice]))
  const examples = new Map<LearnerErrorTypeCode, LearnerErrorProgressExample[]>()
  const exampleIds = new Set<string>()
  for (const row of exampleRows) {
    const question = jsonQuestion(row.questionJson)
    if (!question) continue
    const details = learnerErrorDetails(row.learnerAnswer, question)
    if (!details.length) continue
    const acceptedAnswers = [...(question.reponses || [])]
      .filter(Boolean)
      .slice(0, 12)
    const expectedAnswers = [...(question.reponsesPourCorrige?.length
      ? question.reponsesPourCorrige
      : question.reponses || [])]
      .filter(Boolean)
      .slice(0, 4)
    for (const detail of details) {
      const code = detail.code as LearnerErrorTypeCode
      const current = examples.get(code) || []
      const exampleKey = `${code}\u0000${row.id}`
      if (current.length >= 6 || exampleIds.has(exampleKey)) continue
      current.push({
        id: Number(row.id),
        question: question.consigne || [
          question.infinitif || question.titre,
          question.mode,
          question.temps,
          question.pronom || question.saisiePrefixe,
        ].filter(Boolean).join(' · '),
        learnerAnswer: row.learnerAnswer,
        acceptedAnswers,
        expectedAnswers,
        reason: learnerErrorDetailText(detail, locale)
          || adviceByCode.get(code)
          || 'Compare ta réponse avec la correction pour repérer cette différence.',
        errorDetail: detail,
      })
      exampleIds.add(exampleKey)
      examples.set(code, current)
    }
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
        challengeKey: row.challengeKey,
        opportunities: 0,
        errors: 0,
      }
      stat.opportunities += 1
      runStats.set(key, stat)
    }
  }
  for (const row of runErrors) {
    const question = jsonQuestion(row.questionJson)
    if (!question) continue
    for (const detail of learnerErrorDetails(row.learnerAnswer, question)) {
      const stat = runStats.get(`${row.runId}\u0000${detail.code as LearnerErrorTypeCode}`)
      if (stat) stat.errors = Math.min(stat.opportunities, stat.errors + 1)
    }
  }

  return buildLearnerErrorProgress([...runStats.values()].map((row): LearnerErrorProgressDailySource => ({
    code: row.code,
    statDate: row.statDate,
    sequence: row.sequence,
    challengeKey: row.challengeKey,
    opportunities: row.opportunities,
    errors: row.errors,
  })), undefined, examples)
})
