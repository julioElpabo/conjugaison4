import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import {
  LEARNER_ERROR_TAXONOMY,
  learnerErrorDetails,
  learnerErrorDetailText,
  type LearnerErrorTypeCode,
} from '~~/shared/utils/learner-error-diagnostics'
import type { LearnerErrorProgressExample } from '~~/shared/utils/learner-error-progress'
import { normalizeLocale } from '../../../shared/i18n/locales'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

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
  const query = getQuery(event)
  const locale = normalizeLocale(query.locale, 'fr')
  const code = String(query.code || '') as LearnerErrorTypeCode
  const offset = Math.max(0, Math.min(5000, Number.parseInt(String(query.offset || 0), 10) || 0))
  const definition = LEARNER_ERROR_TAXONOMY.find(item => item.code === code)
  if (!definition) {
    throw createError({ statusCode: 400, statusMessage: 'Type d’erreur invalide' })
  }

  const database = useDatabase()
  const [rows] = await database.execute<ErrorExampleRow[]>(`
    SELECT DISTINCT a.id,
           a.learner_answer AS learnerAnswer,
           a.question_json AS questionJson
    FROM learner_answer_attempts a
    INNER JOIN learner_challenge_runs r ON r.id=a.run_id
    INNER JOIN learner_attempt_error_tags t ON t.attempt_id=a.id
    WHERE r.account_id=?
      AND t.is_initial=1
      AND t.error_type_code=?
    ORDER BY a.answered_at DESC, a.id DESC
    LIMIT ? OFFSET ?
  `, [learner.id, code, 6, offset])

  const examples = rows.slice(0, 5).flatMap((row): LearnerErrorProgressExample[] => {
    const question = jsonQuestion(row.questionJson)
    if (!question) return []
    const detail = learnerErrorDetails(row.learnerAnswer, question)
      .find(item => item.code === code)
    if (!detail) return []
    const acceptedAnswers = [...(question.reponses || [])].filter(Boolean).slice(0, 12)
    const expectedAnswers = [...(question.reponsesPourCorrige?.length
      ? question.reponsesPourCorrige
      : question.reponses || [])].filter(Boolean).slice(0, 4)
    return [{
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
        || definition.advice
        || 'Compare ta réponse avec la correction pour repérer cette différence.',
      errorDetail: detail,
    }]
  })

  return {
    examples,
    hasMore: rows.length > 5,
  }
})
