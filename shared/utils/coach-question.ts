import type { ExerciseQuestion } from '../types/conjugation'
import { withoutIndicativeMode } from './chat-mode-display'

export const SIMPLE_TENSE_BLANK = '........................'
export const COMPOUND_TENSE_GAP = '\u00a0\u00a0\u00a0\u00a0'
export const COMPOUND_TENSE_BLANK = `............${COMPOUND_TENSE_GAP}.......................`

export interface CoachQuestionBubbles {
  formula: string
  sentence?: string
}

function sentenceCase(value: string) {
  return value ? `${value.charAt(0).toLocaleUpperCase('fr')}${value.slice(1)}` : value
}

export function coachQuestionBubbles(question: ExerciseQuestion, options: { omitIndicativeMode?: boolean } = {}): CoachQuestionBubbles {
  const sentenceTemplate = question.consigne.split('|')[0]?.trim() || ''
  const modeAndTense = [options.omitIndicativeMode ? '' : question.mode, question.temps].filter(Boolean).join(' ')
  const formula = [question.pronom, question.infinitif, modeAndTense].filter(Boolean).join(' | ')
  if (!formula) return { formula: question.consigne }

  const blank = question.isCompound ? COMPOUND_TENSE_BLANK : SIMPLE_TENSE_BLANK
  const hasBlank = /(?:…|\.{3,})/u.test(sentenceTemplate)
  const normalizedSentenceTemplate = sentenceTemplate.replace(/\s+/gu, ' ').trim()
  const blankPrefix = question.isCompound ? COMPOUND_TENSE_GAP : ' '
  const sentence = hasBlank
    ? normalizedSentenceTemplate.replace(/\s*(?:…|\.{3,})/gu, `${blankPrefix}${blank}`).trimStart()
    : `${question.pronom || ''}${blankPrefix}${blank}`.trimStart()

  return {
    formula: options.omitIndicativeMode ? withoutIndicativeMode(formula) : formula,
    sentence: sentenceCase(sentence),
  }
}
