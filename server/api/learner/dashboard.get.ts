import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion, LearnerChallengeSnapshot } from '~~/shared/types/conjugation'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface RunRow extends RowDataPacket {
  id: number
  clientRunId: string
  fingerprint: string
  label: string
  configJson: string
  presentation: string
  isReview: number
  startedAt: Date
  lastAnsweredAt: Date | null
  completedAt: Date | null
  correctCount: number
  incorrectCount: number
}

interface FormRow extends RowDataPacket {
  runId: number
  fingerprint: string
  formKey: string
  questionJson: string | null
  lastAnsweredAt: Date
}

interface RunQuestionRow extends RowDataPacket {
  runId: number
  questionIndex: number
  questionJson: string
  resultStatus: 'correct' | 'incorrect' | null
  attemptNumber: number | null
}

function json<T>(source: string, fallback: T): T {
  try {
    return JSON.parse(source) as T
  }
  catch {
    return fallback
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const query = getQuery(event)
  const offset = Math.min(10_000, Math.max(0, Number(query.offset) || 0))
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 6))
  const database = useDatabase()
  const [runs] = await database.execute<RunRow[]>(`
    SELECT r.id, r.client_run_id AS clientRunId,
           r.challenge_fingerprint AS fingerprint, r.challenge_label AS label,
           r.challenge_config_json AS configJson, r.presentation, r.is_review AS isReview,
           r.started_at AS startedAt, r.last_answered_at AS lastAnsweredAt,
           r.completed_at AS completedAt, r.correct_count AS correctCount,
           r.incorrect_count AS incorrectCount
    FROM learner_challenge_runs r
    WHERE r.account_id=? AND r.last_answered_at IS NOT NULL
    ORDER BY r.last_answered_at DESC, r.id DESC
    LIMIT ${limit + 1} OFFSET ${offset}
  `, [learner.id])
  const pageRuns = runs.slice(0, limit)
  const pageRunIds = pageRuns.map(run => Number(run.id))
  const pageFingerprints = [...new Set(pageRuns.map(run => run.fingerprint).filter(Boolean))]
  const forms = pageRunIds.length
    ? (await database.execute<FormRow[]>(`
    SELECT r.id AS runId, r.challenge_fingerprint AS fingerprint, f.form_key AS formKey,
           f.question_json AS questionJson, f.last_answered_at AS lastAnsweredAt
    FROM learner_run_forms f
    INNER JOIN learner_challenge_runs r ON r.id=f.run_id
    WHERE r.account_id=?
      AND r.id IN (${pageRunIds.map(() => '?').join(', ')})
      AND f.question_json IS NOT NULL
      AND f.incorrect_count > 0
    ORDER BY f.last_answered_at DESC, f.id DESC
    LIMIT 5000
  `, [learner.id, ...pageRunIds]))[0]
    : []
  const allChallengeForms = pageFingerprints.length
    ? (await database.execute<FormRow[]>(`
    SELECT r.id AS runId, r.challenge_fingerprint AS fingerprint, f.form_key AS formKey,
           f.question_json AS questionJson, f.last_answered_at AS lastAnsweredAt
    FROM learner_run_forms f
    INNER JOIN learner_challenge_runs r ON r.id=f.run_id
    WHERE r.account_id=?
      AND r.challenge_fingerprint IN (${pageFingerprints.map(() => '?').join(', ')})
      AND f.question_json IS NOT NULL
      AND f.incorrect_count > 0
    ORDER BY f.last_answered_at DESC, f.id DESC
    LIMIT 5000
  `, [learner.id, ...pageFingerprints]))[0]
    : []
  const runQuestions = pageRunIds.length
    ? (await database.execute<RunQuestionRow[]>(`
    SELECT q.run_id AS runId, q.question_index AS questionIndex,
           q.question_json AS questionJson, q.result_status AS resultStatus,
           q.attempt_number AS attemptNumber
    FROM learner_run_questions q
    WHERE q.run_id IN (${pageRunIds.map(() => '?').join(', ')})
    ORDER BY q.run_id, q.question_index
  `, pageRunIds))[0]
    : []
  const questionsByRun = new Map<number, ExerciseQuestion[]>()
  const plannedQuestionCountByRun = new Map<number, number>()
  const answeredQuestionIndexesByRun = new Map<number, number[]>()
  const questionResultsByRun = new Map<number, Array<{
    index: number
    status: 'correct' | 'incorrect'
    attemptNumber: 1 | 2
  }>>()
  for (const row of runQuestions) {
    const question = json<ExerciseQuestion | null>(row.questionJson, null)
    if (!question) continue
    const runId = Number(row.runId)
    const questions = questionsByRun.get(runId) || []
    questions.push(question)
    questionsByRun.set(runId, questions)
    plannedQuestionCountByRun.set(
      runId,
      Math.max(plannedQuestionCountByRun.get(runId) || 0, Number(row.questionIndex) + 1),
    )
    if (row.resultStatus === 'correct' || row.resultStatus === 'incorrect') {
      const answeredIndexes = answeredQuestionIndexesByRun.get(runId) || []
      answeredIndexes.push(Number(row.questionIndex))
      answeredQuestionIndexesByRun.set(runId, answeredIndexes)
      const results = questionResultsByRun.get(runId) || []
      results.push({
        index: Number(row.questionIndex),
        status: row.resultStatus,
        attemptNumber: Number(row.attemptNumber) === 2 ? 2 : 1,
      })
      questionResultsByRun.set(runId, results)
    }
  }

  const latestForms = new Map<number, Map<string, FormRow>>()
  for (const form of forms) {
    const runId = Number(form.runId)
    const challengeForms = latestForms.get(runId) || new Map<string, FormRow>()
    if (!challengeForms.has(form.formKey)) challengeForms.set(form.formKey, form)
    latestForms.set(runId, challengeForms)
  }
  const latestFormsByChallenge = new Map<string, Map<string, FormRow>>()
  for (const form of allChallengeForms) {
    const challengeForms = latestFormsByChallenge.get(form.fingerprint) || new Map<string, FormRow>()
    if (!challengeForms.has(form.formKey)) challengeForms.set(form.formKey, form)
    latestFormsByChallenge.set(form.fingerprint, challengeForms)
  }

  const challenges = []
  for (const run of pageRuns) {
    const storedChallenge = json<LearnerChallengeSnapshot>(run.configJson, {
      verbIds: [],
      tenseIds: [],
      questionCount: 1,
      exerciseKind: 'conjugation',
    })
    const plannedQuestionCount = plannedQuestionCountByRun.get(Number(run.id)) || 0
    const challenge = Boolean(run.isReview) && plannedQuestionCount
      ? { ...storedChallenge, questionCount: plannedQuestionCount }
      : storedChallenge
    const forms = [...(latestForms.get(Number(run.id))?.values() || [])]
    const retryQuestions = forms
      .filter(form => form.questionJson)
      .map(form => json<ExerciseQuestion | null>(form.questionJson || '', null))
      .filter((question): question is ExerciseQuestion => Boolean(question))
      .slice(0, 100)
    const allRetryQuestions = [...(latestFormsByChallenge.get(run.fingerprint)?.values() || [])]
      .filter(form => form.questionJson)
      .map(form => json<ExerciseQuestion | null>(form.questionJson || '', null))
      .filter((question): question is ExerciseQuestion => Boolean(question))
      .slice(0, 100)
    const total = Number(run.correctCount) + Number(run.incorrectCount)
    const answeredQuestionIndexes = answeredQuestionIndexesByRun.get(Number(run.id)) || []
    const answeredQuestionIndexSet = new Set(answeredQuestionIndexes)
    const isComplete = Array.from(
      { length: challenge.questionCount },
      (_, index) => index,
    ).every(index => answeredQuestionIndexSet.has(index))
    challenges.push({
      id: Number(run.id),
      clientRunId: run.clientRunId,
      fingerprint: run.fingerprint,
      label: run.label,
      description: challenge.description || '',
      challenge,
      presentation: run.presentation,
      isReview: Boolean(run.isReview),
      lastActivityAt: run.lastAnsweredAt,
      completedAt: isComplete ? (run.completedAt || run.lastAnsweredAt) : null,
      correctCount: Number(run.correctCount),
      incorrectCount: Number(run.incorrectCount),
      scorePercent: total ? Math.round(Number(run.correctCount) / total * 100) : 0,
      unresolvedCount: retryQuestions.length,
      retryQuestions,
      allUnresolvedCount: allRetryQuestions.length,
      allRetryQuestions,
      exactQuestions: questionsByRun.get(Number(run.id)) || [],
      answeredQuestionIndexes,
      questionResults: questionResultsByRun.get(Number(run.id)) || [],
    })
  }
  const nextOffset = offset + challenges.length
  return {
    challenges,
    nextOffset,
    hasMore: runs.length > limit,
  }
})
