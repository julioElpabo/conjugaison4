import type { ExerciseQuestion } from '../types/conjugation'
import { normalizeAnswer } from './answer'

export type CoachErrorKind =
  | 'accent'
  | 'punctuation'
  | 'auxiliary'
  | 'compound-participle'
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
  expectedParticiple?: string
  learnerFormAfterAuxiliary?: string
  agreementSource?: 'subject' | 'avoir' | 'cod-before' | 'cod-after' | 'coi'
  agreementFeatures?: string
}

const AVOIR_AUXILIARY_FORMS = new Set([
  'avoir', 'ayant',
  'ai', 'as', 'a', 'avons', 'avez', 'ont', 'avais', 'avait', 'avions', 'aviez', 'avaient',
  'eus', 'eut', 'eûmes', 'eûtes', 'eurent',
  'aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront',
  'aurais', 'aurait', 'aurions', 'auriez', 'auraient',
  'aie', 'aies', 'ait', 'ayons', 'ayez', 'aient',
  'eusse', 'eusses', 'eût', 'eussions', 'eussiez', 'eussent',
])

const ETRE_AUXILIARY_FORMS = new Set([
  'être', 'étant',
  'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'étais', 'était', 'étions', 'étiez', 'étaient',
  'fus', 'fut', 'fûmes', 'fûtes', 'furent',
  'serai', 'seras', 'sera', 'serons', 'serez', 'seront',
  'serais', 'serait', 'serions', 'seriez', 'seraient',
  'sois', 'soit', 'soyons', 'soyez', 'soient',
  'fusse', 'fusses', 'fût', 'fussions', 'fussiez', 'fussent',
])

const AUXILIARIES = new Set([...AVOIR_AUXILIARY_FORMS, ...ETRE_AUXILIARY_FORMS])

export function auxiliaryLemmaForForm(form: string): 'avoir' | 'être' | undefined {
  if (AVOIR_AUXILIARY_FORMS.has(form)) return 'avoir'
  if (ETRE_AUXILIARY_FORMS.has(form)) return 'être'
  return undefined
}

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

function agreementStems(value: string) {
  const normalized = comparable(value)
  return new Set([
    normalized,
    normalized.replace(/es$/u, ''),
    normalized.replace(/s$/u, ''),
    normalized.replace(/e$/u, ''),
  ].filter(Boolean))
}

function belongsToSameAgreementFamily(left: string, right: string) {
  const leftStems = agreementStems(left)
  return [...agreementStems(right)].some(stem => leftStems.has(stem))
}

function commonPrefix(left: string, right: string) {
  let length = 0
  while (length < left.length && length < right.length && left[length] === right[length]) length += 1
  return length
}

/** Repère la construction et le participe, sans confondre le complément avec lui. */
function compoundStructure(value: string, question: ExerciseQuestion) {
  const tokens = words(value)
  const subjects = new Set(['je', 'j', 'tu', 'il', 'elle', 'iel', 'on', 'nous', 'vous', 'ils', 'elles', 'iels'])
  const clitics = new Set(['me', 'm', 'te', 't', 'se', 's', 'le', 'la', 'les', 'l', 'lui', 'leur', 'y', 'en', 'nous', 'vous', 'ne', 'n'])
  const requestedSubject = words(question.passiveSubject || question.pronom || '')
  let index = -1
  for (let position = 0; position < tokens.length; position += 1) {
    const namedSubject = requestedSubject.length > 0
      && requestedSubject.every((word, offset) => tokens[position + offset] === word)
    if (!namedSubject && !subjects.has(tokens[position]!)) continue
    let afterSubject = position + (namedSubject ? requestedSubject.length : 1)
    while (clitics.has(tokens[afterSubject] || '')) afterSubject += 1
    if (AUXILIARIES.has(tokens[afterSubject] || '')) {
      index = afterSubject
      break
    }
  }
  // Les réponses peuvent ne contenir que la forme verbale, notamment au passif.
  // Le sujet permet sinon d’éviter de prendre « avions » ou « sommes » dans
  // un complément nominal pour l’auxiliaire de la phrase.
  if (index < 0) index = tokens.findIndex(token => AUXILIARIES.has(token))
  if (index < 0) return undefined
  const auxiliary = tokens[index]!
  const chain = [auxiliary]
  let participleIndex = index + 1
  const infinitive = normalizeAnswer(question.infinitif || '')
  // Au passif composé, « été » appartient à la chaîne auxiliaire.
  // Pour le verbe être lui-même, c’est au contraire le participe à vérifier.
  if (infinitive !== 'être' && tokens[participleIndex] === 'été' && tokens[participleIndex + 1]) {
    chain.push(tokens[participleIndex++]!)
  }
  const prefix = tokens.slice(0, index)
  const reflexive = prefix.some(token => ['me', 'm', 'te', 't', 'se', 's'].includes(token))
    || prefix.filter(token => token === 'nous').length > 1
    || prefix.filter(token => token === 'vous').length > 1
  return {
    auxiliary,
    auxiliaryPhrase: chain.join(' '),
    agreementAuxiliary: chain.length > 1 ? 'être' : auxiliaryLemmaForForm(auxiliary),
    participle: tokens[participleIndex],
    signature: `${auxiliaryLemmaForForm(auxiliary)}:${chain.slice(1).join(' ')}:${reflexive}`,
  }
}

function candidatesForAuxiliary(answer: string, question: ExerciseQuestion) {
  const auxiliary = auxiliaryLemmaForForm(compoundStructure(answer, question)?.auxiliary || '')
  if (!question.isCompound || !auxiliary) return question.reponses
  const sameAuxiliary = question.reponses.filter(candidate => (
    auxiliaryLemmaForForm(compoundStructure(candidate, question)?.auxiliary || '') === auxiliary
  ))
  return sameAuxiliary.length ? sameAuxiliary : question.reponses
}

function compoundParticipleDifference(learnerAnswer: string, expectedAnswer: string, question: ExerciseQuestion) {
  const learner = compoundStructure(learnerAnswer, question)
  const expected = compoundStructure(expectedAnswer, question)
  if (!learner || !expected || learner.signature !== expected.signature
      || learner.auxiliaryPhrase !== expected.auxiliaryPhrase) return undefined
  const expectedParticiple = expected.participle
  const learnerForm = learner.participle
  if (!expectedParticiple || !learnerForm || expectedParticiple === learnerForm) return undefined
  if (belongsToSameAgreementFamily(learnerForm, expectedParticiple)) return undefined
  if (commonPrefix(learnerForm, expectedParticiple) < 2) return undefined
  return {
    auxiliary: expected.auxiliaryPhrase,
    expectedParticiple,
    learnerForm,
  }
}

function displayedCorrection(question: ExerciseQuestion, fallback: string) {
  const structure = compoundStructure(fallback, question)
  const candidates = structure
    ? question.reponsesPourCorrige.filter(answer => compoundStructure(answer, question)?.auxiliaryPhrase === structure.auxiliaryPhrase)
    : question.reponsesPourCorrige
  return closestExpected(fallback, candidates)?.value || fallback
}

/**
 * Compare les accords seulement entre constructions grammaticales identiques.
 * Un autre temps du même auxiliaire peut conserver une erreur d’accord ;
 * un changement d’auxiliaire ou de voix impose de revoir la construction d’abord.
 */
export function diagnoseCoachAgreement(
  learnerAnswer: string,
  question: ExerciseQuestion,
): CoachAnswerDiagnostic | undefined {
  if (!question.isCompound && !question.agreementReminder && question.voice !== 'passive') return undefined
  const learner = compoundStructure(learnerAnswer, question)
  const learnerParticiple = learner?.participle
  if (!learnerParticiple) return undefined

  const candidates = question.reponses.filter(candidate => (
    compoundStructure(candidate, question)?.signature === learner.signature
  ))
  const acceptedParticiples = candidates
    .filter(candidate => candidate.trim())
    .map(candidate => compoundStructure(candidate, question)?.participle)
    .filter((candidate): candidate is string => Boolean(candidate))
  if (acceptedParticiples.includes(learnerParticiple)) return undefined

  const expected = candidates
    .filter(candidate => candidate.trim())
    .map(candidate => ({
      value: candidate,
      structure: compoundStructure(candidate, question)!,
      distance: editDistance(comparable(learnerAnswer), comparable(candidate)),
    }))
    .filter((candidate) => {
      const expectedParticiple = candidate.structure.participle
      return expectedParticiple
        && learnerParticiple !== expectedParticiple
        && belongsToSameAgreementFamily(learnerParticiple, expectedParticiple)
    })
    .sort((left, right) => left.distance - right.distance)[0]
  const expectedParticiple = expected?.structure.participle
  if (!expected || !expectedParticiple) return undefined

  const reminder = question.agreementReminder
  const features = reminder?.gender && reminder.number
    ? `${reminder.gender === 'feminin' ? 'féminin' : 'masculin'} ${reminder.number}`
    : undefined
  return {
    result: 'incorrect',
    learnerAnswer,
    expectedAnswer: displayedCorrection(question, expected.value),
    comparedAnswer: expected.value,
    errorKind: 'agreement',
    confidence: 'high',
    agreementFeatures: features,
    agreementSource: reminder?.kind || (question.voice !== 'passive'
      && expected.structure.agreementAuxiliary === 'avoir' ? 'avoir' : 'subject'),
  }
}

export function diagnoseCoachAnswer(
  learnerAnswer: string,
  question: ExerciseQuestion,
  isCorrect: boolean,
): CoachAnswerDiagnostic {
  const nearest = closestExpected(learnerAnswer, candidatesForAuxiliary(learnerAnswer, question))
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

  const learnerConstruction = compoundStructure(learnerAnswer, question)
  const expectedConstruction = compoundStructure(comparedAnswer, question)
  const learnerAuxiliary = learnerConstruction?.auxiliary
  const expectedAuxiliary = expectedConstruction?.auxiliary
  const learnerAuxiliaryLemma = learnerAuxiliary ? auxiliaryLemmaForForm(learnerAuxiliary) : undefined
  const expectedAuxiliaryLemma = expectedAuxiliary ? auxiliaryLemmaForForm(expectedAuxiliary) : undefined
  const differentConstruction = learnerConstruction && expectedConstruction
    && learnerConstruction.signature !== expectedConstruction.signature
  if (question.isCompound
    && learnerAuxiliary && expectedAuxiliary
    && learnerAuxiliaryLemma && expectedAuxiliaryLemma
    && learnerAuxiliaryLemma !== expectedAuxiliaryLemma) {
    return { ...base, errorKind: 'auxiliary', confidence: 'high', learnerAuxiliary, expectedAuxiliary }
  }
  if ((question.isCompound || question.voice === 'passive') && differentConstruction
      && learnerConstruction.auxiliaryPhrase !== expectedConstruction.auxiliaryPhrase) {
    return {
      ...base, errorKind: 'auxiliary', confidence: 'high',
      learnerAuxiliary: learnerConstruction.auxiliaryPhrase,
      expectedAuxiliary: expectedConstruction.auxiliaryPhrase,
    }
  }

  const independentAgreement = diagnoseCoachAgreement(learnerAnswer, question)
  if (independentAgreement) return independentAgreement

  const difference = differingWord(learnerAnswer, comparedAnswer)
  const compoundParticiple = question.isCompound || question.voice === 'passive'
    ? compoundParticipleDifference(learnerAnswer, comparedAnswer, question)
    : undefined
  if (compoundParticiple) {
    return {
      ...base,
      errorKind: 'compound-participle',
      confidence: 'high',
      expectedAuxiliary: compoundParticiple.auxiliary,
      learnerAuxiliary: compoundParticiple.auxiliary,
      expectedParticiple: compoundParticiple.expectedParticiple,
      learnerFormAfterAuxiliary: compoundParticiple.learnerForm,
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
