import type {
  ChallengeConfig,
  ComplementOption,
  ComplementPlacement,
  ExerciseKind,
  ExerciseQuestion as SharedExerciseQuestion,
  PastSimplePronouns,
  VoiceMode
} from '../../shared/types/conjugation'

export type { ComplementOption, ComplementPlacement, ExerciseKind, PastSimplePronouns, VoiceMode }

export type QuestionnaireRequest = ChallengeConfig

export interface ChallengePrintOptions {
  title: string
  questionSpacingMm: number
  titleSpacingMm: number
  inclusiveDisplay: boolean
  showGrade: boolean
  showVerbs: boolean
  showTenses: boolean
  showFirstName: boolean
  showLastName: boolean
  showDate: boolean
  showRandomNumber: boolean
}

export interface DefiDefinition extends ChallengeConfig {
  version: 1
  title?: string
  description?: string
  printOptions: ChallengePrintOptions
}

export type ExerciseQuestion = SharedExerciseQuestion & {
  id: string
  verbeId: number
  tenseId: number
  personId: number | null
  reponses: string[]
  reponsesPourCorrige: string[]
}
