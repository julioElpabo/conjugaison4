import type { ExerciseQuestion } from '../types/conjugation'
import { normalizeAnswer } from './answer'

/** Ne reconnaît une autre analyse que si la même forme existe dans les données. */
export function subjunctiveIdentificationExample(question: ExerciseQuestion, answer: string): string | null {
  if (question.literaryCitation || normalizeAnswer(question.mode || '') !== 'indicatif') return null
  const submitted = normalizeAnswer(answer)
  if (!submitted.includes('subjonctif')) return null
  const alternative = question.conjugationConfusions?.find(candidate =>
    normalizeAnswer(candidate.mode) === 'subjonctif'
    && submitted.includes(normalizeAnswer(candidate.tense))
    && candidate.answers.some(form => normalizeAnswer(form.replace(/^qu['’]|^que\s+/iu, '')) === normalizeAnswer(question.consigne)),
  )
  if (!alternative) return null
  const matching = alternative.answers.find(form =>
    normalizeAnswer(form.replace(/^qu['’]|^que\s+/iu, '')) === normalizeAnswer(question.consigne),
  )!
  return `il faut ${matching}`
}
