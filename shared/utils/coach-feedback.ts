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

export interface CoachFeedbackState {
  recentTemplateIds: string[]
  errorCounts: Map<CoachErrorKind, number>
  lastErrorKind?: CoachErrorKind
}

export interface CoachFeedback {
  text: string
  templateId: string
  diagnostic: CoachAnswerDiagnostic
}

interface FeedbackTemplate {
  id: string
  render: (diagnostic: CoachAnswerDiagnostic, question: ExerciseQuestion, repeated: boolean) => string
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

const CORRECT_TEMPLATES: FeedbackTemplate[] = [
  { id: 'correct-1', render: diagnostic => `Oui, « ${diagnostic.expectedAnswer} » est correct.` },
  { id: 'correct-2', render: () => 'C’est juste.' },
  { id: 'correct-3', render: () => 'Bonne réponse, la forme est correcte.' },
  { id: 'correct-4', render: () => 'Exact, tu as trouvé la bonne forme.' },
  { id: 'correct-5', render: () => 'Réponse validée.' },
  { id: 'correct-6', render: () => 'Oui, c’est bien cette forme.' },
  { id: 'correct-7', render: () => 'Bien vu, la conjugaison est juste.' },
  { id: 'correct-8', render: () => 'C’est la bonne forme, continuons.' },
]

const ALTERNATIVE_TEMPLATES: FeedbackTemplate[] = [
  { id: 'alternative-1', render: () => 'Oui, cette réponse est admise.' },
  { id: 'alternative-2', render: () => 'C’est correct : cette variante convient.' },
  { id: 'alternative-3', render: () => 'Exact, cette formulation est possible.' },
]

const ERROR_TEMPLATES: Record<CoachErrorKind, FeedbackTemplate[]> = {
  accent: [
    { id: 'accent-1', render: d => `La forme est presque juste, mais l’accent compte : « ${d.expectedAnswer} ».` },
    { id: 'accent-2', render: d => `Attention à l’accent. On écrit « ${d.expectedAnswer} ».` },
    { id: 'accent-3', render: d => `Il manque seulement le bon accent dans « ${d.expectedAnswer} ».` },
  ],
  punctuation: [
    { id: 'punctuation-1', render: d => `La forme verbale convient, mais la ponctuation attendue est : « ${d.expectedAnswer} ».` },
    { id: 'punctuation-2', render: d => `Attention à la ponctuation finale : « ${d.expectedAnswer} ».` },
  ],
  auxiliary: [
    { id: 'auxiliary-1', render: d => `Ici, il faut l’auxiliaire « ${d.expectedAuxiliary} », et non « ${d.learnerAuxiliary} » : « ${d.expectedAnswer} ».` },
    { id: 'auxiliary-2', render: d => `Le point à corriger est l’auxiliaire. On écrit « ${d.expectedAnswer} » avec « ${d.expectedAuxiliary} ».` },
    { id: 'auxiliary-3', render: d => `Attention au choix de l’auxiliaire : la forme correcte est « ${d.expectedAnswer} ».` },
  ],
  agreement: [
    { id: 'agreement-1', render: (d, q) => agreementExplanation(d, q, false) },
    { id: 'agreement-2', render: (d, q) => agreementExplanation(d, q, true) },
    { id: 'agreement-3', render: d => `L’accord est à corriger ici : « ${d.expectedAnswer} ».` },
  ],
  ending: [
    { id: 'ending-1', render: d => `La terminaison attendue est « -${d.expectedEnding} » : « ${d.expectedAnswer} ».` },
    { id: 'ending-2', render: (d, q) => `Avec « ${q.pronom || 'la personne demandée'} », on écrit « ${d.expectedAnswer} ».` },
    { id: 'ending-3', render: d => `Le radical est proche, mais la fin de la forme change : « ${d.expectedAnswer} ».` },
  ],
  'close-form': [
    { id: 'close-1', render: d => `Tu es proche. Compare avec la forme correcte : « ${d.expectedAnswer} ».` },
    { id: 'close-2', render: d => `Il reste un petit écart : on écrit « ${d.expectedAnswer} ».` },
    { id: 'close-3', render: d => `La forme attendue est « ${d.expectedAnswer} ».` },
  ],
  unknown: [
    { id: 'unknown-1', render: d => `Ici, la forme attendue est « ${d.expectedAnswer} ».` },
    { id: 'unknown-2', render: d => `Compare ta réponse avec la correction : « ${d.expectedAnswer} ».` },
    { id: 'unknown-3', render: d => `Pour cette question, il fallait écrire « ${d.expectedAnswer} ».` },
    { id: 'unknown-4', render: d => `La réponse correcte est « ${d.expectedAnswer} ».` },
  ],
}

function agreementExplanation(diagnostic: CoachAnswerDiagnostic, question: ExerciseQuestion, compact: boolean) {
  const reminder = question.agreementReminder
  if (reminder?.kind === 'cod-before') {
    return compact
      ? `Le COD « ${reminder.complement} » est placé avant le verbe : on écrit « ${diagnostic.expectedAnswer} ».`
      : `Avec l’auxiliaire avoir, le participe s’accorde avec le COD « ${reminder.complement} » placé avant : « ${diagnostic.expectedAnswer} ».`
  }
  if (reminder?.kind === 'cod-after') {
    return `Le COD « ${reminder.complement} » vient après le verbe : le participe ne s’accorde pas. On écrit « ${diagnostic.expectedAnswer} ».`
  }
  if (reminder?.kind === 'coi') {
    return `« ${reminder.complement} » est un COI : il ne commande pas l’accord. On écrit « ${diagnostic.expectedAnswer} ».`
  }
  const features = diagnostic.agreementFeatures ? ` au ${diagnostic.agreementFeatures}` : ''
  return compact
    ? `Le participe doit s’accorder${features} : « ${diagnostic.expectedAnswer} ».`
    : `Avec l’auxiliaire être, le participe s’accorde avec le sujet${features} : « ${diagnostic.expectedAnswer} ».`
}

export function createCoachFeedbackState(): CoachFeedbackState {
  return { recentTemplateIds: [], errorCounts: new Map() }
}

function chooseTemplate(templates: FeedbackTemplate[], state: CoachFeedbackState, random: () => number) {
  const available = templates.filter(template => !state.recentTemplateIds.includes(template.id))
  const lastTemplateId = state.recentTemplateIds.at(-1)
  const candidates = available.length ? available : templates.filter(template => template.id !== lastTemplateId)
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))]!
}

export function createCoachFeedback(
  diagnostic: CoachAnswerDiagnostic,
  question: ExerciseQuestion,
  state: CoachFeedbackState,
  options: { random?: () => number, hasAlternative?: boolean } = {},
): CoachFeedback {
  const random = options.random || Math.random
  const kind = diagnostic.errorKind || 'unknown'
  const previousCount = diagnostic.result === 'incorrect' ? state.errorCounts.get(kind) || 0 : 0
  const templates = diagnostic.result === 'correct'
    ? options.hasAlternative ? ALTERNATIVE_TEMPLATES : CORRECT_TEMPLATES
    : ERROR_TEMPLATES[kind]
  const template = chooseTemplate(templates, state, random)
  let text = template.render(diagnostic, question, previousCount > 0)
  if (diagnostic.result === 'incorrect' && previousCount > 0 && state.lastErrorKind === kind
    && diagnostic.confidence !== 'low') {
    text = `Même point à surveiller : ${text.charAt(0).toLocaleLowerCase('fr')}${text.slice(1)}`
  }
  state.recentTemplateIds.push(template.id)
  if (state.recentTemplateIds.length > 6) state.recentTemplateIds.shift()
  if (diagnostic.result === 'incorrect') {
    state.errorCounts.set(kind, previousCount + 1)
    state.lastErrorKind = kind
  } else {
    state.lastErrorKind = undefined
  }
  return { text, templateId: template.id, diagnostic }
}
