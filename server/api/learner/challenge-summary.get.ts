import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import { normalizeLocale } from '~~/shared/i18n/locales'
import { learnerErrorDetails } from '~~/shared/utils/learner-error-diagnostics'
import { identificationFormParts } from '~~/shared/utils/identification-form'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface RunRow extends RowDataPacket {
  id: number
  challengeConfigJson: string
}

interface FormRow extends RowDataPacket {
  questionIndex: number
  questionJson: string
  isMastered: number
  learnerAnswer: string | null
}

function questionFromJson(source: string) {
  try {
    return JSON.parse(source) as ExerciseQuestion
  }
  catch {
    return null
  }
}

function exerciseKindFromJson(source: string) {
  try {
    const config = JSON.parse(source) as { exerciseKind?: unknown }
    return config.exerciseKind === 'tense-identification' || config.exerciseKind === 'mode-identification'
      ? config.exerciseKind
      : 'conjugation'
  }
  catch {
    return 'conjugation'
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const query = getQuery(event)
  const runId = Number.parseInt(String(query.runId || ''), 10)
  const locale = normalizeLocale(query.locale, 'fr')
  if (!Number.isSafeInteger(runId) || runId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Séance invalide' })
  }

  const database = useDatabase()
  const [[run]] = await database.execute<RunRow[]>(`
    SELECT id, challenge_config_json AS challengeConfigJson
    FROM learner_challenge_runs
    WHERE id=? AND account_id=? AND last_answered_at IS NOT NULL
    LIMIT 1
  `, [runId, learner.id])
  if (!run) throw createError({ statusCode: 404, statusMessage: 'Séance introuvable' })
  const exerciseKind = exerciseKindFromJson(run.challengeConfigJson)
  const isIdentificationExercise = exerciseKind === 'tense-identification' || exerciseKind === 'mode-identification'

  const [incorrectRows] = await database.execute<FormRow[]>(`
    SELECT a.question_index AS questionIndex,
           COALESCE(q.question_json, a.question_json) AS questionJson,
           0 AS isMastered,
           a.learner_answer AS learnerAnswer
    FROM learner_answer_attempts a
    LEFT JOIN learner_run_questions q
      ON q.run_id=a.run_id AND q.question_index=a.question_index
    WHERE a.run_id=? AND a.is_correct=0
      AND COALESCE(q.question_json, a.question_json) IS NOT NULL
    ORDER BY a.answered_at, a.id
  `, [runId])
  const [correctRows] = await database.execute<FormRow[]>(`
    SELECT f.question_index AS questionIndex,
           COALESCE(q.question_json, f.question_json) AS questionJson,
           1 AS isMastered,
           NULL AS learnerAnswer
    FROM learner_run_forms f
    LEFT JOIN learner_run_questions q
      ON q.run_id=f.run_id AND q.question_index=f.question_index
    WHERE f.run_id=? AND f.is_mastered=1
      AND COALESCE(q.question_json, f.question_json) IS NOT NULL
    ORDER BY f.question_index, f.id
  `, [runId])

  const verbs = new Set<string>()
  const tenses = new Map<string, { name: string, mode?: string }>()
  const answerSeparator = { fr: ' ou ', de: ' oder ', en: ' or ', it: ' o ', es: ' o ' }[locale]
  const items = [...incorrectRows, ...correctRows].flatMap((row, itemIndex) => {
    const question = questionFromJson(row.questionJson)
    if (!question) return []
    if (question.infinitif) verbs.add(question.infinitif)
    if (question.temps) {
      const key = `${question.mode || ''}\u0000${question.temps}`
      tenses.set(key, { name: question.temps, ...(question.mode ? { mode: question.mode } : {}) })
    }
    const expectedAnswer = question.reponsesPourCorrige.join(answerSeparator)
      || question.reponses.join(answerSeparator)
    const mastered = Boolean(row.isMastered)
    const learnerAnswer = mastered
      ? question.reponses[0] || expectedAnswer
      : row.learnerAnswer || ''
    const errorDetails = mastered || isIdentificationExercise ? [] : learnerErrorDetails(learnerAnswer, question)
    const identificationForm = !mastered && isIdentificationExercise
      ? identificationFormParts(question)
      : null
    return [{
      index: itemIndex + 1,
      status: mastered ? 'correct' as const : 'incorrect' as const,
      questionLabel: [
        question.infinitif || question.titre,
        question.mode,
        question.temps,
        question.pronom || question.saisiePrefixe,
      ].filter(Boolean).join(' · ') || question.consigne,
      learnerAnswer,
      expectedAnswer,
      acceptedAnswers: question.reponses,
      displayExpectedAnswers: question.reponsesPourCorrige.length
        ? question.reponsesPourCorrige
        : question.reponses,
      errorLabels: errorDetails.map(detail => detail.label),
      errorDetails,
      identificationForm,
      literaryCitation: !mastered ? question.literaryCitation : undefined,
      isIdentification: isIdentificationExercise,
    }]
  })

  return {
    items,
    verbs: [...verbs],
    tenses: [...tenses.values()],
  }
})
