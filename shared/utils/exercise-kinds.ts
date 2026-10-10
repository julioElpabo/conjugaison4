import type { UiMessage } from '../i18n/ui-messages'
import type { AtomicExerciseKind, ExerciseKind, ExerciseQuestion } from '../types/conjugation'

export const SELECTABLE_EXERCISE_KINDS = ['conjugation', 'tense-identification', 'infinitive-identification'] as const

export function exerciseKindsFor(config: { exerciseKind?: ExerciseKind, exerciseKinds?: readonly AtomicExerciseKind[] }): AtomicExerciseKind[] {
  if (config.exerciseKinds) return [...config.exerciseKinds]
  return config.exerciseKind === 'mixed'
    ? ['conjugation', 'tense-identification']
    : [config.exerciseKind || 'conjugation']
}

export function exerciseKindFor(kinds: readonly AtomicExerciseKind[]): ExerciseKind {
  return kinds.length === 1 ? kinds[0]! : 'mixed'
}

/** Certains anciens historiques mixtes n’enregistraient pas le type par question. */
export function questionExerciseKind(question: Pick<ExerciseQuestion, 'exerciseKind' | 'instruction'> | undefined, fallback: ExerciseKind = 'conjugation'): AtomicExerciseKind {
  if (question?.exerciseKind) return question.exerciseKind
  if (fallback !== 'mixed') return fallback
  if (/^Quel est le mode et le temps/u.test(question?.instruction || '')) return 'tense-identification'
  if (/^Quel est le mode/u.test(question?.instruction || '')) return 'mode-identification'
  if (/^Quel est l[’']infinitif/u.test(question?.instruction || '')) return 'infinitive-identification'
  return 'conjugation'
}

export function exerciseKindsLabel(config: { exerciseKind?: ExerciseKind, exerciseKinds?: readonly AtomicExerciseKind[] }) {
  return exerciseKindsFor(config).map(exerciseKindLabel).join(' · ')
}

export function exerciseKindLabel(kind: AtomicExerciseKind): UiMessage {
  const labels: Record<AtomicExerciseKind, UiMessage> = {
    conjugation: 'Conjuguer',
    'tense-identification': 'Trouver le mode et le temps',
    'infinitive-identification': 'Trouver l’infinitif',
    'mode-identification': 'Trouver le mode',
  }
  return labels[kind]
}
