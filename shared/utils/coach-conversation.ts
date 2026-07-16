import type { CoachEvent } from '../types/coach'

export const CHAT_BUBBLE_DELAY_MS = 1_000
export const CHAT_NEXT_QUESTION_DELAY_MS = 3_000

export type CoachTurnStep =
  | { kind: 'reaction', eventType: CoachEvent }
  | { kind: 'instruction' }
  | { kind: 'alternative' }
  | { kind: 'delay', milliseconds: number }
  | { kind: 'next-question' }
  | { kind: 'finish' }

export function openingTurnPlan(): CoachTurnStep[] {
  return [
    { kind: 'reaction', eventType: 'introduction' },
    { kind: 'instruction' },
  ]
}

export function answerTurnPlan(options: {
  correct: boolean
  hasAlternative?: boolean
  streak?: boolean
  hasNext: boolean
}): CoachTurnStep[] {
  const steps: CoachTurnStep[] = [{
    kind: 'reaction',
    eventType: options.correct ? (options.hasAlternative ? 'correct-alternative' : 'correct') : 'incorrect',
  }]
  if (options.correct && options.hasAlternative) steps.push({ kind: 'alternative' })
  if (options.correct && options.streak) steps.push({ kind: 'reaction', eventType: 'streak' })
  steps.push({ kind: 'delay', milliseconds: CHAT_NEXT_QUESTION_DELAY_MS })
  steps.push(options.hasNext ? { kind: 'next-question' } : { kind: 'finish' })
  return steps
}
