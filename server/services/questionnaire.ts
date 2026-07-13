import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion, QuestionnaireRequest } from '../types/public-api'
import { useDatabase } from '../utils/database'
import { formatAnswer, formatConjugationQuestion } from './question-formatter'
import { formatNonFiniteQuestion } from './non-finite-formatter'

interface IdRow extends RowDataPacket { id: number }

interface TenseSelectionRow extends RowDataPacket {
  id: number
  name: string
  mode_name: string
}

interface ConjugationRow extends RowDataPacket {
  id: number
  verbe_id: number
  personne_id: number
  temp_id: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
  infinitif: string
  auxiliaire: string
  participe_present: string
  participe_passe: string
  auxiliaire_infinitif: string | null
  auxiliaire_participe_present: string | null
  pronom: string
  temps_name: string
  is_compound: number
  mode_name: string
}

interface NonFiniteVerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire_participe_present: string | null
}

export class QuestionnaireSelectionError extends Error {}

function placeholders(values: readonly unknown[]) {
  return values.map(() => '?').join(', ')
}

function unique(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))]
}

function shuffle<T>(values: T[]) {
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[values[index], values[other]] = [values[other]!, values[index]!]
  }
  return values
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

function startsWithVowel(value: string) {
  const first = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
  return 'aeiouy'.includes(first)
}

function choosePronoun(pronom: string, inclusive: boolean) {
  if (pronom === 'il') {
    return shuffle(inclusive ? ['il', 'elle', 'iel'] : ['il', 'elle'])[0]!
  }
  if (pronom === 'ils') {
    return shuffle(inclusive ? ['ils', 'elles', 'iels'] : ['ils', 'elles'])[0]!
  }
  return pronom
}

function articleForTense(tense: string, mode: string) {
  const article = startsWithVowel(tense) ? "L'" : 'Le '
  const normalizedMode = normalized(mode)
  if (normalizedMode === 'indicatif' || normalizedMode === 'impératif') {
    return `${article}${tense} de l'${normalizedMode}`
  }
  return `${article}${tense} du ${normalizedMode}`
}

function identificationQuestion(row: ConjugationRow): ExerciseQuestion {
  const pronoun = row.pronom
  const phrase = formatAnswer(pronoun, row.conjugaison1, row.mode_name)
  const tense = normalized(row.temps_name)
  const mode = normalized(row.mode_name)
  const correction = articleForTense(tense, mode)
  const answers = [
    `${tense} ${mode}`,
    `${mode} ${tense}`,
    correction,
    `${tense} ${mode === 'indicatif' || mode === 'impératif' ? "de l'" : 'du '}${mode}`
  ]
  if (tense === 'futur' && mode === 'indicatif') {
    answers.push('futur simple indicatif', 'indicatif futur simple', "futur simple de l'indicatif")
  }

  return {
    id: `t-${row.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    consigne: phrase,
    reponses: unique(answers),
    reponsesPourCorrige: [correction],
    infinitif: row.infinitif,
    pronom: pronoun,
    temps: row.temps_name,
    mode: row.mode_name,
    conjugaison1: row.conjugaison1,
    conjugaison2: row.conjugaison2 || '',
    conjugaison3: row.conjugaison3 || ''
  }
}

async function validateSelections(request: QuestionnaireRequest) {
  const database = useDatabase()
  const [verbResult, tenseResult] = await Promise.all([
    database.execute<IdRow[]>(
      `SELECT id FROM verbes WHERE id IN (${placeholders(request.verbIds)})`,
      request.verbIds
    ),
    database.execute<TenseSelectionRow[]>(
      `SELECT t.id, t.name, m.name AS mode_name
       FROM temps t
       INNER JOIN modes m ON m.id = t.mode_id
       WHERE t.id IN (${placeholders(request.tenseIds)})`,
      request.tenseIds
    )
  ])

  if (verbResult[0].length !== request.verbIds.length) {
    throw new QuestionnaireSelectionError('Un ou plusieurs verbes sont inconnus')
  }
  if (tenseResult[0].length !== request.tenseIds.length) {
    throw new QuestionnaireSelectionError('Un ou plusieurs temps sont inconnus')
  }
  return tenseResult[0]
}

export async function generateQuestionnaire(request: QuestionnaireRequest) {
  const selectedTenses = await validateSelections(request)
  const finiteTenses = selectedTenses.filter(row => !['participe', 'gérondif'].includes(normalized(row.mode_name)))
  const nonFiniteTenses = selectedTenses.filter(row => ['participe', 'gérondif'].includes(normalized(row.mode_name)))
  const database = useDatabase()
  const questions: ExerciseQuestion[] = []

  if (finiteTenses.length > 0) {
    const finiteIds = finiteTenses.map(row => Number(row.id))
    const pastSimpleClause = request.pastSimplePronouns === 'third-person-only'
      ? "AND (t.name NOT IN ('passé simple', 'passé antérieur') OR p.pronom IN ('il', 'ils'))"
      : ''
    const limit = Math.min(500, Math.max(request.questionCount * 4, request.questionCount))
    const [rows] = await database.execute<ConjugationRow[]>(`
      SELECT vc.id, vc.verbe_id, vc.personne_id, vc.temp_id,
             vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
             v.infinitif, v.auxiliaire,
             v.\`participe_présent\` AS participe_present,
             v.\`participe_passé\` AS participe_passe,
             auxiliary.infinitif AS auxiliaire_infinitif,
             auxiliary.\`participe_présent\` AS auxiliaire_participe_present,
             p.pronom, t.name AS temps_name,
             t.isTempsCompose AS is_compound,
             m.name AS mode_name
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      INNER JOIN personnes p ON p.id = vc.personne_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE vc.verbe_id IN (${placeholders(request.verbIds)})
        AND vc.temp_id IN (${placeholders(finiteIds)})
        AND vc.conjugaison1 <> ''
        ${pastSimpleClause}
      ORDER BY RAND()
      LIMIT ${limit}
    `, [...request.verbIds, ...finiteIds])

    questions.push(...rows.map(row => request.exerciseKind === 'conjugation'
      ? formatConjugationQuestion(row, choosePronoun(row.pronom, request.inclusivePronouns))
      : identificationQuestion(row)))
  }

  if (nonFiniteTenses.length > 0 && request.exerciseKind === 'conjugation') {
    const [verbs] = await database.execute<NonFiniteVerbRow[]>(`
      SELECT v.id, v.infinitif,
             v.\`participe_présent\` AS participe_present,
             v.\`participe_passé\` AS participe_passe,
             auxiliary.\`participe_présent\` AS auxiliaire_participe_present
      FROM verbes v
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      WHERE v.id IN (${placeholders(request.verbIds)})
    `, request.verbIds)

    for (const verb of verbs) {
      for (const tense of nonFiniteTenses) {
        const question = formatNonFiniteQuestion(verb, tense)
        if (question) questions.push(question)
      }
    }
  }

  return shuffle(questions).slice(0, request.questionCount)
}
