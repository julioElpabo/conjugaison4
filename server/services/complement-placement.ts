export interface AnteposedComplement {
  text: string
  gender: 'masculin' | 'feminin'
  number: 'singulier' | 'pluriel'
}

export type ComplementGender = AnteposedComplement['gender']
export type ComplementNumber = AnteposedComplement['number']

function explicitAnteposedText(value: string, gender: ComplementGender, number: ComplementNumber) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (number === 'pluriel') {
    return text.replace(/^(?:des|ses|quelques)\s+/iu, 'les ')
  }

  const elided = text.match(/^(?:de\s+)?l[’'](.+)$/iu)?.[1]
  if (elided) return `l’${elided}`
  const withoutDeterminer = text.match(/^(?:une?|du|de la|le|la|ce|cet|cette|ma|ta|sa)\s+(.+)$/iu)?.[1]
  if (!withoutDeterminer) return text
  const initial = withoutDeterminer.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
  if ('aeiouy'.includes(initial)) return `l’${withoutDeterminer}`
  return `${gender === 'feminin' ? 'la' : 'le'} ${withoutDeterminer}`
}

/**
 * Conserve la déduction automatique lorsqu'elle est sûre, tout en permettant à
 * l'administration de fournir explicitement le genre et le nombre.
 */
export function resolveAnteposedComplement(
  value: string,
  gender?: ComplementGender | null,
  number?: ComplementNumber | null,
): AnteposedComplement | null {
  const inferred = inferAnteposedComplement(value)
  if (!gender || !number) return inferred
  return {
    text: explicitAnteposedText(value, gender, number),
    gender,
    number,
  }
}

/**
 * Ne déduit une antéposition que lorsque le déterminant donne une information
 * morphologique certaine. Les pluriels « des/les » et « de l’ » restent à
 * vérifier, car leur genre ne peut pas être déduit de la seule chaîne.
 */
export function inferAnteposedComplement(value: string): AnteposedComplement | null {
  const text = value.replace(/\s+/g, ' ').trim()
  const pluralGenders = new Map<string, AnteposedComplement['gender']>([
    ['des chaussures', 'feminin'], ['des documents', 'masculin'], ['des lunettes', 'feminin'],
    ['des légumes', 'masculin'], ['des pommes', 'feminin'], ['les clés', 'feminin'],
    ['les consignes', 'feminin'], ['les documents', 'masculin'], ['les informations', 'feminin'],
    ['les jouets', 'masculin'], ['les légumes', 'masculin'], ['les oiseaux', 'masculin'],
    ['les outils', 'masculin'], ['les rideaux', 'masculin'], ['les vitres', 'feminin'],
    ['les vêtements', 'masculin'], ['quelques lignes', 'feminin'], ['ses affaires', 'feminin'],
    ['ses cheveux', 'masculin'], ['ses clés', 'feminin'], ['ses livres', 'masculin'],
    ['ses mains', 'feminin'], ['ses vêtements', 'masculin'],
  ])
  const pluralGender = pluralGenders.get(text.toLocaleLowerCase('fr-CH'))
  if (pluralGender) {
    return {
      text: text.replace(/^(?:des|ses|les|quelques)\s+/iu, 'les '),
      gender: pluralGender,
      number: 'pluriel',
    }
  }
  const rules: Array<[RegExp, string, AnteposedComplement['gender'], boolean?]> = [
    [/^une\s+(.+)$/iu, 'la', 'feminin'],
    [/^un\s+(.+)$/iu, 'le', 'masculin'],
    [/^de la\s+(.+)$/iu, 'la', 'feminin'],
    [/^du\s+(.+)$/iu, 'le', 'masculin'],
    [/^la\s+(.+)$/iu, 'la', 'feminin', true],
    [/^le\s+(.+)$/iu, 'le', 'masculin', true],
    [/^cette\s+(.+)$/iu, 'cette', 'feminin', true],
    [/^ce\s+(.+)$/iu, 'ce', 'masculin', true],
    [/^cet\s+(.+)$/iu, 'cet', 'masculin', true],
    [/^sa\s+(.+)$/iu, 'la', 'feminin'],
    [/^ma\s+(.+)$/iu, 'la', 'feminin'],
    [/^ta\s+(.+)$/iu, 'la', 'feminin'],
  ]

  for (const [pattern, determiner, gender, originalDeterminer] of rules) {
    const match = text.match(pattern)
    if (match?.[1]) {
      const noun = match[1]
      const initial = noun.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
      if (initial === 'h' && !originalDeterminer) return null
      const anteposed = ['le', 'la'].includes(determiner) && 'aeiouy'.includes(initial)
        ? `l’${noun}`
        : `${determiner} ${noun}`
      return { text: anteposed, gender, number: 'singulier' }
    }
  }
  return null
}
