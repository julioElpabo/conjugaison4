import { createHash } from 'node:crypto'
import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion, LearnerChallengeSnapshot } from '~~/shared/types/conjugation'
import { buildChallengeProgress, challengeAchievement } from '~~/shared/utils/challenge-progress'
import {
  learnerErrorDetails,
  learnerErrorDetailText,
} from '~~/shared/utils/learner-error-diagnostics'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'
import { normalizeLocale } from '../../../shared/i18n/locales'

interface RunRow extends RowDataPacket {
  id: number
  occurredAt: Date
  correctCount: number
  incorrectCount: number
  configJson: string
}

interface ErrorAttemptRow extends RowDataPacket {
  id: number
  runId: number
  infinitive: string
  tense: string
  mode: string
  learnerAnswer: string
  questionJson: string
  answeredAt: Date
}

interface RunQuestionRow extends RowDataPacket {
  runId: number
  questionJson: string
}

const FINGERPRINT = /^[a-f0-9]{64}$/u
const SWISS_DAY = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Europe/Zurich',
})

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
  const locale = normalizeLocale(getQuery(event).locale, 'fr')
  const fingerprint = typeof getQuery(event).fingerprint === 'string'
    ? String(getQuery(event).fingerprint).trim()
    : ''
  if (!FINGERPRINT.test(fingerprint)) {
    throw createError({ statusCode: 400, statusMessage: 'Défi invalide' })
  }

  const database = useDatabase()
  const [rows] = await database.execute<RunRow[]>(`
    SELECT id, COALESCE(completed_at, last_answered_at) AS occurredAt,
           correct_count AS correctCount,
           incorrect_count AS incorrectCount,
           challenge_config_json AS configJson
    FROM learner_challenge_runs
    WHERE account_id=? AND challenge_fingerprint=?
      AND is_review=0 AND last_answered_at IS NOT NULL
      AND (correct_count + incorrect_count) > 0
    ORDER BY COALESCE(completed_at, last_answered_at) ASC, id ASC
    LIMIT 200
  `, [learner.id, fingerprint])

  const runIds = rows.map(row => Number(row.id))
  const questionRows = runIds.length
    ? (await database.execute<RunQuestionRow[]>(`
      SELECT run_id AS runId, question_json AS questionJson
      FROM learner_run_questions
      WHERE run_id IN (${runIds.map(() => '?').join(', ')})
      ORDER BY run_id ASC, question_index ASC
    `, runIds))[0]
    : []
  const errorRows = runIds.length
    ? (await database.execute<ErrorAttemptRow[]>(`
      SELECT a.id, a.run_id AS runId, a.infinitive,
             a.tense_label AS tense, a.mode_label AS mode,
             a.learner_answer AS learnerAnswer,
             a.question_json AS questionJson, a.answered_at AS answeredAt
      FROM learner_answer_attempts a
      INNER JOIN learner_challenge_runs r ON r.id=a.run_id
      WHERE r.account_id=? AND r.challenge_fingerprint=?
        AND r.is_review=0 AND a.is_correct=0
        AND a.run_id IN (${runIds.map(() => '?').join(', ')})
      ORDER BY a.answered_at ASC, a.id ASC
      LIMIT 5000
    `, [learner.id, fingerprint, ...runIds]))[0]
    : []
  const errorsByRun = new Map<number, Array<{
    id: number
    answeredAt: Date
    infinitive: string
    tense: string
    mode: string
    person: string
    learnerAnswer: string
    expectedAnswers: readonly string[]
    question: ExerciseQuestion | null
    explanations: string[]
  }>>()
  for (const row of errorRows) {
    const question = questionFromJson(row.questionJson)
    const errors = errorsByRun.get(Number(row.runId)) || []
    errors.push({
      id: Number(row.id),
      answeredAt: row.answeredAt,
      infinitive: row.infinitive || question?.infinitif || question?.titre || '',
      tense: row.tense || question?.temps || '',
      mode: row.mode || question?.mode || '',
      person: question?.pronom || question?.saisiePrefixe || '',
      learnerAnswer: row.learnerAnswer,
      expectedAnswers: question?.reponsesPourCorrige?.length
        ? question.reponsesPourCorrige
        : question?.reponses || [],
      question,
      explanations: question
        ? learnerErrorDetails(row.learnerAnswer, question).map(detail => learnerErrorDetailText(detail, locale))
        : [],
    })
    errorsByRun.set(Number(row.runId), errors)
  }

  const snapshots = new Map<number, LearnerChallengeSnapshot>()
  const sessionTitles = new Map<number, string>()
  for (const row of rows) {
    try {
      const snapshot = JSON.parse(row.configJson) as LearnerChallengeSnapshot
      snapshots.set(Number(row.id), snapshot)
      sessionTitles.set(Number(row.id), snapshot.trainingReportTitle || '')
    }
    catch {
      sessionTitles.set(Number(row.id), '')
    }
  }
  const questionKeysByRun = new Map<number, Set<string>>()
  for (const row of questionRows) {
    const runId = Number(row.runId)
    const snapshot = snapshots.get(runId)
    if (!snapshot || !questionFromJson(row.questionJson)) continue
    const keys = questionKeysByRun.get(runId) || new Set<string>()
    keys.add(createHash('sha256').update(row.questionJson).digest('hex'))
    questionKeysByRun.set(runId, keys)
  }
  const summary = buildChallengeProgress(rows.map(row => {
    const runId = Number(row.id)
    const questionKeys = [...(questionKeysByRun.get(runId) || [])].sort()
    const targeted = Boolean(sessionTitles.get(runId))
    return {
      ...row,
      groupKey: targeted && questionKeys.length
        ? `${SWISS_DAY.format(new Date(row.occurredAt))}|${questionKeys.join(',')}`
        : '',
    }
  }))
  const latestRun = rows.at(-1)
  let challenge: LearnerChallengeSnapshot | null = null
  try {
    challenge = latestRun ? JSON.parse(latestRun.configJson) as LearnerChallengeSnapshot : null
  }
  catch {
    challenge = null
  }
  const achievement = challengeAchievement(rows.map(row => {
    const runId = Number(row.id)
    return {
      correctCount: Number(row.correctCount),
      incorrectCount: Number(row.incorrectCount),
      answeredQuestionCount: questionKeysByRun.get(runId)?.size || 0,
      expectedQuestionCount: snapshots.get(runId)?.questionCount || 0,
    }
  }))
  const answeredQuestionCount = (runIds: readonly number[]) => {
    const questionKeys = new Set<string>()
    for (const runId of runIds) {
      for (const key of questionKeysByRun.get(runId) || []) questionKeys.add(key)
    }
    return questionKeys.size
  }
  const bestPoint = [...summary.points].sort((left, right) =>
    right.successPercent - left.successPercent
    || answeredQuestionCount(right.runIds) - answeredQuestionCount(left.runIds)
    || new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  )[0]
  return {
    ...summary,
    challenge,
    achievement: {
      ...achievement,
      bestSuccessPercent: bestPoint?.successPercent || 0,
      bestAnsweredQuestionCount: bestPoint ? answeredQuestionCount(bestPoint.runIds) : 0,
    },
    sessions: summary.points.map(point => ({
      ...point,
      title: sessionTitles.get(point.id) || '',
      errors: point.runIds.flatMap(runId => errorsByRun.get(runId) || []),
    })),
  }
})
