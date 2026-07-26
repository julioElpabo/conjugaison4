export const CHAT_HELP_REMINDER_DELAY_MS = 30_000
export const CHAT_HELP_REMINDER_INCORRECT_COUNT = 3

export function nextConsecutiveIncorrectCount(current: number, isCorrect: boolean) {
  return isCorrect ? 0 : current + 1
}
