export interface IndirectRelative {
  antecedent: string
  relativePronoun: 'auquel' | 'à laquelle' | 'duquel' | 'de laquelle'
}

const SINGULAR_DETERMINERS: Record<string, { article: 'le' | 'la', gender: 'masculin' | 'feminin' }> = {
  un: { article: 'le', gender: 'masculin' },
  une: { article: 'la', gender: 'feminin' },
  le: { article: 'le', gender: 'masculin' },
  la: { article: 'la', gender: 'feminin' },
  ce: { article: 'le', gender: 'masculin' },
  cet: { article: 'le', gender: 'masculin' },
  cette: { article: 'la', gender: 'feminin' },
}

/** Transforme un COI nominal sûr en groupe relatif : « à une réunion » → « la réunion à laquelle ». */
export function indirectRelative(complement: string, preposition?: string | null): IndirectRelative | null {
  const normalizedPreposition = preposition?.trim().toLocaleLowerCase('fr')
  if (normalizedPreposition !== 'à' && normalizedPreposition !== 'de') return null

  let remainder = complement.trim()
  if (normalizedPreposition === 'à') {
    if (remainder.startsWith('au ')) remainder = `le ${remainder.slice(3)}`
    else if (remainder.startsWith('à ')) remainder = remainder.slice(2)
    else return null
  } else {
    if (remainder.startsWith('du ')) remainder = `le ${remainder.slice(3)}`
    else if (remainder.startsWith("d'")) remainder = remainder.slice(2)
    else if (remainder.startsWith('de ')) remainder = remainder.slice(3)
    else return null
  }

  const match = remainder.match(/^(un|une|le|la|ce|cet|cette)\s+(.+)$/iu)
  if (!match?.[1] || !match[2]) return null
  const determiner = SINGULAR_DETERMINERS[match[1].toLocaleLowerCase('fr')]
  if (!determiner) return null
  const nounPhrase = match[2].trim()
  const first = nounPhrase.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLocaleLowerCase('fr')
  const antecedent = 'aeiouyh'.includes(first)
    ? `l’${nounPhrase}`
    : `${determiner.article} ${nounPhrase}`
  const relativePronoun = normalizedPreposition === 'à'
    ? determiner.gender === 'feminin' ? 'à laquelle' : 'auquel'
    : determiner.gender === 'feminin' ? 'de laquelle' : 'duquel'
  return { antecedent, relativePronoun }
}
