export type IndirectRelativePronoun =
  | 'auquel'
  | 'à laquelle'
  | 'auxquels'
  | 'auxquelles'
  | 'duquel'
  | 'de laquelle'
  | 'desquels'
  | 'desquelles'

export interface IndirectRelative {
  antecedent: string
  relativePronoun: IndirectRelativePronoun
}

type Gender = 'masculin' | 'feminin'
type GrammaticalNumber = 'singulier' | 'pluriel'

const SINGULAR_DETERMINERS: Record<string, Gender> = {
  un: 'masculin',
  une: 'feminin',
  le: 'masculin',
  la: 'feminin',
  ce: 'masculin',
  cet: 'masculin',
  cette: 'feminin',
}

const SAFE_DETERMINERS = new Set([
  ...Object.keys(SINGULAR_DETERMINERS),
  'des',
  'les',
  'ces',
  'mes',
  'tes',
  'ses',
  'nos',
  'vos',
  'leurs',
  'plusieurs',
  'quelques',
])

function normalizedGrammar(
  gender?: string | null,
  number?: string | null,
): { gender: Gender, number: GrammaticalNumber } | null {
  const normalizedGender = gender?.trim().toLocaleLowerCase('fr')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const normalizedNumber = number?.trim().toLocaleLowerCase('fr')
  if ((normalizedGender !== 'masculin' && normalizedGender !== 'feminin')
      || (normalizedNumber !== 'singulier' && normalizedNumber !== 'pluriel')) return null
  return { gender: normalizedGender, number: normalizedNumber }
}

function relativePronoun(
  preposition: 'à' | 'de',
  gender: Gender,
  number: GrammaticalNumber,
): IndirectRelativePronoun {
  if (preposition === 'à') {
    if (number === 'pluriel') return gender === 'feminin' ? 'auxquelles' : 'auxquels'
    return gender === 'feminin' ? 'à laquelle' : 'auquel'
  }
  if (number === 'pluriel') return gender === 'feminin' ? 'desquelles' : 'desquels'
  return gender === 'feminin' ? 'de laquelle' : 'duquel'
}

/** Transforme uniquement un COI nominal dont la grammaire peut être établie sans approximation. */
export function indirectRelative(
  complement: string,
  preposition?: string | null,
  gender?: string | null,
  number?: string | null,
): IndirectRelative | null {
  const normalizedPreposition = preposition?.trim().toLocaleLowerCase('fr')
  if (normalizedPreposition !== 'à' && normalizedPreposition !== 'de') return null

  let remainder = complement.trim()
  if (normalizedPreposition === 'à') {
    if (/^au\s/iu.test(remainder)) remainder = `le ${remainder.slice(3)}`
    else if (/^aux\s/iu.test(remainder)) remainder = `les ${remainder.slice(4)}`
    else if (/^à\s/iu.test(remainder)) remainder = remainder.slice(2)
    else return null
  } else {
    if (/^du\s/iu.test(remainder)) remainder = `le ${remainder.slice(3)}`
    else if (/^des\s/iu.test(remainder)) remainder = `les ${remainder.slice(4)}`
    else if (/^d['’]/iu.test(remainder)) remainder = remainder.slice(2)
    else if (/^de\s/iu.test(remainder)) remainder = remainder.slice(3)
    else return null
  }

  const match = remainder.match(/^(\S+)\s+(.+)$/u)
  if (!match?.[1] || !match[2]) return null
  const determiner = match[1].toLocaleLowerCase('fr')
  if (!SAFE_DETERMINERS.has(determiner)) return null

  const explicitGrammar = normalizedGrammar(gender, number)
  const inferredGender = SINGULAR_DETERMINERS[determiner]
  const grammar = explicitGrammar ?? (inferredGender
    ? { gender: inferredGender, number: 'singulier' as const }
    : null)
  if (!grammar) return null
  if (grammar.number === 'singulier' && inferredGender && inferredGender !== grammar.gender) return null

  const nounPhrase = match[2].trim()
  const first = nounPhrase.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLocaleLowerCase('fr')
  const antecedent = grammar.number === 'pluriel'
    ? `les ${nounPhrase}`
    : 'aeiouyh'.includes(first)
      ? `l’${nounPhrase}`
      : `${grammar.gender === 'feminin' ? 'la' : 'le'} ${nounPhrase}`

  return {
    antecedent,
    relativePronoun: relativePronoun(normalizedPreposition, grammar.gender, grammar.number),
  }
}
