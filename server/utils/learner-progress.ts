import { createHash } from 'node:crypto'
import type { ExerciseQuestion, LearnerChallengeSnapshot } from '~~/shared/types/conjugation'

const SAFE_IDENTIFIER = /^[A-Za-z0-9_-]{8,100}$/u
const SAFE_FINGERPRINT = /^[a-f0-9]{64}$/u

export function learnerRunIdentifier(value: unknown) {
  const candidate = typeof value === 'string' ? value.trim() : ''
  if (!SAFE_IDENTIFIER.test(candidate)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de séance invalide' })
  }
  return candidate
}

export function learnerAttemptIdentifier(value: unknown) {
  return learnerRunIdentifier(value)
}

function integerList(value: unknown, maximum = 1000) {
  if (!Array.isArray(value)) return []
  return [...new Set(value
    .map(item => Number(item))
    .filter(item => Number.isInteger(item) && item > 0 && item <= 10_000_000))]
    .slice(0, maximum)
}

export function learnerChallengeSnapshot(value: unknown): LearnerChallengeSnapshot {
  if (!value || typeof value !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Défi invalide' })
  }
  const candidate = value as Record<string, unknown>
  const exerciseKind = candidate.exerciseKind === 'tense-identification'
    || candidate.exerciseKind === 'mode-identification'
    ? candidate.exerciseKind
    : 'conjugation'
  const questionCount = Math.min(200, Math.max(1, Number(candidate.questionCount) || 1))
  const description = typeof candidate.description === 'string'
    ? candidate.description.trim().slice(0, 1000)
    : ''
  const trainingReportTitle = typeof candidate.trainingReportTitle === 'string'
    ? candidate.trainingReportTitle.trim().slice(0, 200)
    : ''
  return {
    ...(description ? { description } : {}),
    ...(trainingReportTitle ? { trainingReportTitle } : {}),
    verbIds: integerList(candidate.verbIds),
    tenseIds: integerList(candidate.tenseIds),
    questionCount,
    exerciseKind,
    identificationSource: candidate.identificationSource === 'literary-corpus'
      ? 'literary-corpus'
      : 'selected-verbs',
    pastSimplePronouns: candidate.pastSimplePronouns === 'third-person-only'
      ? 'third-person-only'
      : 'all',
    inclusivePronouns: candidate.inclusivePronouns === true,
    includeOnPronoun: candidate.includeOnPronoun === true,
    includeComplements: candidate.includeComplements === true,
    complementPlacement: ['after', 'mixed', 'before'].includes(String(candidate.complementPlacement))
      ? candidate.complementPlacement as 'after' | 'mixed' | 'before'
      : 'after',
    complementOptions: Array.isArray(candidate.complementOptions)
      ? candidate.complementOptions
          .filter(item => ['cod-after', 'cod-before', 'coi-after', 'coi-before'].includes(String(item)))
          .slice(0, 4) as LearnerChallengeSnapshot['complementOptions']
      : [],
  }
}

export function learnerChallengeFingerprint(snapshot: LearnerChallengeSnapshot, supplied?: unknown) {
  if (typeof supplied === 'string' && SAFE_FINGERPRINT.test(supplied)) return supplied
  const {
    description: _description,
    trainingReportTitle: _trainingReportTitle,
    ...challengeDefinition
  } = snapshot
  const stable = {
    ...challengeDefinition,
    verbIds: [...snapshot.verbIds].sort((left, right) => left - right),
    tenseIds: [...snapshot.tenseIds].sort((left, right) => left - right),
    complementOptions: [...(snapshot.complementOptions || [])].sort(),
  }
  return createHash('sha256').update(JSON.stringify(stable)).digest('hex')
}

function shortText(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function boundedText(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.slice(0, maximum) : ''
}

export function learnerQuestionSnapshot(value: unknown): ExerciseQuestion {
  if (!value || typeof value !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Question invalide' })
  }
  const question = value as Record<string, unknown>
  const answers = Array.isArray(question.reponses)
    ? question.reponses.map(item => shortText(item, 300)).filter(Boolean).slice(0, 8)
    : []
  const correctionAnswers = Array.isArray(question.reponsesPourCorrige)
    ? question.reponsesPourCorrige.map(item => shortText(item, 500)).filter(Boolean).slice(0, 8)
    : []
  const futureSimpleAnswers = Array.isArray(question.futureSimpleAnswers)
    ? question.futureSimpleAnswers.map(item => shortText(item, 300)).filter(Boolean).slice(0, 8)
    : []
  const conjugationConfusions = Array.isArray(question.conjugationConfusions)
    ? question.conjugationConfusions.flatMap((candidate) => {
        if (!candidate || typeof candidate !== 'object') return []
        const source = candidate as Record<string, unknown>
        const answers = Array.isArray(source.answers)
          ? source.answers.map(item => shortText(item, 300)).filter(Boolean).slice(0, 8)
          : []
        const tense = shortText(source.tense, 100)
        const mode = shortText(source.mode, 100)
        return tense && mode && answers.length ? [{ tense, mode, answers }] : []
      }).slice(0, 40)
    : []
  if (!answers.length && !correctionAnswers.length) {
    throw createError({ statusCode: 400, statusMessage: 'Réponses de la question manquantes' })
  }
  const number = (candidate: unknown) => {
    const parsed = Number(candidate)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
  const radicalReference = question.radicalReference && typeof question.radicalReference === 'object'
    ? question.radicalReference as Record<string, unknown>
    : null
  const paradigmForms = Array.isArray(radicalReference?.paradigmForms)
    ? radicalReference.paradigmForms.flatMap((candidate) => {
        if (!candidate || typeof candidate !== 'object') return []
        const source = candidate as Record<string, unknown>
        const subject = shortText(source.subject, 100)
        const form = shortText(source.form, 300)
        const personId = number(source.personId)
        return subject && form && personId ? [{ subject, form, personId }] : []
      }).slice(0, 12)
    : []
  const agreement = question.agreementReminder && typeof question.agreementReminder === 'object'
    ? question.agreementReminder as Record<string, unknown>
    : null
  const agreementKind = ['cod-before', 'cod-after', 'coi'].includes(String(agreement?.kind))
    ? agreement?.kind as 'cod-before' | 'cod-after' | 'coi'
    : null
  const citation = question.literaryCitation && typeof question.literaryCitation === 'object'
    ? question.literaryCitation as Record<string, unknown>
    : null
  const citationTarget = shortText(citation?.target, 200)
  return {
    titre: shortText(question.titre, 300),
    instruction: shortText(question.instruction, 300) || undefined,
    consigne: shortText(question.consigne, 500),
    reponses: answers,
    reponsesPourCorrige: correctionAnswers,
    futureSimpleAnswers: futureSimpleAnswers.length ? futureSimpleAnswers : undefined,
    conjugationConfusions: conjugationConfusions.length ? conjugationConfusions : undefined,
    verbeId: number(question.verbeId),
    tenseId: number(question.tenseId),
    personId: number(question.personId) ?? null,
    infinitif: shortText(question.infinitif, 100) || undefined,
    pronom: shortText(question.pronom, 100) || undefined,
    temps: shortText(question.temps, 100) || undefined,
    mode: shortText(question.mode, 100) || undefined,
    isCompound: question.isCompound === true,
    conjugaison1: shortText(question.conjugaison1, 300) || undefined,
    conjugaison2: shortText(question.conjugaison2, 300) || undefined,
    conjugaison3: shortText(question.conjugaison3, 300) || undefined,
    radicalReference: paradigmForms.length
      ? {
          kind: 'memorized-form',
          label: '',
          form: '',
          removableEnding: '',
          radical: '',
          paradigmForms,
        }
      : undefined,
    complement: shortText(question.complement, 300) || undefined,
    complementPosition: question.complementPosition === 'before' ? 'before' : question.complementPosition === 'after' ? 'after' : undefined,
    complementFunction: question.complementFunction === 'coi' ? 'coi' : question.complementFunction === 'cod' ? 'cod' : undefined,
    saisiePrefixe: shortText(question.saisiePrefixe, 200) || undefined,
    agreementReminder: agreementKind
      ? {
          kind: agreementKind,
          infinitive: shortText(agreement?.infinitive, 100),
          complement: shortText(agreement?.complement, 300),
          preposition: shortText(agreement?.preposition, 50) || null,
          participle: shortText(agreement?.participle, 100),
          gender: agreement?.gender === 'feminin' || agreement?.gender === 'masculin'
            ? agreement.gender
            : null,
          number: agreement?.number === 'pluriel' || agreement?.number === 'singulier'
            ? agreement.number
            : null,
      }
      : undefined,
    literaryCitation: citation && citationTarget
      ? {
          before: boundedText(citation.before, 500),
          target: citationTarget,
          after: boundedText(citation.after, 500),
          author: shortText(citation.author, 200),
          work: shortText(citation.work, 300),
          chapter: shortText(citation.chapter, 200) || null,
          sourceUrl: shortText(citation.sourceUrl, 500),
        }
      : undefined,
  }
}

export function learnerFormKey(question: ExerciseQuestion, exerciseKind: string) {
  const source = [
    exerciseKind,
    question.verbeId || question.infinitif || '',
    question.tenseId || question.temps || '',
    question.personId || question.pronom || question.saisiePrefixe || '',
    question.reponses[0] || question.reponsesPourCorrige[0] || '',
  ].join('|')
  return createHash('sha256').update(source).digest('hex')
}

export function learnerChallengeLabel(value: unknown) {
  const label = shortText(value, 160)
  return label || 'Défi personnalisé'
}
