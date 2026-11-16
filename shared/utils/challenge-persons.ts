/** Identifiants des six personnes grammaticales dans le catalogue. */
export const CHALLENGE_PERSON_IDS = [4, 5, 6, 7, 8, 9] as const

export const CHALLENGE_PERSON_CHOICES = [
  { id: 4, label: 'je' },
  { id: 5, label: 'tu' },
  { id: 6, label: 'il / elle' },
  { id: 7, label: 'nous' },
  { id: 8, label: 'vous' },
  { id: 9, label: 'ils / elles' },
] as const

/** Une sélection complète est omise pour conserver le format des anciens défis. */
export function challengePersonSelection(personIds?: readonly number[]): number[] | undefined {
  if (personIds === undefined) return undefined
  const selected = CHALLENGE_PERSON_IDS.filter(id => personIds.includes(id))
  return selected.length === CHALLENGE_PERSON_IDS.length ? undefined : selected
}

/** Les formes sans personne (infinitif, participe, gérondif) restent disponibles. */
export function includesChallengePerson(personIds: readonly number[] | undefined, personId: number | null | undefined) {
  return personIds === undefined || personId == null || personIds.includes(Number(personId))
}
