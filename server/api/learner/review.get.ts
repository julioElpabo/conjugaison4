import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import { buildLearnerReview } from '~~/shared/utils/learner-review'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface AttemptRow extends RowDataPacket {
  formKey: string
  infinitive: string
  mode: string
  tense: string
  learnerAnswer: string
  questionJson: string
  answeredAt: Date
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
  const [rows] = await database.execute<AttemptRow[]>(`
    SELECT a.form_key AS formKey, a.infinitive, a.mode_label AS mode,
           a.tense_label AS tense, a.learner_answer AS learnerAnswer,
           a.question_json AS questionJson, a.answered_at AS answeredAt
    FROM learner_answer_attempts a
    INNER JOIN learner_challenge_runs r ON r.id=a.run_id
    WHERE r.account_id=? AND a.is_correct=0
    ORDER BY a.answered_at DESC, a.id DESC
    LIMIT 5000
  `, [learner.id])

  return buildLearnerReview(rows.map((row) => {
    const question = questionFromJson(row.questionJson)
    return {
      formKey: row.formKey,
      infinitive: row.infinitive || question?.infinitif || question?.titre || '',
      mode: row.mode || question?.mode || '',
      tense: row.tense || question?.temps || '',
      person: question?.pronom || question?.saisiePrefixe || '',
      learnerAnswer: row.learnerAnswer,
      expectedAnswers: question?.reponsesPourCorrige?.length
        ? question.reponsesPourCorrige
        : question?.reponses || [],
      answeredAt: row.answeredAt,
    }
  }))
})
