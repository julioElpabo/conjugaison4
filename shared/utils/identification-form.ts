import type { ExerciseQuestion } from '../types/conjugation'
import { grammarTenseCode } from './grammar-codes'

export interface IdentificationFormParts {
  before: string
  target: string
  after: string
}

/** Découpe l'énoncé afin de pouvoir surligner uniquement la forme interrogée. */
export function identificationFormParts(question: ExerciseQuestion): IdentificationFormParts | null {
  if (question.literaryCitation) {
    return {
      before: question.literaryCitation.before,
      target: question.literaryCitation.target,
      after: question.literaryCitation.after,
    }
  }

  const text = question.consigne || ''
  const conjugatedForms = [question.conjugaison1, question.conjugaison2, question.conjugaison3]
    .filter((form): form is string => Boolean(form?.trim()))
    .sort((left, right) => right.length - left.length)

  for (const form of conjugatedForms) {
    const index = text.indexOf(form)
    if (index >= 0) {
      return {
        before: text.slice(0, index),
        target: text.slice(index, index + form.length),
        after: text.slice(index + form.length),
      }
    }
  }

  return inferredFormAfterSubject(question, text)
}

function inferredFormAfterSubject(question: ExerciseQuestion, text: string): IdentificationFormParts | null {
  const pronoun = question.pronom?.trim()
  if (!pronoun || !text) return null

  const escapedPronoun = pronoun.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  const subjectPattern = pronoun.toLocaleLowerCase('fr') === 'je'
    ? /(^|[^\p{L}\p{N}])(je\s+|j[’'])/giu
    : new RegExp(`(^|[^\\p{L}\\p{N}])(${escapedPronoun})(?=$|[^\\p{L}\\p{N}])`, 'giu')
  const subjectMatch = subjectPattern.exec(text)
  if (!subjectMatch) return null

  const subjectEnd = subjectMatch.index + subjectMatch[0].length
  const following = text.slice(subjectEnd)
  const leadingWhitespace = following.match(/^\s*/u)?.[0].length || 0
  const targetStart = subjectEnd + leadingWhitespace
  const compoundTenseCodes = new Set([
    'compound-past',
    'pluperfect',
    'past-anterior',
    'future-perfect',
    'past',
    'past-first-form',
    'past-second-form',
  ])
  const tenseCode = grammarTenseCode(question.temps)
  const wordsToTake = question.isCompound || (tenseCode && compoundTenseCodes.has(tenseCode)) ? 2 : 1
  let targetEnd = targetStart
  let remaining = text.slice(targetStart)

  for (let index = 0; index < wordsToTake; index += 1) {
    const word = remaining.match(/^[\p{L}]+(?:[’'-][\p{L}]+)*/u)?.[0]
    if (!word) return null
    targetEnd += word.length
    if (index === wordsToTake - 1) break
    remaining = text.slice(targetEnd)
    const separator = remaining.match(/^\s+/u)?.[0]
    if (!separator) return null
    targetEnd += separator.length
    remaining = text.slice(targetEnd)
  }

  return {
    before: text.slice(0, targetStart),
    target: text.slice(targetStart, targetEnd),
    after: text.slice(targetEnd),
  }
}
