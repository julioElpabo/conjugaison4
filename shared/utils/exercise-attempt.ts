import { validateAnswer } from './answer'

export function evaluateExerciseAnswer(
  answer: string,
  expectedAnswers: readonly string[],
  retryAlreadyOffered: boolean,
) {
  const result = validateAnswer(answer, expectedAnswers)
  return {
    result,
    shouldRetry: !result.isCorrect && !retryAlreadyOffered,
  }
}
