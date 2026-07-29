import type { ResultSetHeader } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import {
  learnerChallengeFingerprint,
  learnerChallengeLabel,
  learnerChallengeSnapshot,
  learnerQuestionSnapshot,
  learnerRunIdentifier,
} from '../../../utils/learner-progress'
import { getLearnerSession } from '../../../utils/learner-session'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

interface QuestionPlanBody {
  runId?: unknown
  challengeFingerprint?: unknown
  challengeLabel?: unknown
  challenge?: unknown
  presentation?: unknown
  isReview?: unknown
  questionIndexOffset?: unknown
  questions?: unknown
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  const body = await readLimitedJsonBody<QuestionPlanBody>(event, 256 * 1024)
  const runId = learnerRunIdentifier(body.runId)
  const challenge = learnerChallengeSnapshot(body.challenge)
  const fingerprint = learnerChallengeFingerprint(challenge, body.challengeFingerprint)
  const label = learnerChallengeLabel(body.challengeLabel)
  const presentation = body.presentation === 'chat' ? 'chat' : 'classic'
  const questionIndexOffset = Math.min(1000, Math.max(0, Number(body.questionIndexOffset) || 0))
  if (!Array.isArray(body.questions) || !body.questions.length || body.questions.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Plan de questions invalide' })
  }
  const questions = body.questions.map(question => learnerQuestionSnapshot(question)) as ExerciseQuestion[]

  const database = useDatabase()
  const connection = await database.getConnection()
  try {
    await connection.beginTransaction()
    const [runResult] = await connection.execute<ResultSetHeader>(`
      INSERT INTO learner_challenge_runs
        (account_id, client_run_id, challenge_fingerprint, challenge_label,
         challenge_config_json, presentation, is_review)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),
        challenge_config_json=IF(
          learner_challenge_runs.is_review=1,
          VALUES(challenge_config_json),
          learner_challenge_runs.challenge_config_json
        )
    `, [
      learner.id,
      runId,
      fingerprint,
      label,
      JSON.stringify(challenge),
      presentation,
      body.isReview === true ? 1 : 0,
    ])
    await connection.query(`
      INSERT INTO learner_run_questions
        (run_id, question_index, question_json, result_status, attempt_number)
      VALUES ${questions.map(() => '(?, ?, ?, NULL, NULL)').join(', ')}
      ON DUPLICATE KEY UPDATE
        question_json=IF(result_status IS NULL, VALUES(question_json), question_json)
    `, questions.flatMap((question, index) => [
      runResult.insertId,
      questionIndexOffset + index,
      JSON.stringify(question),
    ]))
    await connection.commit()
    return { recorded: questions.length }
  }
  catch (error) {
    await connection.rollback().catch(() => {})
    throw error
  }
  finally {
    connection.release()
  }
})
