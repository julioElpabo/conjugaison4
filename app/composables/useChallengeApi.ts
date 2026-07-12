import type { ChallengeConfig, SharedChallenge } from './useChallengeBuilder'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'

export type { ExerciseQuestion }

export interface QuestionnaireRequest {
  verbIds: number[]
  tenseIds: number[]
  questionCount: number
  exerciseKind: ChallengeConfig['exerciseKind']
  pastSimplePronouns: ChallengeConfig['pastSimplePronouns']
  inclusivePronouns: boolean
}

export function toQuestionnaireRequest(challenge: ChallengeConfig): QuestionnaireRequest {
  return {
    verbIds: [...challenge.verbIds],
    tenseIds: [...challenge.tenseIds],
    questionCount: challenge.questionCount,
    exerciseKind: challenge.exerciseKind,
    pastSimplePronouns: challenge.pastSimplePronouns,
    inclusivePronouns: challenge.inclusivePronouns
  }
}

export function normalizeChallengeCode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length === 8) {
    return compact.match(/.{1,2}/g)?.join('-') ?? compact
  }
  return value.trim().toUpperCase()
}

export function useChallengeApi() {
  async function generateQuestions(challenge: ChallengeConfig) {
    return await $fetch<ExerciseQuestion[]>('/api/questionnaires', {
      method: 'POST',
      body: toQuestionnaireRequest(challenge)
    })
  }

  async function saveChallenge(challenge: ChallengeConfig) {
    return await $fetch<{ code: string }>('/api/defis', {
      method: 'POST',
      body: {
        verbIds: [...challenge.verbIds],
        tenseIds: [...challenge.tenseIds],
        questionCount: challenge.questionCount,
        exerciseKind: challenge.exerciseKind,
        pastSimplePronouns: challenge.pastSimplePronouns,
        inclusivePronouns: challenge.inclusivePronouns,
        printOptions: { ...challenge.printOptions }
      }
    })
  }

  async function loadChallenge(rawCode: string) {
    const code = normalizeChallengeCode(rawCode)
    return await $fetch<SharedChallenge>(`/api/defis/${encodeURIComponent(code)}`)
  }

  return {
    generateQuestions,
    saveChallenge,
    loadChallenge
  }
}
