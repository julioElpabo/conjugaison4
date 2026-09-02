import type { ExerciseQuestion } from '../types/conjugation'
import { SUBJECT_PRONOUN_PLACEHOLDER } from './answer'
import { withoutIndicativeMode } from './chat-mode-display'
import { withSentenceTerminalMark } from './sentence-punctuation'

export const SIMPLE_TENSE_BLANK = '________________________'
export const SUBJECT_PRONOUN_BLANK = SUBJECT_PRONOUN_PLACEHOLDER
export const COMPOUND_TENSE_GAP = '\u00a0'.repeat(8)
export const COMPOUND_TENSE_BLANK = `____________${COMPOUND_TENSE_GAP}_______________________`
export const PRESENT_GERUND_BLANK = COMPOUND_TENSE_BLANK
export const PAST_GERUND_BLANK = `____________${COMPOUND_TENSE_GAP}____________${COMPOUND_TENSE_GAP}_______________________`

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
    index === wordCount - 1 ? '_______________________' : '____________'
  )).join(COMPOUND_TENSE_GAP)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function templateWithInputPrefix(template: string, question: ExerciseQuestion) {
  const pronoun = question.pronom?.trim() || ''
  const inputPrefix = question.saisiePrefixe?.trim() || ''
  if (!pronoun || !inputPrefix || normalized(pronoun) === normalized(inputPrefix)) return template
  return template.replace(
    new RegExp(`^${escapeRegExp(pronoun)}(?=\\s|…|\\.)`, 'iu'),
    inputPrefix,
  )
}

function withMaskedSubject(sentence: string, question: ExerciseQuestion) {
  if (normalized(question.mode) === 'imperatif') return sentence
  const pronoun = question.pronom?.trim() || ''
  const candidates = [
    question.saisiePrefixe?.trim(),
    pronoun && startsWithVowelSound(pronoun) ? `qu'${pronoun}` : pronoun ? `que ${pronoun}` : '',
    pronoun,
  ]
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.length - left.length)
  for (const candidate of candidates) {
    const pattern = new RegExp(escapeRegExp(candidate).replace(/[’']/gu, "[’']"), 'giu')
    const matches = [...sentence.matchAll(pattern)]
    const match = matches.at(-1)
    if (!match || match.index === undefined) continue
    const replacement = /^(?:que\s+|qu['’])/iu.test(candidate)
      ? `que ${SUBJECT_PRONOUN_BLANK}`
      : SUBJECT_PRONOUN_BLANK
    return `${sentence.slice(0, match.index)}${replacement}${sentence.slice(match.index + match[0].length)}`
  }
  return sentence
}

export function coachQuestionBubbles(question: ExerciseQuestion, options: { omitIndicativeMode?: boolean } = {}): CoachQuestionBubbles {
  const sentenceTemplate = templateWithInputPrefix(
    question.consigne.split('|')[0]?.trim() || '',
    question,
  )
  const formulaPronoun = question.pronom
  const answerPronoun = normalized(question.mode) === 'imperatif'
    ? ''
    : question.saisiePrefixe ?? question.pronom
  const modeAndTense = [options.omitIndicativeMode ? '' : question.mode, question.temps].filter(Boolean).join(' ')
  const formula = [formulaPronoun, question.infinitif, modeAndTense].filter(Boolean).join(' | ')
  if (!formula) return { formula: question.consigne }

  const answerWordCount = expectedAnswerWordCount(question)
  const blank = answerBlank(answerWordCount)
  const hasBlank = /(?:…|\.{3,})/u.test(sentenceTemplate)
  const normalizedSentenceTemplate = sentenceTemplate.replace(/\s+/gu, ' ').trim()
  const blankPrefix = answerPronoun
    ? COMPOUND_TENSE_GAP
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
  sentence = withMaskedSubject(sentence, question)
  if (question.complementFunction === 'cod' || question.complementFunction === 'coi') {
    sentence = withSentenceTerminalMark(sentence, question.mode)
  }

  return {
    formula: options.omitIndicativeMode ? withoutIndicativeMode(formula) : formula,
    sentence: sentenceCase(sentence),
  }
}
