import type { CoachEvent } from '../types/coach'

export const CHAT_BUBBLE_DELAY_MS = 1_000
export const CHAT_CORRECT_DELAY_MS = 1_000
export const CHAT_INCORRECT_DELAY_MS = 3_000
export const COACH_STREAK_LENGTH = 3

const INCORRECT_REACTION_EVENTS = new Set<CoachEvent>(['incorrect', 'cod-before', 'cod-after', 'coi', 'encouragement'])

export function chatReactionAllowsMedia(eventType: CoachEvent, cooledDown: boolean, hasIncorrectMedia: boolean) {
  if (!cooledDown || eventType === 'encouragement') return false
  return !INCORRECT_REACTION_EVENTS.has(eventType) || hasIncorrectMedia
}

export type CoachTurnStep =
  | { kind: 'reaction', eventType: CoachEvent }
  | { kind: 'instruction' }
  | { kind: 'delay', milliseconds: number }
  | { kind: 'next-question' }
  | { kind: 'finish' }

export function openingTurnPlan(): CoachTurnStep[] {
  return [
    { kind: 'reaction', eventType: 'introduction' },
    { kind: 'instruction' },
  ]
}

export function nextConsecutiveCorrectCount(currentCount: number, correct: boolean): number {
  return correct ? currentCount + 1 : 0
}

export function answerTurnPlan(options: {
  correct: boolean
  hasAlternative?: boolean
  streak?: boolean
  hasNext: boolean
  incorrectEvent?: Extract<CoachEvent, 'incorrect' | 'cod-before' | 'cod-after' | 'coi'>
}): CoachTurnStep[] {
  const steps: CoachTurnStep[] = [{
    kind: 'reaction',
    eventType: options.correct
      ? (options.hasAlternative ? 'correct-alternative' : 'correct')
      : options.incorrectEvent || 'incorrect',
  }]
  if (options.correct && options.streak) steps.push({ kind: 'reaction', eventType: 'streak' })
  if (!options.correct) steps.push({ kind: 'reaction', eventType: 'encouragement' })
  steps.push({
    kind: 'delay',
    milliseconds: options.correct ? CHAT_CORRECT_DELAY_MS : CHAT_INCORRECT_DELAY_MS,
  })
  steps.push(options.hasNext ? { kind: 'next-question' } : { kind: 'finish' })
  return steps
}
