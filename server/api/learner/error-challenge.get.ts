import type { RowDataPacket } from 'mysql2/promise'
import type {
  ChallengeConfig,
  ComplementOption,
  ExerciseQuestion,
  LearnerChallengeSnapshot,
} from '~~/shared/types/conjugation'
import {
  applicableLearnerErrorTypes,
  diagnoseLearnerError,
  LEARNER_ERROR_TAXONOMY,
  type LearnerErrorTypeCode,
} from '~~/shared/utils/learner-error-diagnostics'
import { generateQuestionnaire } from '../../services/questionnaire'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface ErrorSourceRow extends RowDataPacket {
  challengeJson: string
  questionJson: string
  learnerAnswer: string
}

interface TenseRow extends RowDataPacket {
  id: number
  name: string
  mode: string
  isCompound: number
}

function parsed<T>(source: string) {
  try {
    return JSON.parse(source) as T
  }
  catch {
    return null
  }
}

function optionsForError(code: LearnerErrorTypeCode, existing: ComplementOption[]) {
  if (code === 'agreement.cod_before') return ['cod-before'] satisfies ComplementOption[]
  if (code === 'agreement.cod_after') return ['cod-after'] satisfies ComplementOption[]
  if (code === 'agreement.coi') return ['coi-before'] satisfies ComplementOption[]
  if (code === 'orthography.copied_complement') {
    return ['cod-after', 'coi-after'] satisfies ComplementOption[]
  }
  return existing
}

function shuffled<T>(values: readonly T[]) {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other]!, result[index]!]
  }
  return result
}

function questionKey(question: ExerciseQuestion) {
  return [
    question.verbeId,
    question.tenseId,
    question.personId,
    question.complementPosition,
    question.complementFunction,
    question.complement,
    question.consigne,
  ].join('\u0000')
}

function normalized(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLocaleLowerCase('fr')
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const code = String(getQuery(event).code || '') as LearnerErrorTypeCode
  if (!LEARNER_ERROR_TAXONOMY.some(item => item.code === code)) {
    throw createError({ statusCode: 400, statusMessage: 'Type d’erreur invalide' })
  }
  if (code === 'morphology.ending' || code === 'person.other_form') {
    throw createError({
      statusCode: 422,
      statusMessage: 'Ce type d’erreur ne permet pas de créer un défi ciblé',
    })
  }

  const database = useDatabase()
  const [rows] = await database.execute<ErrorSourceRow[]>(`
    SELECT r.challenge_config_json AS challengeJson,
           a.question_json AS questionJson,
           a.learner_answer AS learnerAnswer
    FROM learner_answer_attempts a
    INNER JOIN learner_challenge_runs r ON r.id=a.run_id
    WHERE r.account_id=?
      AND a.is_correct=0
    ORDER BY a.answered_at DESC, a.id DESC
  `, [learner.id])

  const sourceQuestions: ExerciseQuestion[] = []
  const verbIds = new Set<number>()
  const tenseIds = new Set<number>()
  const complementOptions = new Set<ComplementOption>()
  const confusedTenses = new Map<string, { tense: string, mode?: string }>()
  let pastSimplePronouns: LearnerChallengeSnapshot['pastSimplePronouns'] = 'third-person-only'
  let inclusivePronouns = false
  let includeOnPronoun = false
  const voiceModes = new Set<'active' | 'passive'>()
  let includeComplements = false

  for (const row of rows) {
    const challenge = parsed<LearnerChallengeSnapshot>(row.challengeJson)
    const question = parsed<ExerciseQuestion>(row.questionJson)
    if (!question) continue
    const diagnostic = diagnoseLearnerError(row.learnerAnswer, question)
      .find(item => item.code === code)
    if (!diagnostic) continue
    const evidence = diagnostic.evidence || {}
    for (const id of challenge?.verbIds || []) verbIds.add(Number(id))
    for (const id of challenge?.tenseIds || []) tenseIds.add(Number(id))
    for (const option of challenge?.complementOptions || []) complementOptions.add(option)
    if (challenge?.pastSimplePronouns === 'all') pastSimplePronouns = 'all'
    if (challenge?.inclusivePronouns) inclusivePronouns = true
    if (challenge?.includeOnPronoun) includeOnPronoun = true
    if (challenge?.voiceMode === 'passive') voiceModes.add('passive')
    else if (challenge?.voiceMode === 'mixed') {
      voiceModes.add('active')
      voiceModes.add('passive')
    } else voiceModes.add(question.voice === 'passive' ? 'passive' : 'active')
    if (challenge?.includeComplements) includeComplements = true
    if (applicableLearnerErrorTypes(question).includes(code)) {
      sourceQuestions.push(question)
      if (question.verbeId) verbIds.add(Number(question.verbeId))
      if (question.tenseId) tenseIds.add(Number(question.tenseId))
      if (code === 'task.wrong_tense') {
        const expectedTense = evidence.expectedTense || question.temps || ''
        const expectedMode = question.mode || ''
        if (expectedTense) {
          confusedTenses.set(
            `${normalized(expectedMode)}\u0000${normalized(expectedTense)}`,
            { tense: expectedTense, ...(expectedMode ? { mode: expectedMode } : {}) },
          )
        }
        const detectedTense = evidence.detectedTense || ''
        const detectedMode = question.conjugationConfusions
          ?.find(confusion => normalized(confusion.tense) === normalized(detectedTense))
          ?.mode || ''
        if (detectedTense) {
          confusedTenses.set(
            `${normalized(detectedMode)}\u0000${normalized(detectedTense)}`,
            { tense: detectedTense, ...(detectedMode ? { mode: detectedMode } : {}) },
          )
        }
      }
    }
  }

  if (!sourceQuestions.length || !verbIds.size || !tenseIds.size) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Pas assez de questions pour entraîner ce type d’erreur',
    })
  }

  const [availableTenses] = await database.execute<TenseRow[]>(`
    SELECT t.id, t.name, modes.name AS mode,
           t.isTempsCompose AS isCompound
    FROM temps t
    INNER JOIN modes ON modes.id=t.mode_id
  `)
  const selectedTenseIds = code === 'agreement.subject'
    ? availableTenses
        .filter(tense => tenseIds.has(Number(tense.id)) && Boolean(tense.isCompound))
        .map(tense => Number(tense.id))
    : code === 'task.wrong_tense'
      ? availableTenses
          .filter(tense => [...confusedTenses.values()].some(confusion => (
            normalized(confusion.tense) === normalized(tense.name)
            && (!confusion.mode || normalized(confusion.mode) === normalized(tense.mode))
          )))
          .map(tense => Number(tense.id))
      : [...tenseIds]
  if (!selectedTenseIds.length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Aucun temps adapté à ce type d’erreur',
    })
  }

  const targetedOptions = optionsForError(code, [...complementOptions])
  const challenge: ChallengeConfig = {
    verbIds: [...verbIds],
    tenseIds: selectedTenseIds,
    questionCount: 10,
    exerciseKind: 'conjugation',
    identificationSource: 'selected-verbs',
    pastSimplePronouns,
    inclusivePronouns,
    includeOnPronoun,
    voiceMode: voiceModes.size > 1 ? 'mixed' : voiceModes.has('passive') ? 'passive' : 'active',
    includeComplements: includeComplements || targetedOptions.length > 0,
    complementPlacement: targetedOptions.some(option => option.endsWith('-before'))
      ? targetedOptions.some(option => option.endsWith('-after')) ? 'mixed' : 'before'
      : 'after',
    complementOptions: targetedOptions,
  }

  let generated: ExerciseQuestion[] = []
  try {
    generated = await generateQuestionnaire({ ...challenge, questionCount: 100 })
  }
  catch {
    // Les questions réellement rencontrées restent un repli pédagogique sûr.
  }
  const candidates = shuffled([...sourceQuestions, ...generated])
    .filter(question => applicableLearnerErrorTypes(question).includes(code))
  const unique = [...new Map(candidates.map(question => [questionKey(question), question])).values()]
  if (!unique.length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Aucune question adaptée à ce type d’erreur',
    })
  }
  const questions = Array.from({ length: 10 }, (_, index) => ({
    ...unique[index % unique.length]!,
    id: `error-${code.replaceAll('.', '-')}-${index + 1}`,
  }))

  return { challenge, questions }
})
