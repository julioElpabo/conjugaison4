import type { ChallengeConfig, SharedChallenge } from './useChallengeBuilder'
import type { ExerciseQuestion } from '~~/shared/types/conjugation'

export type { ExerciseQuestion }

export interface QuestionnaireRequest {
  verbIds: number[]
  tenseIds: number[]
  questionCount: number
  exerciseKind: ChallengeConfig['exerciseKind']
  identificationSource: ChallengeConfig['identificationSource']
  literaryRegister: NonNullable<ChallengeConfig['literaryRegister']>
  pastSimplePronouns: ChallengeConfig['pastSimplePronouns']
  inclusivePronouns: boolean
  includeOnPronoun: boolean
  learningSupportMode: ChallengeConfig['learningSupportMode']
  voiceMode: ChallengeConfig['voiceMode']
  includeComplements: boolean
  complementPlacement: ChallengeConfig['complementPlacement']
  complementOptions: ChallengeConfig['complementOptions']
}

export function toQuestionnaireRequest(challenge: ChallengeConfig): QuestionnaireRequest {
  return {
    verbIds: [...challenge.verbIds],
    tenseIds: [...challenge.tenseIds],
    questionCount: challenge.questionCount,
    exerciseKind: challenge.exerciseKind,
    identificationSource: challenge.identificationSource ?? 'selected-verbs',
    literaryRegister: challenge.literaryRegister ?? 'all',
    pastSimplePronouns: challenge.pastSimplePronouns,
    inclusivePronouns: challenge.inclusivePronouns,
    includeOnPronoun: challenge.includeOnPronoun,
    learningSupportMode: challenge.learningSupportMode,
    voiceMode: challenge.voiceMode,
    includeComplements: challenge.includeComplements,
    complementPlacement: challenge.complementPlacement,
    complementOptions: [...challenge.complementOptions]
  }
}

export function normalizeChallengeCode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length === 8) {
    return compact.match(/.{1,2}/g)?.join('-') ?? compact
  }
  return value.trim().toUpperCase()
}

export function toSharedChallengeRequest(challenge: ChallengeConfig, title?: string, description?: string) {
  return {
    version: 1 as const,
    ...(title === undefined ? {} : { title: title.trim() }),
    ...(description?.trim() ? { description: description.trim() } : {}),
    verbIds: [...challenge.verbIds],
    tenseIds: [...challenge.tenseIds],
    questionCount: challenge.questionCount,
    exerciseKind: challenge.exerciseKind,
    identificationSource: challenge.identificationSource ?? 'selected-verbs',
    literaryRegister: challenge.literaryRegister ?? 'all',
    pastSimplePronouns: challenge.pastSimplePronouns,
    inclusivePronouns: challenge.inclusivePronouns,
    includeOnPronoun: challenge.includeOnPronoun,
    learningSupportMode: challenge.learningSupportMode,
    voiceMode: challenge.voiceMode,
    includeComplements: challenge.includeComplements,
    complementPlacement: challenge.complementPlacement,
    complementOptions: [...challenge.complementOptions],
    printOptions: { ...challenge.printOptions },
  }
}

export function useChallengeApi() {
  async function generateQuestions(challenge: ChallengeConfig) {
    return await $fetch<ExerciseQuestion[]>('/api/questionnaires', {
      method: 'POST',
      body: toQuestionnaireRequest(challenge)
    })
  }

  async function saveChallenge(challenge: ChallengeConfig, title: string, description = '') {
    return await $fetch<{ code: string }>('/api/defis', {
      method: 'POST',
      body: toSharedChallengeRequest(challenge, title, description)
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
