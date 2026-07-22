import { COACH_HELP_ENGINE_KEYS, type CoachHelpEngineKey, type CoachProfile } from '../types/coach'
import { coachHelpProfile } from '../data/coach-help-profiles'

export interface CoachPickerGroup {
  id: string
  approach: CoachHelpEngineKey
  label: string
  description: string
  coaches: CoachProfile[]
}

function smallestOrder(items: readonly CoachProfile[], key: 'caractereSortOrder' | 'helpApproachSortOrder') {
  const orders = items.map(item => item[key]).filter((value): value is number => Number.isFinite(value))
  return orders.length ? Math.min(...orders) : undefined
}

/** Regroupe les coaches par type d'aide, dans l'ordre commun des approches. */
export function coachPickerGroups(coaches: readonly CoachProfile[]): CoachPickerGroup[] {
  const groups = new Map<string, CoachProfile[]>()
  const defaultOrder = new Map(COACH_HELP_ENGINE_KEYS.map((approach, index) => [approach, index]))
  for (const coach of coaches) {
    const groupId = coach.helpApproachId ? `id:${coach.helpApproachId}` : `engine:${coach.helpApproach}`
    const items = groups.get(groupId) || []
    items.push(coach)
    groups.set(groupId, items)
  }

  return [...groups.entries()]
    .sort(([, leftItems], [, rightItems]) => {
      const leftApproach = leftItems[0]?.helpApproach
      const rightApproach = rightItems[0]?.helpApproach
      const leftOrder = smallestOrder(leftItems, 'caractereSortOrder')
        ?? smallestOrder(leftItems, 'helpApproachSortOrder')
        ?? (leftApproach ? defaultOrder.get(leftApproach) : undefined) ?? Number.MAX_SAFE_INTEGER
      const rightOrder = smallestOrder(rightItems, 'caractereSortOrder')
        ?? smallestOrder(rightItems, 'helpApproachSortOrder')
        ?? (rightApproach ? defaultOrder.get(rightApproach) : undefined) ?? Number.MAX_SAFE_INTEGER
      return leftOrder - rightOrder
        || (leftApproach ? defaultOrder.get(leftApproach) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER)
          - (rightApproach ? defaultOrder.get(rightApproach) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER)
    })
    .map(([id, items]) => {
    const approach = items[0]?.helpApproach || 'complete-avec-reponses'
    const profile = coachHelpProfile(approach)
    return {
      id,
      approach,
      label: items.find(item => item.helpApproachName?.trim())?.helpApproachName?.trim() || profile.label,
      description: profile.description,
      coaches: [...items].sort((left, right) => left.sortOrder - right.sortOrder || left.firstName.localeCompare(right.firstName, 'fr') || left.id - right.id),
    }
  })
}
