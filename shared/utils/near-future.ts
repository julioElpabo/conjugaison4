export const NEAR_FUTURE_TENSE_CODE = 'near-future' as const
export const NEAR_FUTURE_TENSE_NAME = 'futur proche' as const

export interface NearFutureAuxiliaryForm {
  personId: number
  pronoun: string
  forms: readonly string[]
}

function normalized(value: string | null | undefined) {
  return (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’]/gu, "'")
    .trim()
    .toLocaleLowerCase('fr')
}

export function isNearFutureTense(tense: { code?: string | null, name?: string | null }) {
  return normalized(tense.code) === NEAR_FUTURE_TENSE_CODE
    || normalized(tense.name) === NEAR_FUTURE_TENSE_NAME
}

export function isPronominalNearFutureInfinitive(infinitive: string) {
  return /^(?:se\s+|s['’])/iu.test(infinitive.trim())
}

export function bareNearFutureInfinitive(infinitive: string) {
  return infinitive.trim().replace(/^(?:se\s+|s['’]\s*)/iu, '')
}

function startsWithElidableSound(value: string, typeHInitial?: string | null) {
  const first = normalized(value).charAt(0)
  if ('aeiouy'.includes(first)) return true
  return first === 'h' && normalized(typeHInitial) !== 'aspire'
}

export function nearFutureReflexivePronoun(
  personId: number,
  infinitive: string,
  typeHInitial?: string | null,
) {
  const elided = startsWithElidableSound(bareNearFutureInfinitive(infinitive), typeHInitial)
  if (personId === 4) return elided ? "m'" : 'me '
  if (personId === 5) return elided ? "t'" : 'te '
  if (personId === 7) return 'nous '
  if (personId === 8) return 'vous '
  return elided ? "s'" : 'se '
}

export function buildNearFutureForm(
  allerForm: string,
  infinitive: string,
  personId: number,
  typeHInitial?: string | null,
) {
  const auxiliary = allerForm.trim()
  const lexicalInfinitive = bareNearFutureInfinitive(infinitive)
  if (!auxiliary || !lexicalInfinitive) return ''
  if (!isPronominalNearFutureInfinitive(infinitive)) {
    return `${auxiliary} ${lexicalInfinitive}`
  }
  return `${auxiliary} ${nearFutureReflexivePronoun(personId, infinitive, typeHInitial)}${lexicalInfinitive}`
}

export function buildNearFutureParadigm(
  tenseId: number,
  verbId: number,
  infinitive: string,
  auxiliaryForms: readonly NearFutureAuxiliaryForm[],
  options: {
    typeHInitial?: string | null
    allowedPersonIds?: readonly number[] | null
  } = {},
) {
  const allowed = options.allowedPersonIds?.length ? new Set(options.allowedPersonIds.map(Number)) : null
  return auxiliaryForms
    .filter(form => !allowed || allowed.has(Number(form.personId)))
    .map(form => ({
      id: nearFutureSyntheticId(tenseId, verbId, form.personId),
      personId: Number(form.personId),
      tenseId: Number(tenseId),
      pronoun: form.pronoun,
      forms: [...new Set(form.forms
        .map(allerForm => buildNearFutureForm(allerForm, infinitive, form.personId, options.typeHInitial))
        .filter(Boolean))],
    }))
    .filter(form => form.forms.length > 0)
}

export function nearFutureSyntheticId(tenseId: number, verbId: number, personId: number) {
  const absoluteVerbId = Math.abs(Number(verbId))
  const verbPart = (absoluteVerbId % 5_000_000) + (Number(verbId) < 0 ? 5_000_000 : 0)
  return -(Number(tenseId) * 100_000_000 + verbPart * 10 + Number(personId))
}
