import type { AppLocale } from '../i18n/locales'

export interface ExerciseSummaryItem {
  index: number
  status: 'correct' | 'incorrect'
  questionLabel: string
  learnerAnswer: string
  expectedAnswer: string
  errorLabels: string[]
}

export interface ExerciseSummaryTense {
  name: string
  mode?: string
}

export interface ExerciseSummaryShareRequest {
  version: 1
  locale: AppLocale
  presentation: 'classic' | 'chat'
  items: ExerciseSummaryItem[]
  verbs: string[]
  tenses: ExerciseSummaryTense[]
}

export interface SharedExerciseSummary extends ExerciseSummaryShareRequest {
  score: number
  correctCount: number
  createdAt: string
}
