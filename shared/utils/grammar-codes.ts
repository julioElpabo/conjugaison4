export const GRAMMAR_MODE_CODES = [
  'indicative', 'subjunctive', 'conditional', 'imperative', 'participle', 'gerund', 'infinitive',
] as const
export type GrammarModeCode = typeof GRAMMAR_MODE_CODES[number]

export const GRAMMAR_TENSE_CODES = [
  'present', 'imperfect', 'future', 'simple-past', 'compound-past', 'future-perfect',
  'pluperfect', 'past-anterior', 'past', 'past-first-form', 'past-second-form',
] as const
export type GrammarTenseCode = typeof GRAMMAR_TENSE_CODES[number]

function normalizedGrammarLabel(value: string | null | undefined) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

const MODE_BY_FRENCH_NAME: Record<string, GrammarModeCode> = {
  indicatif: 'indicative', subjonctif: 'subjunctive', conditionnel: 'conditional', imperatif: 'imperative',
  participe: 'participle', gerondif: 'gerund', infinitif: 'infinitive',
}
const TENSE_BY_FRENCH_NAME: Record<string, GrammarTenseCode> = {
  present: 'present', imparfait: 'imperfect', futur: 'future', 'passe simple': 'simple-past',
  'passe compose': 'compound-past', 'futur anterieur': 'future-perfect', 'plus-que-parfait': 'pluperfect',
  'passe anterieur': 'past-anterior', passe: 'past',
  'passe 1': 'past-first-form', 'passe 1re forme': 'past-first-form',
  'passe 2': 'past-second-form', 'passe 2e forme': 'past-second-form',
}

export function grammarModeCode(value: string | null | undefined): GrammarModeCode | null {
  const normalized = normalizedGrammarLabel(value)
  return GRAMMAR_MODE_CODES.includes(normalized as GrammarModeCode) ? normalized as GrammarModeCode : MODE_BY_FRENCH_NAME[normalized] || null
}

export function grammarTenseCode(value: string | null | undefined): GrammarTenseCode | null {
  const normalized = normalizedGrammarLabel(value)
  return GRAMMAR_TENSE_CODES.includes(normalized as GrammarTenseCode) ? normalized as GrammarTenseCode : TENSE_BY_FRENCH_NAME[normalized] || null
}

export function isGrammarMode(value: string | null | undefined, code: GrammarModeCode): boolean {
  return grammarModeCode(value) === code
}

export function isGrammarTense(value: string | null | undefined, code: GrammarTenseCode): boolean {
  return grammarTenseCode(value) === code
}
