export type ComplementPreposition = 'à' | 'de'

export function normalizeComplementPreposition(value: unknown): ComplementPreposition | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLocaleLowerCase('fr')
  return normalized === 'à' || normalized === 'de' ? normalized : null
}

/** Retire la préposition portée par une construction et restitue un groupe nominal autonome. */
export function withoutComplementPreposition(value: string, preposition: ComplementPreposition): string {
  const text = value.replace(/\s+/gu, ' ').trim()
  if (preposition === 'à') {
    if (/^aux\s+/iu.test(text)) return `les ${text.replace(/^aux\s+/iu, '')}`
    if (/^au\s+/iu.test(text)) return `le ${text.replace(/^au\s+/iu, '')}`
    return text.replace(/^à\s+/iu, '')
  }
  if (/^des\s+/iu.test(text)) return `les ${text.replace(/^des\s+/iu, '')}`
  if (/^du\s+/iu.test(text)) return `le ${text.replace(/^du\s+/iu, '')}`
  if (/^d['’]/iu.test(text)) return text.replace(/^d['’]/iu, '')
  return text.replace(/^de\s+/iu, '')
}

/** Applique à un complément sa préposition en respectant les contractions françaises. */
export function withComplementPreposition(value: string, preposition: ComplementPreposition): string {
  const phrase = withoutComplementPreposition(value, preposition)
  if (!phrase) return ''

  if (preposition === 'à') {
    if (/^le\s+/iu.test(phrase)) return `au ${phrase.replace(/^le\s+/iu, '')}`
    if (/^les\s+/iu.test(phrase)) return `aux ${phrase.replace(/^les\s+/iu, '')}`
    return `à ${phrase}`
  }

  if (/^le\s+/iu.test(phrase)) return `du ${phrase.replace(/^le\s+/iu, '')}`
  if (/^les\s+/iu.test(phrase)) return `des ${phrase.replace(/^les\s+/iu, '')}`
  const firstLetter = phrase.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLocaleLowerCase('fr')
  return 'aeiouyh'.includes(firstLetter) ? `d’${phrase}` : `de ${phrase}`
}
