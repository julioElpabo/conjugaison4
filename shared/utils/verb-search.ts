export interface SearchableVerb {
  infinitif: string
}

export function normalizeVerbSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('fr')
}

export function matchingVerbs<T extends SearchableVerb>(verbs: T[], query: string): T[] {
  const needle = normalizeVerbSearch(query)
  if (!needle) return verbs

  return verbs
    .filter(verb => normalizeVerbSearch(verb.infinitif).includes(needle))
    .sort((left, right) => {
      const leftStarts = normalizeVerbSearch(left.infinitif).startsWith(needle)
      const rightStarts = normalizeVerbSearch(right.infinitif).startsWith(needle)
      if (leftStarts !== rightStarts) return leftStarts ? -1 : 1
      return left.infinitif.localeCompare(right.infinitif, 'fr')
    })
}
