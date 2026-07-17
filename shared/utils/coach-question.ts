import type { ExerciseQuestion } from '../types/conjugation'

export const SIMPLE_TENSE_BLANK = '........................'
export const COMPOUND_TENSE_BLANK = '... ..................'

export interface CoachQuestionBubbles {
  formula: string
  sentence?: string
}

function sentenceCase(value: string) {
  return value ? `${value.charAt(0).toLocaleUpperCase('fr')}${value.slice(1)}` : value
}

export function coachQuestionBubbles(question: ExerciseQuestion): CoachQuestionBubbles {
  const sentenceTemplate = question.consigne.split('|')[0]?.trim() || ''
  const modeAndTense = [question.mode, question.temps].filter(Boolean).join(' ')
  const formula = [question.pronom, question.infinitif, modeAndTense].filter(Boolean).join(' | ')
  if (!formula) return { formula: question.consigne }

  const blank = question.isCompound ? COMPOUND_TENSE_BLANK : SIMPLE_TENSE_BLANK
  const hasBlank = /(?:…|\.{3,})/u.test(sentenceTemplate)
  const sentence = hasBlank
    ? sentenceTemplate.replace(/(?:…|\.{3,})/gu, blank).replace(/\s+/gu, ' ').trim()
    : `${question.pronom || ''} ${blank}`.trim()

  return { formula, sentence: sentenceCase(sentence) }
}
