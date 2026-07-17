import type { ExerciseQuestion } from '../types/conjugation'

const ANSWER_DOTS = '.................................'
const GERUND_ANSWER_DOTS = '......................................'

export interface PrintableQuestionParts {
  label: string
  completion: string
  completionPrefix: string
  completionSuffix: string
  fillBlank: boolean
  suffixOnNextLine: boolean
  blankWidthPercent: number
}

const LONG_COMPLETION_SUFFIX_LENGTH = 32

function withSubjunctiveCue(sentence: string, question: ExerciseQuestion) {
  if (question.mode?.trim().toLocaleLowerCase('fr-CH') !== 'subjonctif'
      || question.complementPosition === 'before'
      || /^(?:que|qu['’])\s*/iu.test(sentence)) return sentence
  return `que ${sentence}`.replace(/^que (i(?:l|ls|el|els)|elle?s?|on)\b/iu, "qu'$1")
}

function completionParts(sentence: string, question: ExerciseQuestion) {
  const promptedSentence = withSubjunctiveCue(sentence.trim(), question)
  const [prefix = '', ...suffixParts] = promptedSentence.split('…')
  const rawSuffix = suffixParts.join('…').trim()
  const isImperative = question.mode?.trim().toLocaleLowerCase('fr-CH') === 'impératif'
  const suffix = isImperative && !rawSuffix.endsWith('!')
    ? `${rawSuffix}${rawSuffix ? ' ' : ''}!`
    : rawSuffix
  const completionPrefix = question.complementPosition !== 'before' && question.saisiePrefixe !== undefined
    ? question.saisiePrefixe.trim()
    : prefix.trim()
  const dots = ANSWER_DOTS
  const suffixOnNextLine = suffix.length > LONG_COMPLETION_SUFFIX_LENGTH
  const blankWidthPercent = suffixOnNextLine
    ? Math.max(32, Math.min(58, 72 - Math.round(suffix.length * .65)))
    : 100
  return {
    completionPrefix,
    completionSuffix: suffix,
    fillBlank: promptedSentence.includes('…') || suffixParts.length === 0,
    suffixOnNextLine,
    blankWidthPercent,
    completion: [completionPrefix, dots, suffix].filter(Boolean).join(' '),
  }
}

export function printableQuestionParts(question: ExerciseQuestion, exerciseKind: string): PrintableQuestionParts {
  if (exerciseKind === 'tense-identification') {
    return {
      label: '',
      completion: question.consigne,
      completionPrefix: question.consigne,
      completionSuffix: '',
      fillBlank: false,
      suffixOnNextLine: false,
      blankWidthPercent: 100,
    }
  }

  if (question.mode?.trim().toLocaleLowerCase('fr-CH') === 'gérondif') {
    const infinitive = question.infinitif || question.titre
    const tenseAndMode = [question.temps, `(${question.mode})`].filter(Boolean).join(' ')
    return {
      label: `${infinitive} | ${tenseAndMode} :`,
      completion: `en ${GERUND_ANSWER_DOTS}`,
      completionPrefix: 'en',
      completionSuffix: '',
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100,
    }
  }

  if (question.mode?.trim().toLocaleLowerCase('fr-CH') === 'participe') {
    const infinitive = question.infinitif || question.titre
    const tenseAndMode = [question.temps, `(${question.mode})`].filter(Boolean).join(' ')
    return {
      label: `${infinitive} | ${tenseAndMode} :`,
      completion: ANSWER_DOTS,
      completionPrefix: '',
      completionSuffix: '',
      fillBlank: true,
      suffixOnNextLine: false,
      blankWidthPercent: 100,
    }
  }

  const parts = question.consigne.split('|').map(part => part.trim())
  if (parts.length < 3) {
    return {
      label: '',
      completion: question.consigne,
      completionPrefix: question.consigne,
      completionSuffix: '',
      fillBlank: false,
      suffixOnNextLine: false,
      blankWidthPercent: 100,
    }
  }

  const sentence = parts.slice(0, -2).join(' | ')
  const infinitive = parts.at(-2) || question.infinitif || ''
  const tenseAndMode = parts.at(-1) || [question.temps, question.mode ? `(${question.mode})` : ''].filter(Boolean).join(' ')
  const completion = completionParts(sentence, question)

  return {
    label: `${infinitive} | ${tenseAndMode} :`,
    ...completion,
  }
}

export function printableQuestion(question: ExerciseQuestion, exerciseKind: string): string {
  const parts = printableQuestionParts(question, exerciseKind)
  return [parts.label, parts.completion].filter(Boolean).join(' ')
}

export function printableCorrectionAnswers(question: ExerciseQuestion): string[] {
  const answers = [...new Set(question.reponsesPourCorrige.map(answer => answer.trim()).filter(Boolean))]
  if (question.isCompound && answers.length > 1) return answers.slice(0, 1)
  return answers
}

export function printableCorrectionLabel(question: ExerciseQuestion, exerciseKind: string): string {
  if (['gérondif', 'participe'].includes(question.mode?.trim().toLocaleLowerCase('fr-CH') || '')) return question.consigne
  const parts = printableQuestionParts(question, exerciseKind)
  return parts.label || parts.completion
}

export function printableCorrectionText(question: ExerciseQuestion): string {
  return printableCorrectionAnswers(question).join('\n')
}
