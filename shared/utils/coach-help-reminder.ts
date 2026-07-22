export const CHAT_HELP_REMINDER_DELAY_MS = 30_000
export const CHAT_HELP_REMINDER_INCORRECT_COUNT = 3

export function nextConsecutiveIncorrectCount(current: number, isCorrect: boolean) {
  return isCorrect ? 0 : current + 1
}

export function coachHelpReminderMessage(helpOpen: boolean) {
  return helpOpen
    ? 'Tu peux regarder l’aide à droite pour trouver un indice.'
    : 'Si tu veux un indice, tape « Aide » dans le champ de réponse.'
}
