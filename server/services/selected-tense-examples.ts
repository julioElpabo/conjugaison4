import type { ExerciseQuestion } from '../../shared/types/conjugation'
import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'
import { generateQuestionnaire } from './questionnaire'

interface CodRow extends RowDataPacket {
  verbe_id: number
  texte: string
}

export interface SelectedTenseExample {
  emphasis: string
  rest: string
}

function asSentence(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const sentence = /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`
  return sentence.charAt(0).toLocaleUpperCase('fr') + sentence.slice(1)
}

export function examplesFromQuestions(
  tenseIds: readonly number[],
  questions: readonly ExerciseQuestion[],
  codByVerb: Readonly<Record<number, string>> = {},
) {
  return Object.fromEntries(tenseIds.flatMap((tenseId) => {
    const candidates = questions.filter(question => Number(question.tenseId) === tenseId)
    const chosen = candidates.find(question => Boolean(question.complement)) ?? candidates[0]
    const rawCorrection = chosen?.reponsesPourCorrige[0]
    const complement = chosen?.verbeId ? codByVerb[chosen.verbeId] : undefined
    const correction = rawCorrection && complement && !chosen?.complement
      ? withComplement(rawCorrection, complement)
      : rawCorrection
    return correction ? [[tenseId, splitSentence(correction, chosen?.complement ?? complement)]] : []
  }))
}

function splitSentence(answer: string, complement?: string): SelectedTenseExample {
  const sentence = asSentence(answer)
  if (!complement) return { emphasis: sentence, rest: '' }
  const complementIndex = sentence.lastIndexOf(complement)
  if (complementIndex < 0) return { emphasis: sentence, rest: '' }
  return {
    emphasis: sentence.slice(0, complementIndex).trimEnd(),
    rest: sentence.slice(complementIndex).trimStart(),
  }
}

function withComplement(answer: string, complement: string) {
  const punctuation = answer.match(/[!?]$/u)?.[0] ?? ''
  const stem = punctuation ? answer.slice(0, -1).trimEnd() : answer
  return `${stem} ${complement}${punctuation}`
}

async function loadCodByVerb(verbIds: number[]) {
  const storedIds = verbIds.filter(id => id > 0)
  if (!storedIds.length) return {}
  const placeholders = storedIds.map(() => '?').join(', ')
  const [rows] = await useDatabase().execute<CodRow[]>(`
    SELECT vs.verbe_id, c.texte
    FROM verbe_sens vs
    INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
    INNER JOIN complements_verbaux c ON c.construction_id=cv.id
    WHERE vs.verbe_id IN (${placeholders})
      AND cv.actif=1 AND cv.statut_validation='valide' AND cv.fonction_objet='cod'
      AND c.actif=1 AND c.statut_validation='valide'
    ORDER BY RAND()
  `, storedIds)
  const result: Record<number, string> = {}
  for (const row of rows) result[Number(row.verbe_id)] ??= row.texte
  return result
}

function questionnaireRequest(verbIds: number[], tenseIds: number[], questionCount: number) {
  return {
    verbIds,
    tenseIds,
    questionCount,
    exerciseKind: 'conjugation' as const,
    pastSimplePronouns: 'all' as const,
    inclusivePronouns: false,
    includeComplements: true,
    complementPlacement: 'after' as const,
  }
}

export async function buildSelectedTenseExamples(verbIds: number[], tenseIds: number[]) {
  const [questions, codByVerb] = await Promise.all([
    generateQuestionnaire(questionnaireRequest(verbIds, tenseIds, 500)),
    loadCodByVerb(verbIds),
  ])
  const examples = examplesFromQuestions(tenseIds, questions, codByVerb)
  const missingTenseIds = tenseIds.filter(tenseId => !examples[tenseId])

  if (missingTenseIds.length) {
    const missingQuestions = await Promise.all(missingTenseIds.map(tenseId => (
      generateQuestionnaire(questionnaireRequest(verbIds, [tenseId], 100))
    )))
    Object.assign(examples, examplesFromQuestions(missingTenseIds, missingQuestions.flat(), codByVerb))
  }

  return examples
}
