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
  | 'missing-subject-pronoun'
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

const SUBJECT_PRONOUNS = new Set(['je', 'tu', 'il', 'elle', 'iel', 'on', 'nous', 'vous', 'ils', 'elles', 'iels'])
export const SUBJECT_PRONOUN_PLACEHOLDER = '......'

export interface ImpossibleSingularEndingReminder {
  personGroup: 'first-or-second-singular' | 'third-singular'
  target: 'verb' | 'auxiliary'
  ending: 't' | 'd' | 's' | 'x'
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
const SUBJECT_WORDS = new Set(['je', 'j', 'tu', 'il', 'elle', 'iel'])
const REFLEXIVE_WORDS = new Set(['me', 'm', 'te', 't', 'se', 's'])

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

function normalizedSubjectPronoun(value?: string) {
  const subject = normalizeAnswer(value || '', { ignoreWhitespace: false })
    .replace(/^(?:que\s+|qu')/u, '')
    .trim()
  return SUBJECT_PRONOUNS.has(subject) ? subject : ''
}

function answerContainsSubjectPronoun(answer: unknown, pronoun: string) {
  const words = lexicalWords(answer)
  const accepted = pronoun === 'je' ? new Set(['je', 'j']) : new Set([pronoun])
  return words.some(word => accepted.has(word))
}

function sameWords(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((word, index) => word === right[index])
}

function answerMatchesWithoutSubjectPronoun(
  answer: unknown,
  expectedAnswers: readonly unknown[],
  pronoun: string,
) {
  const answerWords = lexicalWords(answer)
  if (!answerWords.length) return false
  const acceptedSubjects = pronoun === 'je' ? new Set(['je', 'j']) : new Set([pronoun])
  return expectedAnswers.some((expected) => {
    const expectedWords = lexicalWords(expected)
    const subjectIndex = expectedWords.findIndex(word => acceptedSubjects.has(word))
    if (subjectIndex < 0) return false
    const withoutSubject = expectedWords.filter((_, index) => index !== subjectIndex)
    if (sameWords(answerWords, withoutSubject)) return true
    return ['que', 'qu'].includes(withoutSubject[0] || '')
      && sameWords(answerWords, withoutSubject.slice(1))
  })
}

export function conjugationRequiresSubjectPronoun(question: { pronom?: string, mode?: string }) {
  const mode = normalizeAnswer(question.mode || '', { ignoreWhitespace: false })
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  return Boolean(normalizedSubjectPronoun(question.pronom))
    && !['imperatif', 'infinitif', 'participe', 'gerondif'].includes(mode)
}

/** Produit un groupe de pointillés pour chaque mot que l’élève doit saisir. */
export function conjugationAnswerPlaceholder(question: {
  conjugaison1?: string
  pronom?: string
  saisiePrefixe?: string
}) {
  const prefix = question.saisiePrefixe?.trim() || question.pronom?.trim() || ''
  const prefixWords = prefix.split(/\s+/u).filter(Boolean)
  const conjugationWords = (question.conjugaison1 || '').trim().split(/\s+/u).filter(Boolean)
  const prefixBlanks = prefixWords.map((_, index) => (
    index === prefixWords.length - 1 ? SUBJECT_PRONOUN_PLACEHOLDER : '............'
  ))
  const conjugationBlanks = conjugationWords.map((_, index) => (
    index === conjugationWords.length - 1 ? '........................' : '............'
  ))
  return [...prefixBlanks, ...conjugationBlanks].join(' ')
}

/** Valide une réponse de conjugaison finie en exigeant le pronom sujet demandé. */
export function validateConjugationAnswer(
  answer: unknown,
  question: {
    reponses: readonly unknown[]
    pronom?: string
    mode?: string
  },
  options: AnswerNormalizationOptions = {},
): AnswerValidationResult {
  const result = validateAnswer(answer, question.reponses, options)
  const pronoun = normalizedSubjectPronoun(question.pronom)
  if (!pronoun || !conjugationRequiresSubjectPronoun(question)) return result
  if (result.isCorrect && answerContainsSubjectPronoun(answer, pronoun)) return result
  if (result.isCorrect || answerMatchesWithoutSubjectPronoun(answer, question.reponses, pronoun)) {
    return {
      ...result,
      isCorrect: false,
      reason: 'missing-subject-pronoun',
      matchedAnswer: null,
    }
  }
  return {
    ...result,
    isCorrect: false,
    reason: 'no-match',
    matchedAnswer: null,
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

export function isFutureSimpleInsteadOfNearFuture(
  answer: unknown,
  question: { futureSimpleAnswers?: readonly string[] },
) {
  return Boolean(question.futureSimpleAnswers?.length)
    && validateAnswer(answer, question.futureSimpleAnswers || []).isCorrect
}

export function findConjugationConfusions(
  answer: unknown,
  question: {
    conjugationConfusions?: readonly {
      tense: string
      mode: string
      answers: readonly string[]
    }[]
  },
) {
  return (question.conjugationConfusions || []).filter(candidate =>
    validateAnswer(answer, candidate.answers).isCorrect,
  )
}

function lexicalWords(value: unknown) {
  if (typeof value !== 'string') return []
  return normalizeAnswer(value, { ignoreWhitespace: false })
    .replace(APOSTROPHE_VARIANTS, "'")
    .match(/\p{L}+/gu) || []
}

function singularPersonGroup(question: {
  personId?: string | number | null
  pronom?: string
  saisiePrefixe?: string
}): ImpossibleSingularEndingReminder['personGroup'] | null {
  const personId = Number(question.personId)
  if (personId === 4 || personId === 5) return 'first-or-second-singular'
  if (personId === 6) return 'third-singular'

  const subjectWords = lexicalWords(question.pronom || question.saisiePrefixe)
  if (subjectWords.some(word => word === 'je' || word === 'j' || word === 'tu')) {
    return 'first-or-second-singular'
  }
  if (subjectWords.some(word => word === 'il' || word === 'elle' || word === 'iel')) {
    return 'third-singular'
  }
  return null
}

function conjugatedWord(
  answer: unknown,
  personGroup: ImpossibleSingularEndingReminder['personGroup'],
) {
  const answerWords = lexicalWords(answer)
  if (!answerWords.length) return ''

  const expectedSubjects = personGroup === 'first-or-second-singular'
    ? new Set(['je', 'j', 'tu'])
    : new Set(['il', 'elle', 'iel'])
  let startIndex = -1
  answerWords.forEach((word, index) => {
    if (expectedSubjects.has(word)) startIndex = index + 1
  })

  const formWords = answerWords.slice(startIndex >= 0 ? startIndex : 0)
  while (formWords.length && (SUBJECT_WORDS.has(formWords[0]!) || REFLEXIVE_WORDS.has(formWords[0]!))) {
    formWords.shift()
  }
  return formWords[0] || ''
}

/**
 * Repère deux terminaisons impossibles au singulier, sur le verbe d'un temps
 * simple ou sur l'auxiliaire d'un temps composé.
 */
export function findImpossibleSingularEnding(
  answer: unknown,
  question: {
    personId?: string | number | null
    pronom?: string
    saisiePrefixe?: string
    isCompound?: boolean
  },
): ImpossibleSingularEndingReminder | null {
  const personGroup = singularPersonGroup(question)
  if (!personGroup) return null

  const form = conjugatedWord(answer, personGroup)
  const ending = Array.from(form).at(-1)
  let impossibleEnding: ImpossibleSingularEndingReminder['ending']
  if (personGroup === 'first-or-second-singular') {
    if (ending !== 't' && ending !== 'd') return null
    impossibleEnding = ending
  } else {
    if (ending !== 's' && ending !== 'x') return null
    impossibleEnding = ending
  }

  return {
    personGroup,
    target: question.isCompound ? 'auxiliary' : 'verb',
    ending: impossibleEnding,
  }
}

export function impossibleSingularEndingReminderMessage(
  reminder: ImpossibleSingularEndingReminder,
) {
  if (reminder.target === 'auxiliary') {
    return reminder.personGroup === 'first-or-second-singular'
      ? 'Dans un temps composé, c’est l’auxiliaire qui se conjugue. Avec « je » ou « tu », il ne peut pas se terminer par « -t » ou « -d ».'
      : 'Dans un temps composé, c’est l’auxiliaire qui se conjugue. Avec « il », « elle » ou « iel », il ne peut pas se terminer par « -s » ou « -x ».'
  }
  return reminder.personGroup === 'first-or-second-singular'
    ? 'Avec « je » ou « tu », une forme conjuguée ne peut pas se terminer par « -t » ou « -d ».'
    : 'Avec « il », « elle » ou « iel », une forme conjuguée ne peut pas se terminer par « -s » ou « -x ».'
}

/**
 * Retourne les autres formes canoniques qui auraient également été justes.
 * La ponctuation finale de l'impératif est facultative dans l'exercice.
 */
export function getAlternativeCorrections(
  answer: unknown,
  corrections: readonly unknown[],
): string[] {
  const safeAnswer = typeof answer === 'string' ? answer : ''
  const normalizedAnswer = normalizeAnswer(safeAnswer).replace(/[.!?]+$/u, '')
  const safeCorrections = Array.isArray(corrections)
    ? corrections.filter((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
    : []

  if (!normalizedAnswer || safeCorrections.length < 2) return []

  const normalizedCorrections = safeCorrections.map(correction => (
    normalizeAnswer(correction).replace(/[.!?]+$/u, '')
  ))
  const matchesAnswer = (normalizedCorrection: string) => normalizedCorrection === normalizedAnswer

  if (!normalizedCorrections.some(matchesAnswer)) return []
  const seen = new Set<string>()
  return safeCorrections.filter((_, index) => {
    const normalizedCorrection = normalizedCorrections[index]!
    if (matchesAnswer(normalizedCorrection) || seen.has(normalizedCorrection)) return false
    seen.add(normalizedCorrection)
    return true
  })
}
