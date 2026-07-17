import type { ExerciseQuestion } from '../types/conjugation'
import { normalizeAnswer } from './answer'

export type CoachErrorKind =
  | 'accent'
  | 'punctuation'
  | 'auxiliary'
  | 'agreement'
  | 'ending'
  | 'close-form'
  | 'unknown'

export interface CoachAnswerDiagnostic {
  result: 'correct' | 'incorrect'
  learnerAnswer: string
  expectedAnswer: string
  comparedAnswer: string
  errorKind?: CoachErrorKind
  confidence: 'high' | 'medium' | 'low'
  expectedEnding?: string
  learnerEnding?: string
  expectedAuxiliary?: string
  learnerAuxiliary?: string
  agreementSource?: 'subject' | 'cod-before' | 'cod-after' | 'coi'
  agreementFeatures?: string
}

const AUXILIARIES = new Set([
  'ai', 'as', 'a', 'avons', 'avez', 'ont', 'avais', 'avait', 'avions', 'aviez', 'avaient',
  'aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront', 'aie', 'aies', 'ait', 'ayons', 'ayez', 'aient',
  'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'étais', 'était', 'étions', 'étiez', 'étaient',
  'serai', 'seras', 'sera', 'serons', 'serez', 'seront', 'sois', 'soit', 'soyons', 'soyez', 'soient',
])

function comparable(value: string) {
  return normalizeAnswer(value).replace(/[.!?;,«»"()[\]{}:…-]/gu, '')
}

function withoutDiacritics(value: string) {
  return comparable(value).normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function words(value: string) {
  return normalizeAnswer(value, { ignoreWhitespace: false })
    .replace(/[’']/gu, ' ')
    .replace(/[^\p{L}-]+/gu, ' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0]!
    previous[0] = leftIndex
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex]!
      previous[rightIndex] = Math.min(
        previous[rightIndex]! + 1,
        previous[rightIndex - 1]! + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      )
      diagonal = above
    }
  }
  return previous[right.length]!
}

function closestExpected(answer: string, candidates: readonly string[]) {
  const safeCandidates = candidates.filter(candidate => typeof candidate === 'string' && candidate.trim())
  return safeCandidates.reduce<{ value: string, distance: number } | undefined>((best, candidate) => {
    const distance = editDistance(comparable(answer), comparable(candidate))
    return !best || distance < best.distance ? { value: candidate, distance } : best
  }, undefined)
}

function differingWord(answer: string, expected: string) {
  const answerWords = words(answer)
  const expectedWords = words(expected)
  if (answerWords.length !== expectedWords.length) return undefined
  const differences = expectedWords.flatMap((word, index) => word === answerWords[index]
    ? []
    : [{ learner: answerWords[index]!, expected: word }])
  return differences.length === 1 ? differences[0] : undefined
}

function agreementBase(value: string) {
  return value.replace(/(?:es|s|e)$/u, '')
}

function commonPrefix(left: string, right: string) {
  let length = 0
  while (length < left.length && length < right.length && left[length] === right[length]) length += 1
  return length
}

function auxiliaryIn(value: string) {
  return words(value).find(word => AUXILIARIES.has(word))
}

function displayedCorrection(question: ExerciseQuestion, fallback: string) {
  return question.reponsesPourCorrige.find(candidate => candidate.trim()) || fallback
}

export function diagnoseCoachAnswer(
  learnerAnswer: string,
  question: ExerciseQuestion,
  isCorrect: boolean,
): CoachAnswerDiagnostic {
  const nearest = closestExpected(learnerAnswer, question.reponses)
  const comparedAnswer = nearest?.value || question.reponses[0] || ''
  const expectedAnswer = displayedCorrection(question, comparedAnswer)
  const base: CoachAnswerDiagnostic = {
    result: isCorrect ? 'correct' : 'incorrect', learnerAnswer, expectedAnswer, comparedAnswer,
    confidence: isCorrect ? 'high' : 'low',
  }
  if (isCorrect) return base

  if (comparable(learnerAnswer) !== comparable(comparedAnswer)
    && withoutDiacritics(learnerAnswer) === withoutDiacritics(comparedAnswer)) {
    return { ...base, errorKind: 'accent', confidence: 'high' }
  }

  if (normalizeAnswer(learnerAnswer).replace(/[^\p{L}\p{N}]/gu, '')
    === normalizeAnswer(comparedAnswer).replace(/[^\p{L}\p{N}]/gu, '')) {
    return { ...base, errorKind: 'punctuation', confidence: 'high' }
  }

  const learnerAuxiliary = auxiliaryIn(learnerAnswer)
  const expectedAuxiliary = auxiliaryIn(comparedAnswer)
  if (learnerAuxiliary && expectedAuxiliary && learnerAuxiliary !== expectedAuxiliary) {
    return { ...base, errorKind: 'auxiliary', confidence: 'high', learnerAuxiliary, expectedAuxiliary }
  }

  const difference = differingWord(learnerAnswer, comparedAnswer)
  const questionCanRequireAgreement = Boolean(question.agreementReminder)
    || Boolean(learnerAuxiliary && expectedAuxiliary && learnerAuxiliary === expectedAuxiliary)
  if (questionCanRequireAgreement && difference && agreementBase(difference.learner) === agreementBase(difference.expected)
    && difference.learner !== difference.expected) {
    const reminder = question.agreementReminder
    const features = reminder?.gender && reminder.number
      ? `${reminder.gender === 'feminin' ? 'féminin' : 'masculin'} ${reminder.number}`
      : undefined
    return {
      ...base, errorKind: 'agreement', confidence: 'high', agreementFeatures: features,
      agreementSource: reminder?.kind || 'subject',
    }
  }

  if (difference) {
    const prefixLength = commonPrefix(difference.learner, difference.expected)
    const expectedEnding = difference.expected.slice(prefixLength)
    const learnerEnding = difference.learner.slice(prefixLength)
    if (prefixLength >= 3 && expectedEnding.length <= 6 && learnerEnding.length <= 6) {
      return { ...base, errorKind: 'ending', confidence: 'high', expectedEnding, learnerEnding }
    }
  }

  const distance = nearest?.distance ?? Number.POSITIVE_INFINITY
  const scale = Math.max(1, comparable(comparedAnswer).length)
  if (distance <= 3 || distance / scale <= 0.2) {
    return { ...base, errorKind: 'close-form', confidence: 'medium' }
  }
  return { ...base, errorKind: 'unknown', confidence: 'low' }
}
