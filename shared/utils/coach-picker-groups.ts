import { COACH_HELP_ENGINE_KEYS, type CoachHelpEngineKey, type CoachProfile } from '../types/coach'
import { coachHelpProfile } from '../data/coach-help-profiles'

export interface CoachPickerGroup {
  approach: CoachHelpEngineKey
  label: string
  description: string
  coaches: CoachProfile[]
}

/** Regroupe les coaches par type d'aide, dans l'ordre commun des approches. */
export function coachPickerGroups(coaches: readonly CoachProfile[]): CoachPickerGroup[] {
  const groups = new Map<CoachHelpEngineKey, CoachProfile[]>()
  for (const coach of coaches) {
    const items = groups.get(coach.helpApproach) || []
    items.push(coach)
    groups.set(coach.helpApproach, items)
  }

  return COACH_HELP_ENGINE_KEYS.flatMap((approach) => {
    const items = groups.get(approach)
    if (!items?.length) return []
    const profile = coachHelpProfile(approach)
    return [{
      approach,
      label: profile.label,
      description: profile.description,
      coaches: [...items].sort((left, right) => left.sortOrder - right.sortOrder || left.firstName.localeCompare(right.firstName, 'fr') || left.id - right.id),
    }]
  })
}
