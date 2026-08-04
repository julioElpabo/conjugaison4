export const GUIDED_TOUR_COMPLETED_STORAGE_KEY = 'tatitotu-guided-tour-v1'
export const GUIDED_TOUR_REMINDER_STORAGE_KEY = 'tatitotu-guided-tour-reminder-v1'
export const GUIDED_TOUR_REMINDER_VISIT_COUNT = 10

export interface GuidedTourReminderState {
  visitsSincePostponement: number
  reminderShown: boolean
}

export function postponedGuidedTourState(): GuidedTourReminderState {
  return {
    visitsSincePostponement: 0,
    reminderShown: false,
  }
}

export function parseGuidedTourReminderState(value: string | null): GuidedTourReminderState | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<GuidedTourReminderState>
    if (typeof parsed.visitsSincePostponement !== 'number'
      || !Number.isInteger(parsed.visitsSincePostponement)
      || parsed.visitsSincePostponement < 0
      || typeof parsed.reminderShown !== 'boolean') return null
    return {
      visitsSincePostponement: Math.min(parsed.visitsSincePostponement, GUIDED_TOUR_REMINDER_VISIT_COUNT),
      reminderShown: parsed.reminderShown,
    }
  } catch {
    return null
  }
}

export function registerGuidedTourHomepageVisit(state: GuidedTourReminderState): GuidedTourReminderState {
  if (state.reminderShown) return state
  return {
    ...state,
    visitsSincePostponement: Math.min(
      state.visitsSincePostponement + 1,
      GUIDED_TOUR_REMINDER_VISIT_COUNT,
    ),
  }
}

export function shouldRemindAboutGuidedTour(state: GuidedTourReminderState): boolean {
  return !state.reminderShown && state.visitsSincePostponement >= GUIDED_TOUR_REMINDER_VISIT_COUNT
}
