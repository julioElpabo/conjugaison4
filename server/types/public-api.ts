import type {
  ChallengeConfig,
  ComplementPlacement,
  ExerciseKind,
  ExerciseQuestion as SharedExerciseQuestion,
  PastSimplePronouns
} from '../../shared/types/conjugation'

export type { ComplementPlacement, ExerciseKind, PastSimplePronouns }

export type QuestionnaireRequest = ChallengeConfig

export interface ChallengePrintOptions {
  title: string
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
