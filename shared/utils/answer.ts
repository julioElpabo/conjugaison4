export interface AnswerNormalizationOptions {
  /** Ignore les différences de casse. Activé par défaut. */
  ignoreCase?: boolean
  /** Ignore tous les espaces Unicode, comme le faisait le site historique. */
  ignoreWhitespace?: boolean
  /** Considère les apostrophes droites et typographiques comme équivalentes. */
  normalizeApostrophes?: boolean
  /** Forme Unicode appliquée avant la comparaison. NFC par défaut. */
  unicodeForm?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' | false
}

export type AnswerValidationReason =
  | 'correct'
  | 'empty-answer'
  | 'no-expected-answer'
  | 'no-match'

export interface AnswerValidationResult {
  isCorrect: boolean
  reason: AnswerValidationReason
  answer: string
  normalizedAnswer: string
  expectedAnswers: readonly string[]
  normalizedExpectedAnswers: readonly string[]
  matchedAnswer: string | null
}

const DEFAULT_OPTIONS: Required<AnswerNormalizationOptions> = {
  ignoreCase: true,
  ignoreWhitespace: true,
  normalizeApostrophes: true,
  unicodeForm: 'NFC',
}

// L'apostrophe ASCII est la forme canonique utilisée pour comparer. Cette
// classe couvre les caractères les plus courants produits par les claviers et
// traitements de texte francophones.
const APOSTROPHE_VARIANTS = /[\u0060\u00b4\u02b9\u02bb\u02bc\u02bd\u02be\u02bf\u055a\u2018\u2019\u201b\u2032\u2035\uff07]/gu

/**
 * Normalise une réponse sans retirer les accents ni la ponctuation utile.
 * Une différence comme `oublié` / `oubliè` demeure donc une faute.
 */
export function normalizeAnswer(
  answer: string,
  options: AnswerNormalizationOptions = {},
): string {
  if (typeof answer !== 'string') {
    return ''
  }

  const resolved = { ...DEFAULT_OPTIONS, ...options }
  let normalized = answer

  if (resolved.unicodeForm) {
    normalized = normalized.normalize(resolved.unicodeForm)
  }

  if (resolved.normalizeApostrophes) {
    normalized = normalized.replace(APOSTROPHE_VARIANTS, "'")
  }

  if (resolved.ignoreCase) {
    normalized = normalized.toLocaleLowerCase('fr-CH')
  }

  if (resolved.ignoreWhitespace) {
    normalized = normalized.replace(/\s/gu, '')
  } else {
    normalized = normalized.trim()
  }

  return normalized
}

/**
 * Compare une saisie à toutes les réponses admises et fournit un diagnostic
 * exploitable par l'interface. Les valeurs non textuelles sont ignorées.
 */
export function validateAnswer(
  answer: unknown,
  expectedAnswers: readonly unknown[],
  options: AnswerNormalizationOptions = {},
): AnswerValidationResult {
  const safeAnswer = typeof answer === 'string' ? answer : ''
  const safeExpectedAnswers = Array.isArray(expectedAnswers)
    ? expectedAnswers.filter((candidate): candidate is string => typeof candidate === 'string')
    : []
  const normalizedAnswer = normalizeAnswer(safeAnswer, options)
  const normalizedExpectedAnswers = safeExpectedAnswers.map(candidate =>
    normalizeAnswer(candidate, options),
  )

  if (!normalizedAnswer) {
    return {
      isCorrect: false,
      reason: 'empty-answer',
      answer: safeAnswer,
      normalizedAnswer,
      expectedAnswers: safeExpectedAnswers,
      normalizedExpectedAnswers,
      matchedAnswer: null,
    }
  }

  if (safeExpectedAnswers.length === 0) {
    return {
      isCorrect: false,
      reason: 'no-expected-answer',
      answer: safeAnswer,
      normalizedAnswer,
      expectedAnswers: safeExpectedAnswers,
      normalizedExpectedAnswers,
      matchedAnswer: null,
    }
  }

  const matchIndex = normalizedExpectedAnswers.findIndex(
    candidate => candidate.length > 0 && candidate === normalizedAnswer,
  )

  return {
    isCorrect: matchIndex >= 0,
    reason: matchIndex >= 0 ? 'correct' : 'no-match',
    answer: safeAnswer,
    normalizedAnswer,
    expectedAnswers: safeExpectedAnswers,
    normalizedExpectedAnswers,
    matchedAnswer: matchIndex >= 0 ? safeExpectedAnswers[matchIndex]! : null,
  }
}

/** Raccourci booléen pour les composants qui n'ont pas besoin du diagnostic. */
export function isAnswerCorrect(
  answer: unknown,
  expectedAnswers: readonly unknown[],
  options: AnswerNormalizationOptions = {},
): boolean {
  return validateAnswer(answer, expectedAnswers, options).isCorrect
}

