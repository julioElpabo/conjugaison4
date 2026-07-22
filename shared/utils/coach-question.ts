import type { ExerciseQuestion } from '../types/conjugation'
import { withoutIndicativeMode } from './chat-mode-display'

export const SIMPLE_TENSE_BLANK = '........................'
export const COMPOUND_TENSE_GAP = '\u00a0\u00a0\u00a0\u00a0'
export const COMPOUND_TENSE_BLANK = `............${COMPOUND_TENSE_GAP}.......................`
export const PRESENT_GERUND_BLANK = COMPOUND_TENSE_BLANK
export const PAST_GERUND_BLANK = `............${COMPOUND_TENSE_GAP}............${COMPOUND_TENSE_GAP}.......................`

export interface CoachQuestionBubbles {
  formula: string
  sentence?: string
}

function sentenceCase(value: string) {
  return value ? `${value.charAt(0).toLocaleUpperCase('fr')}${value.slice(1)}` : value
}

function normalized(value?: string) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr-CH')
}

function subjunctiveLead(tense?: string) {
  const pastContext = ['imparfait', 'plus-que-parfait'].includes(normalized(tense))
  return pastContext ? 'Il fallait' : 'Il faut'
}

function startsWithVowelSound(value: string) {
  return /^[aeiouyhéèêëîïôöùûü]|^on\b/iu.test(value.trim())
}

function subjunctiveSubject(question: ExerciseQuestion) {
  const pronoun = question.pronom?.trim() || ''
  const lead = subjunctiveLead(question.temps)
  if (!pronoun) return `${lead} que`
  return startsWithVowelSound(pronoun) ? `${lead} qu'${pronoun}` : `${lead} que ${pronoun}`
}

function contextualizeSubjunctiveTemplate(template: string, question: ExerciseQuestion) {
  const pronoun = question.pronom?.trim() || ''
  const contextualSubject = subjunctiveSubject(question)
  if (!pronoun) return `${contextualSubject} ${template}`

  const lowerTemplate = template.toLocaleLowerCase('fr-CH')
  const candidates = [`que ${pronoun}`, `qu'${pronoun}`, `qu’${pronoun}`, pronoun]
    .sort((left, right) => right.length - left.length)
  const matchedPrefix = candidates.find(candidate => lowerTemplate.startsWith(candidate.toLocaleLowerCase('fr-CH')))
  return matchedPrefix
    ? `${contextualSubject}${template.slice(matchedPrefix.length)}`
    : `${subjunctiveLead(question.temps)} que ${template}`
}

function expectedAnswerWordCount(question: ExerciseQuestion) {
  const displayedForm = question.conjugaison1?.trim()
  if (displayedForm) return displayedForm.split(/\s+/u).length

  const mode = question.mode?.trim().toLocaleLowerCase('fr-CH') || ''
  const tense = question.temps?.trim().toLocaleLowerCase('fr-CH') || ''
  if (mode === 'gérondif') return tense === 'passé' ? 3 : 2
  return question.isCompound ? 2 : 1
}

function answerBlank(wordCount: number) {
  if (wordCount <= 1) return SIMPLE_TENSE_BLANK
  return Array.from({ length: wordCount }, (_, index) => (
    index === wordCount - 1 ? '.......................' : '............'
  )).join(COMPOUND_TENSE_GAP)
}

export function coachQuestionBubbles(question: ExerciseQuestion, options: { omitIndicativeMode?: boolean, modeLabel?: string, tenseLabel?: string } = {}): CoachQuestionBubbles {
  const sentenceTemplate = question.consigne.split('|')[0]?.trim() || ''
  const formulaPronoun = question.pronom
  const answerPronoun = normalized(question.mode) === 'imperatif' ? '' : question.pronom
  const modeAndTense = [options.omitIndicativeMode ? '' : options.modeLabel || question.mode, options.tenseLabel || question.temps].filter(Boolean).join(' ')
  const formula = [formulaPronoun, question.infinitif, modeAndTense].filter(Boolean).join(' | ')
  if (!formula) return { formula: question.consigne }

  const answerWordCount = expectedAnswerWordCount(question)
  const blank = answerBlank(answerWordCount)
  const hasBlank = /(?:…|\.{3,})/u.test(sentenceTemplate)
  const normalizedSentenceTemplate = sentenceTemplate.replace(/\s+/gu, ' ').trim()
  const blankPrefix = answerPronoun
    ? answerWordCount > 1 ? COMPOUND_TENSE_GAP : ' '
    : ''
  let sentence = hasBlank
    ? normalizedSentenceTemplate.replace(/\s*(?:…|\.{3,})/gu, `${blankPrefix}${blank}`).trimStart()
    : `${answerPronoun || ''}${blankPrefix}${blank}`.trimStart()
  if (normalized(question.mode) === 'subjonctif') {
    const alreadyContextualizedRelative = question.complementPosition === 'before'
      && /^(?:c['’]est|ce sont)\b/iu.test(sentence)
    sentence = alreadyContextualizedRelative
      ? sentence
      : hasBlank
      ? contextualizeSubjunctiveTemplate(sentence, question)
      : `${subjunctiveSubject(question)}${blankPrefix}${blank}`
  }

  return {
    formula: options.omitIndicativeMode ? withoutIndicativeMode(formula) : formula,
    sentence: sentenceCase(sentence),
  }
}
