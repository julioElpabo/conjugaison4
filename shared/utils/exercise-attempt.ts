import type { ExerciseQuestion } from '../types/conjugation'
import { validateAnswer, validateConjugationAnswer } from './answer'

export function evaluateExerciseAnswer(
  answer: string,
  question: Pick<ExerciseQuestion, 'reponses' | 'pronom' | 'mode'>,
  retryAlreadyOffered: boolean,
  requireSubjectPronoun = false,
) {
  const result = requireSubjectPronoun
    ? validateConjugationAnswer(answer, question)
    : validateAnswer(answer, question.reponses)
  return {
    result,
    shouldRetry: !result.isCorrect && !retryAlreadyOffered,
  }
}
