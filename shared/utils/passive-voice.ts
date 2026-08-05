const NON_PASSIVIZABLE_INFINITIVES = new Set([
  'avoir',
  'falloir',
  'pleuvoir',
  'savoir',
])

function normalizedInfinitive(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

/**
 * Les verbes impersonnels ne peuvent pas former de passif. Certains verbes
 * transitifs ont par ailleurs un passif absent ou trop marqué pour constituer
 * un bon exercice scolaire (p. ex. « une idée est eue »).
 */
export function isPassivizableInfinitive(infinitive: string) {
  return !NON_PASSIVIZABLE_INFINITIVES.has(normalizedInfinitive(infinitive))
}
