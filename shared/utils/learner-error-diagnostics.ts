import type { ExerciseQuestion, LearnerErrorDetail } from '../types/conjugation'
import {
  findConjugationConfusions,
  findImpossibleSingularEnding,
  isFutureSimpleInsteadOfNearFuture,
  normalizeAnswer,
  validateAnswer,
} from './answer'
import { diagnoseCoachAgreement, diagnoseCoachAnswer } from './coach-feedback'

export type LearnerErrorConfidence = 'high' | 'medium' | 'low'

export const LEARNER_ERROR_TAXONOMY = [
  { code: 'task.wrong_mode', domain: 'Consigne', label: 'Confusion de mode', advice: 'Compare le mode demandé avec la forme que tu as utilisée.' },
  { code: 'task.wrong_tense', domain: 'Consigne', label: 'Confusion de temps', advice: 'Repère le temps demandé avant de construire la forme.' },
  { code: 'task.future_simple_for_near_future', domain: 'Consigne', label: 'Futur simple à la place du futur proche', advice: 'Le futur proche se construit avec aller au présent suivi de l’infinitif.' },
  { code: 'person.other_form', domain: 'Personne', label: 'Forme d’une autre personne', advice: 'Relis le pronom et cherche la terminaison qui lui correspond.' },
  { code: 'person.impossible_ending', domain: 'Personne', label: 'Terminaison impossible pour cette personne', advice: 'Avec je ou tu, pas de -t ou -d ; avec il, elle ou iel, pas de -s ou -x.' },
  { code: 'compound.auxiliary', domain: 'Temps composé', label: 'Auxiliaire incorrect', advice: 'Identifie l’auxiliaire et conjugue-le au temps demandé.' },
  { code: 'agreement.subject', domain: 'Accord', label: 'Accord du participe avec le sujet', advice: 'Avec être, vérifie le genre et le nombre du sujet.' },
  { code: 'agreement.cod_before', domain: 'Accord', label: 'Accord avec un COD placé avant', advice: 'Avec avoir, le participe s’accorde avec le COD lorsque celui-ci est placé avant.' },
  { code: 'agreement.cod_after', domain: 'Accord', label: 'Accord indu avec un COD placé après', advice: 'Un COD placé après le participe ne commande pas son accord.' },
  { code: 'agreement.coi', domain: 'Accord', label: 'Accord indu avec un COI', advice: 'Un COI ne commande jamais l’accord du participe passé avec avoir.' },
  { code: 'agreement.avoir_unwarranted', domain: 'Accord', label: 'Accord indu avec avoir', advice: 'Sans COD placé avant, le participe passé employé avec avoir reste invariable.' },
  { code: 'morphology.ending', domain: 'Construction', label: 'Terminaison incorrecte', advice: 'Garde le radical, puis vérifie la terminaison du temps et de la personne.' },
  { code: 'orthography.copied_complement', domain: 'Orthographe', label: 'Faute de recopie du complément', advice: 'Recopie précisément le COD ou le COI donné dans la phrase.' },
  { code: 'orthography.accent', domain: 'Orthographe', label: 'Accent incorrect ou manquant', advice: 'Observe précisément les accents de la forme attendue.' },
  { code: 'orthography.punctuation', domain: 'Orthographe', label: 'Ponctuation ou signe incorrect', advice: 'Vérifie les apostrophes, les traits d’union et la ponctuation utile.' },
  { code: 'input.close_form', domain: 'Saisie', label: 'Forme proche de la réponse', advice: 'Compare lettre par lettre ta réponse avec la correction.' },
  { code: 'unknown', domain: 'Autre', label: 'Erreur non encore classée', advice: 'Relis la correction et compare la construction complète.' },
] as const

export type LearnerErrorTypeCode = typeof LEARNER_ERROR_TAXONOMY[number]['code']

export interface LearnerErrorTag {
  code: LearnerErrorTypeCode
  confidence: LearnerErrorConfidence
  primary: boolean
  evidence?: Record<string, string>
}

export const LEARNER_ERROR_DETECTOR_VERSION = '1.2.0'

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

const ETRE_AUXILIARY_FORMS = new Set([
  'suis', 'es', 'est', 'sommes', 'êtes', 'sont',
  'étais', 'était', 'étions', 'étiez', 'étaient',
  'serai', 'seras', 'sera', 'serons', 'serez', 'seront',
  'sois', 'soit', 'soyons', 'soyez', 'soient',
])

function expectedUsesEtre(question: ExerciseQuestion) {
  return question.reponses.some(answer => (
    normalizeAnswer(answer, { ignoreWhitespace: false })
      .match(/\p{L}+/gu)
      ?.some(word => ETRE_AUXILIARY_FORMS.has(word))
  ))
}

function tag(
  code: LearnerErrorTypeCode,
  confidence: LearnerErrorConfidence,
  evidence?: Record<string, string>,
): Omit<LearnerErrorTag, 'primary'> {
  return { code, confidence, ...(evidence && Object.keys(evidence).length ? { evidence } : {}) }
}

function uniqueTags(tags: Array<Omit<LearnerErrorTag, 'primary'>>) {
  const seen = new Set<LearnerErrorTypeCode>()
  return tags
    .filter((candidate) => {
      if (seen.has(candidate.code)) return false
      seen.add(candidate.code)
      return true
    })
    .map((candidate, index) => ({ ...candidate, primary: index === 0 }))
}

function otherPersonTag(answer: string, question: ExerciseQuestion) {
  const currentPersonId = Number(question.personId)
  const match = question.radicalReference?.paradigmForms?.find(candidate =>
    Number(candidate.personId) !== currentPersonId
    && validateAnswer(answer, [candidate.form]).isCorrect,
  )
  return match
    ? tag('person.other_form', 'high', {
        expectedPerson: text(question.pronom || question.saisiePrefixe),
        detectedPerson: text(match.subject),
        detectedForm: text(match.form),
      })
    : null
}

function lastWord(value: string) {
  return normalizeAnswer(value, { ignoreWhitespace: false }).match(/\p{L}+/gu)?.at(-1) || ''
}

function pluralPersonEndingTag(answer: string, question: ExerciseQuestion) {
  const learnerWord = lastWord(answer)
  const expectedWord = lastWord(question.reponses[0] || '')
  if (learnerWord.endsWith('ont') && expectedWord.endsWith('ons')) {
    return tag('person.other_form', 'high', {
      detectedPerson: 'ils/elles',
      expectedPerson: 'nous',
      detectedEnding: '-ont',
      expectedEnding: '-ons',
    })
  }
  if (learnerWord.endsWith('ons') && expectedWord.endsWith('ont')) {
    return tag('person.other_form', 'high', {
      detectedPerson: 'nous',
      expectedPerson: 'ils/elles',
      detectedEnding: '-ons',
      expectedEnding: '-ont',
    })
  }
  return null
}

function copiedWords(value: unknown) {
  if (typeof value !== 'string') return []
  return normalizeAnswer(value, { ignoreWhitespace: false })
    .match(/\p{L}+(?:'\p{L}+)?/gu) || []
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex]
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1]! + 1,
        previous[rightIndex]! + 1,
        previous[rightIndex - 1]! + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      )
    }
    previous.splice(0, previous.length, ...current)
  }
  return previous[right.length]!
}

function copiedComplementTag(
  answer: string,
  question: ExerciseQuestion,
): Omit<LearnerErrorTag, 'primary'> | null {
  if (question.complementPosition !== 'after'
    || !question.complement
    || (question.complementFunction !== 'cod' && question.complementFunction !== 'coi')) {
    return null
  }
  const expectedComplementWords = copiedWords(question.complement)
  const answerWords = copiedWords(answer)
  if (!expectedComplementWords.length || answerWords.length <= expectedComplementWords.length) return null
  const expectedComplement = expectedComplementWords.join(' ')
  for (const expectedAnswer of question.reponses) {
    const expectedWords = copiedWords(expectedAnswer)
    if (expectedWords.length <= expectedComplementWords.length) continue
    const expectedSuffix = expectedWords.slice(-expectedComplementWords.length).join(' ')
    if (expectedSuffix !== expectedComplement) continue
    const learnerComplement = answerWords.slice(-expectedComplementWords.length).join(' ')
    if (learnerComplement === expectedComplement) continue
    const distance = editDistance(learnerComplement, expectedComplement)
    const maximumDistance = Math.min(3, Math.max(1, Math.floor(expectedComplement.length * .18)))
    if (distance > maximumDistance) continue
    return tag('orthography.copied_complement', 'high', {
      complementFunction: question.complementFunction.toUpperCase(),
      learnerComplement,
      expectedComplement: question.complement,
    })
  }
  return null
}

function agreementTag(
  diagnostic: ReturnType<typeof diagnoseCoachAgreement>,
): Omit<LearnerErrorTag, 'primary'> | null {
  if (!diagnostic) return null
  const agreementCode: LearnerErrorTypeCode = diagnostic.agreementSource === 'cod-before'
    ? 'agreement.cod_before'
    : diagnostic.agreementSource === 'cod-after'
      ? 'agreement.cod_after'
      : diagnostic.agreementSource === 'coi'
        ? 'agreement.coi'
        : 'agreement.subject'
  return tag(agreementCode, 'high', {
    features: text(diagnostic.agreementFeatures),
  })
}

export function diagnoseLearnerError(
  answer: string,
  question: ExerciseQuestion,
): LearnerErrorTag[] {
  if (validateAnswer(answer, question.reponses).isCorrect) return []

  const independentAgreement = agreementTag(diagnoseCoachAgreement(answer, question))
  const copiedComplement = copiedComplementTag(answer, question)
  const withDetectedContext = (primary: Omit<LearnerErrorTag, 'primary'>) => {
    const genericFormDifference = primary.code === 'morphology.ending'
      || primary.code === 'input.close_form'
    return uniqueTags([
      ...(copiedComplement && copiedComplement.code !== primary.code ? [copiedComplement] : []),
      ...(!copiedComplement || !genericFormDifference ? [primary] : []),
      ...(independentAgreement ? [independentAgreement] : []),
    ])
  }

  if (isFutureSimpleInsteadOfNearFuture(answer, question)) {
    return withDetectedContext(tag('task.future_simple_for_near_future', 'high'))
  }

  const confusions = findConjugationConfusions(answer, question)
  if (confusions.length) {
    const source = confusions[0]!
    const tags: Array<Omit<LearnerErrorTag, 'primary'>> = []
    if (normalizeAnswer(source.mode) !== normalizeAnswer(question.mode || '')) {
      tags.push(tag('task.wrong_mode', 'high', {
        detectedMode: source.mode,
        expectedMode: text(question.mode),
      }))
    }
    if (normalizeAnswer(source.tense) !== normalizeAnswer(question.temps || '')) {
      tags.push(tag('task.wrong_tense', 'high', {
        detectedTense: source.tense,
        expectedTense: text(question.temps),
      }))
    }
    if (copiedComplement) tags.unshift(copiedComplement)
    if (independentAgreement) tags.push(independentAgreement)
    if (tags.length) return uniqueTags(tags)
  }

  const personConfusion = otherPersonTag(answer, question)
  if (personConfusion) return withDetectedContext(personConfusion)

  const pluralEndingConfusion = pluralPersonEndingTag(answer, question)
  if (pluralEndingConfusion) return withDetectedContext(pluralEndingConfusion)

  const impossibleEnding = findImpossibleSingularEnding(answer, question)
  if (impossibleEnding) {
    return withDetectedContext(tag('person.impossible_ending', 'high', {
      ending: impossibleEnding.ending,
      target: impossibleEnding.target,
      personGroup: impossibleEnding.personGroup,
    }))
  }

  const diagnostic = diagnoseCoachAnswer(answer, question, false)
  if (diagnostic.errorKind === 'accent') {
    return withDetectedContext(tag('orthography.accent', 'high'))
  }
  if (diagnostic.errorKind === 'punctuation') {
    return withDetectedContext(tag('orthography.punctuation', 'high'))
  }
  if (diagnostic.errorKind === 'auxiliary') {
    return withDetectedContext(tag('compound.auxiliary', 'high', {
      learnerAuxiliary: text(diagnostic.learnerAuxiliary),
      expectedAuxiliary: text(diagnostic.expectedAuxiliary),
    }))
  }
  if (diagnostic.errorKind === 'agreement') {
    const detectedAgreement = agreementTag(diagnostic)
    if (detectedAgreement) {
      if (diagnostic.agreementSource === 'subject' && !expectedUsesEtre(question)) {
        detectedAgreement.code = 'agreement.avoir_unwarranted'
      }
      return withDetectedContext(detectedAgreement)
    }
  }
  if (diagnostic.errorKind === 'ending') {
    return withDetectedContext(tag('morphology.ending', 'high', {
      learnerEnding: text(diagnostic.learnerEnding),
      expectedEnding: text(diagnostic.expectedEnding),
    }))
  }
  if (diagnostic.errorKind === 'close-form') {
    return withDetectedContext(tag('input.close_form', 'medium'))
  }
  if (copiedComplement) {
    return uniqueTags([
      copiedComplement,
      ...(independentAgreement ? [independentAgreement] : []),
    ])
  }
  return withDetectedContext(tag('unknown', 'low'))
}

export function learnerErrorLabels(
  answer: string,
  question: ExerciseQuestion,
): string[] {
  return learnerErrorDetails(answer, question).map(detail => detail.label)
}

export function learnerErrorDetails(
  answer: string,
  question: ExerciseQuestion,
): LearnerErrorDetail[] {
  const labels = new Map(LEARNER_ERROR_TAXONOMY.map(item => [item.code, item.label]))
  return diagnoseLearnerError(answer, question)
    .filter(item => item.code !== 'unknown')
    .flatMap((item): LearnerErrorDetail[] => {
      const label = labels.get(item.code)
      if (!label) return []
      if (item.code === 'person.other_form'
        && item.evidence?.detectedPerson
        && item.evidence?.expectedPerson) {
        const usesEndingComparison = item.evidence.detectedEnding && item.evidence.expectedEnding
        return [{
          code: item.code,
          label,
          message: usesEndingComparison
            ? `Tu as confondu la terminaison de « ${item.evidence.detectedPerson} » avec celle de « ${item.evidence.expectedPerson} ».`
            : 'Tu as confondu les personnes.',
          learnerValue: usesEndingComparison
            ? `${item.evidence.detectedEnding} (${item.evidence.detectedPerson})`
            : item.evidence.detectedPerson,
          expectedValue: usesEndingComparison
            ? `${item.evidence.expectedEnding} (${item.evidence.expectedPerson})`
            : item.evidence.expectedPerson,
        }]
      }
      if (item.code === 'morphology.ending') {
        return [{
          code: item.code,
          label,
          message: 'La terminaison n’est pas la bonne.',
          ...(item.evidence?.learnerEnding ? { learnerValue: `-${item.evidence.learnerEnding}` } : {}),
          ...(item.evidence?.expectedEnding ? { expectedValue: `-${item.evidence.expectedEnding}` } : {}),
        }]
      }
      const evidence = item.evidence || {}
      const message = (() => {
        if (item.code === 'task.wrong_mode') {
          return evidence.detectedMode && evidence.expectedMode
            ? `Tu as utilisé le mode « ${evidence.detectedMode} », alors que le mode « ${evidence.expectedMode} » était demandé.`
            : 'Tu as utilisé un autre mode que celui qui était demandé.'
        }
        if (item.code === 'task.wrong_tense') {
          return evidence.detectedTense && evidence.expectedTense
            ? `Tu as utilisé le temps « ${evidence.detectedTense} », alors que le temps « ${evidence.expectedTense} » était demandé.`
            : 'Tu as utilisé un autre temps que celui qui était demandé.'
        }
        if (item.code === 'task.future_simple_for_near_future') {
          return 'Tu as employé le futur simple, alors qu’il fallait construire le futur proche avec « aller » suivi de l’infinitif.'
        }
        if (item.code === 'person.impossible_ending') {
          return evidence.ending && evidence.target
            ? `La terminaison « ${evidence.ending} » n’est pas possible avec ${evidence.target}.`
            : 'La terminaison utilisée n’est pas possible avec cette personne.'
        }
        if (item.code === 'compound.auxiliary') {
          return evidence.learnerAuxiliary && evidence.expectedAuxiliary
            ? `Tu as utilisé l’auxiliaire « ${evidence.learnerAuxiliary} », alors qu’il fallait « ${evidence.expectedAuxiliary} ».`
            : 'Tu n’as pas utilisé le bon auxiliaire pour construire ce temps composé.'
        }
        if (item.code === 'agreement.subject') {
          return 'Le participe passé n’était pas correctement accordé avec le sujet.'
        }
        if (item.code === 'agreement.cod_before') {
          return 'Le participe passé devait s’accorder avec le complément d’objet direct placé avant.'
        }
        if (item.code === 'agreement.cod_after') {
          return 'Tu as accordé le participe passé avec un complément placé après, alors qu’il devait rester invariable.'
        }
        if (item.code === 'agreement.coi') {
          return 'Tu as accordé le participe passé avec un complément indirect, qui ne commande jamais cet accord.'
        }
        if (item.code === 'agreement.avoir_unwarranted') {
          return 'Tu as accordé le participe passé employé avec « avoir », alors qu’aucun complément placé avant ne demandait cet accord.'
        }
        if (item.code === 'orthography.accent') {
          return 'La forme était correcte dans sa construction, mais un accent était incorrect ou manquant.'
        }
        if (item.code === 'orthography.copied_complement') {
          return evidence.complementFunction && evidence.learnerComplement && evidence.expectedComplement
            ? `Tu as fait une faute d’orthographe en recopiant le ${evidence.complementFunction} : « ${evidence.learnerComplement} » au lieu de « ${evidence.expectedComplement} ».`
            : 'Tu as fait une faute d’orthographe en recopiant le complément donné dans la phrase.'
        }
        if (item.code === 'orthography.punctuation') {
          return 'La forme était correcte, mais un signe comme une apostrophe ou un trait d’union était incorrect ou manquant.'
        }
        if (item.code === 'input.close_form') {
          return 'Ta réponse était proche de la bonne forme, mais elle contenait encore une différence orthographique.'
        }
        return label
      })()
      return [{ code: item.code, label, message }]
    })
}

export function mergeLearnerErrorDetails(...groups: LearnerErrorDetail[][]): LearnerErrorDetail[] {
  const details = new Map<string, LearnerErrorDetail>()
  for (const detail of groups.flat()) {
    if (!details.has(detail.code)) details.set(detail.code, detail)
  }
  return [...details.values()]
}

export function learnerErrorDetailText(detail: LearnerErrorDetail): string {
  return detail.learnerValue && detail.expectedValue
    ? `${detail.message} ${detail.learnerValue} à la place de ${detail.expectedValue}`
    : detail.message
}

export function applicableLearnerErrorTypes(question: ExerciseQuestion): LearnerErrorTypeCode[] {
  const codes: LearnerErrorTypeCode[] = [
    'task.wrong_mode',
    'task.wrong_tense',
    'orthography.accent',
    'orthography.punctuation',
    'input.close_form',
    'unknown',
  ]
  if (question.complement
    && question.complementPosition === 'after'
    && (question.complementFunction === 'cod' || question.complementFunction === 'coi')) {
    codes.push('orthography.copied_complement')
  }
  if (question.futureSimpleAnswers?.length) codes.push('task.future_simple_for_near_future')
  if (question.personId || question.pronom || question.saisiePrefixe) {
    codes.push('person.other_form', 'person.impossible_ending', 'morphology.ending')
  }
  if (question.isCompound) {
    codes.push(
      'compound.auxiliary',
      expectedUsesEtre(question) ? 'agreement.subject' : 'agreement.avoir_unwarranted',
    )
  }
  if (question.agreementReminder?.kind === 'cod-before') codes.push('agreement.cod_before')
  if (question.agreementReminder?.kind === 'cod-after') codes.push('agreement.cod_after')
  if (question.agreementReminder?.kind === 'coi') codes.push('agreement.coi')
  return [...new Set(codes)]
}
