import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion, QuestionnaireRequest } from '../types/public-api'
import { useDatabase } from '../utils/database'
import { formatAnswer, formatConjugationQuestion } from './question-formatter'
import { formatNonFiniteQuestion } from './non-finite-formatter'
import { generatePronominalRow, type PronominalSourceRow } from './pronominal-formatter'
import { decodePronominalSelectionId } from '../../shared/utils/pronominal-selection'
import { TENSE_IDENTIFICATION_INSTRUCTION } from '../../shared/utils/exercise-instructions'

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

interface PronominalUseRow extends RowDataPacket {
  id: number
  infinitif_pronominal: string
  participe_present: string
  participe_passe: string
  type_h_initial: string | null
}

interface AuxiliaryFormRow extends RowDataPacket {
  personne_id: number
  mode_name: string
  temps_name: string
  conjugaison1: string
}

interface ComplementRow extends RowDataPacket {
  verbe_id: number
  fonction_objet: 'cod' | 'coi'
  preposition: string | null
  texte: string
  texte_antepose: string | null
  genre: string | null
  nombre: string | null
  poids: number
}

export class QuestionnaireSelectionError extends Error {}

function placeholders(values: readonly unknown[]) {
  return values.map(() => '?').join(', ')
}

function unique(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))]
}

function allowedPersons(value: string | number[] | null | undefined) {
  if (Array.isArray(value)) return value.map(Number)
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(Number) : null
  } catch {
    return null
  }
}

function shuffle<T>(values: T[]) {
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[values[index], values[other]] = [values[other]!, values[index]!]
  }
  return values
}

function randomComplement(rows: readonly ComplementRow[]) {
  const total = rows.reduce((sum, row) => sum + Math.max(1, Number(row.poids)), 0)
  let cursor = Math.random() * total
  for (const row of rows) {
    cursor -= Math.max(1, Number(row.poids))
    if (cursor < 0) return row
  }
  return rows[rows.length - 1] ?? null
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

export function allowsAnteposedComplement(row: Pick<ConjugationRow, 'is_compound' | 'mode_name'>) {
  return Boolean(row.is_compound) && normalized(row.mode_name) !== 'impératif'
}

export function hasVisibleAnteposedAgreement(candidate: Pick<ComplementRow, 'fonction_objet' | 'texte_antepose' | 'genre' | 'nombre'>) {
  const gender = candidate.genre ? normalized(candidate.genre).normalize('NFD').replace(/\p{Diacritic}/gu, '') : ''
  const number = candidate.nombre ? normalized(candidate.nombre) : ''
  return candidate.fonction_objet === 'cod'
    && Boolean(candidate.texte_antepose && candidate.genre && candidate.nombre)
    && (gender === 'feminin' || number === 'pluriel')
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

export function identificationQuestion(row: ConjugationRow): ExerciseQuestion {
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
    instruction: TENSE_IDENTIFICATION_INSTRUCTION,
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
  const verbIds = request.verbIds.filter(id => id > 0)
  const pronominalUseIds = request.verbIds
    .filter(id => id < 0)
    .map(decodePronominalSelectionId)
    .filter((id): id is number => id !== null)
  const [verbResult, pronominalResult, tenseResult] = await Promise.all([
    verbIds.length > 0
      ? database.execute<IdRow[]>(
          `SELECT id FROM verbes WHERE id IN (${placeholders(verbIds)}) AND est_archive = 0`,
          verbIds
        )
      : Promise.resolve([[]] as unknown as Awaited<ReturnType<typeof database.execute<IdRow[]>>>),
    pronominalUseIds.length > 0
      ? database.execute<IdRow[]>(
          `SELECT id FROM emplois_pronominaux
           WHERE id IN (${placeholders(pronominalUseIds)}) AND actif = 1 AND verbe_id IS NOT NULL`,
          pronominalUseIds
        )
      : Promise.resolve([[]] as unknown as Awaited<ReturnType<typeof database.execute<IdRow[]>>>),
    database.execute<TenseSelectionRow[]>(
      `SELECT t.id, t.name, m.name AS mode_name
       FROM temps t
       INNER JOIN modes m ON m.id = t.mode_id
       WHERE t.id IN (${placeholders(request.tenseIds)})`,
      request.tenseIds
    )
  ])

  if (verbResult[0].length !== verbIds.length
      || pronominalResult[0].length !== pronominalUseIds.length
      || verbIds.length + pronominalUseIds.length !== request.verbIds.length) {
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
  const verbIds = request.verbIds.filter(id => id > 0)
  const pronominalUseIds = request.verbIds
    .filter(id => id < 0)
    .map(decodePronominalSelectionId)
    .filter((id): id is number => id !== null)

  if (finiteTenses.length > 0) {
    const finiteIds = finiteTenses.map(row => Number(row.id))
    const pastSimpleClause = request.pastSimplePronouns === 'third-person-only'
      ? "AND (t.name NOT IN ('passé simple', 'passé antérieur') OR p.pronom IN ('il', 'ils'))"
      : ''
    const limit = Math.min(500, Math.max(request.questionCount * 4, request.questionCount))
    const rows: ConjugationRow[] = []
    if (verbIds.length > 0) {
      const [storedRows] = await database.execute<ConjugationRow[]>(`
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
      WHERE vc.verbe_id IN (${placeholders(verbIds)})
        AND vc.temp_id IN (${placeholders(finiteIds)})
        AND vc.conjugaison1 <> ''
        ${pastSimpleClause}
      ORDER BY RAND()
      LIMIT ${limit}
      `, [...verbIds, ...finiteIds])
      rows.push(...storedRows)
    }

    if (pronominalUseIds.length > 0) {
      const [sourceRows, auxiliaryForms] = await Promise.all([
        database.execute<PronominalSourceRow[]>(`
          SELECT vc.id, -ep.id AS verbe_id, vc.personne_id, vc.temp_id,
                 vc.conjugaison1 AS base_conjugaison1,
                 vc.conjugaison2 AS base_conjugaison2,
                 vc.conjugaison3 AS base_conjugaison3,
                 vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
                 ep.id AS pronominal_use_id, ep.infinitif_pronominal,
                 ep.regle_accord, ep.personnes_autorisees, base.type_h_initial,
                 base.infinitif, base.auxiliaire,
                 base.\`participe_passé\` AS participe_passe,
                 p.pronom, t.name AS temps_name,
                 t.isTempsCompose AS is_compound,
                 m.name AS mode_name
          FROM emplois_pronominaux ep
          INNER JOIN verbes base ON base.id = ep.verbe_id
          INNER JOIN verbesconjugues vc ON vc.verbe_id = base.id
          INNER JOIN personnes p ON p.id = vc.personne_id
          INNER JOIN temps t ON t.id = vc.temp_id
          INNER JOIN modes m ON m.id = t.mode_id
          WHERE ep.id IN (${placeholders(pronominalUseIds)})
            AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
            AND vc.temp_id IN (${placeholders(finiteIds)})
            AND vc.conjugaison1 <> ''
            ${pastSimpleClause}
          ORDER BY RAND()
          LIMIT ${limit}
        `, [...pronominalUseIds, ...finiteIds]),
        database.execute<AuxiliaryFormRow[]>(`
          SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
          FROM verbesconjugues vc
          INNER JOIN verbes v ON v.id = vc.verbe_id
          INNER JOIN temps t ON t.id = vc.temp_id
          INNER JOIN modes m ON m.id = t.mode_id
          WHERE v.infinitif = 'être' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
        `),
      ])
      rows.push(...sourceRows[0]
        .filter((row) => {
          const persons = allowedPersons(row.personnes_autorisees)
          return persons === null || persons.includes(Number(row.personne_id))
        })
        .map(row => generatePronominalRow(row, auxiliaryForms[0]))
        .filter(row => row.conjugaison1) as ConjugationRow[])
    }

    const complementsByVerb = new Map<number, ComplementRow[]>()
    if (request.exerciseKind === 'conjugation' && request.includeComplements && verbIds.length > 0) {
      const [complements] = await database.execute<ComplementRow[]>(`
        SELECT vs.verbe_id, cv.fonction_objet, cv.preposition, c.texte, c.texte_antepose, c.genre, c.nombre, c.poids
        FROM verbe_sens vs
        INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
        INNER JOIN complements_verbaux c ON c.construction_id=cv.id
        WHERE vs.verbe_id IN (${placeholders(verbIds)})
          AND cv.actif=1 AND cv.statut_validation='valide'
          AND cv.fonction_objet IN ('cod', 'coi')
          AND c.actif=1 AND c.statut_validation='valide'
        ORDER BY vs.verbe_id, c.id
      `, verbIds)
      for (const complement of complements) {
        const candidates = complementsByVerb.get(Number(complement.verbe_id)) ?? []
        candidates.push(complement)
        complementsByVerb.set(Number(complement.verbe_id), candidates)
      }
    }

    const rowsForQuestions = request.includeComplements && request.complementPlacement === 'before'
      ? rows.filter(row => Boolean(row.is_compound))
      : rows

    questions.push(...rowsForQuestions.map((row) => {
      const candidates = complementsByVerb.get(Number(row.verbe_id)) ?? []
      const anteposable = !allowsAnteposedComplement(row)
        ? []
        : candidates.filter(hasVisibleAnteposedAgreement)
      const useBefore = allowsAnteposedComplement(row) && request.complementPlacement === 'before'
        ? anteposable.length > 0
        : allowsAnteposedComplement(row) && request.complementPlacement === 'mixed'
          && anteposable.length > 0 && Math.random() < 0.5
      const complement = randomComplement(useBefore ? anteposable : candidates)
      const enrichedRow = complement
        ? {
            ...row,
            complement_phrase: complement.texte,
            complement_position: useBefore ? 'before' as const : 'after' as const,
            complement_anteposed: useBefore ? complement.texte_antepose : null,
            complement_gender: useBefore ? complement.genre : null,
            complement_number: useBefore ? complement.nombre : null,
            complement_function: complement.fonction_objet,
            complement_preposition: complement.preposition,
          }
        : row
      return request.exerciseKind === 'conjugation'
        ? formatConjugationQuestion(enrichedRow, choosePronoun(row.pronom, request.inclusivePronouns))
        : identificationQuestion(row)
    }))
  }

  if (nonFiniteTenses.length > 0 && request.exerciseKind === 'conjugation'
      && !(request.includeComplements && request.complementPlacement === 'before')) {
    const verbs: NonFiniteVerbRow[] = []
    if (verbIds.length > 0) {
      const [storedVerbs] = await database.execute<NonFiniteVerbRow[]>(`
      SELECT v.id, v.infinitif,
             v.\`participe_présent\` AS participe_present,
             v.\`participe_passé\` AS participe_passe,
             auxiliary.\`participe_présent\` AS auxiliaire_participe_present
      FROM verbes v
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      WHERE v.id IN (${placeholders(verbIds)})
      `, verbIds)
      verbs.push(...storedVerbs)
    }

    if (pronominalUseIds.length > 0) {
      const [uses] = await database.execute<PronominalUseRow[]>(`
        SELECT ep.id, ep.infinitif_pronominal,
               base.\`participe_présent\` AS participe_present,
               base.\`participe_passé\` AS participe_passe,
               base.type_h_initial
        FROM emplois_pronominaux ep
        INNER JOIN verbes base ON base.id = ep.verbe_id
        WHERE ep.id IN (${placeholders(pronominalUseIds)})
          AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
      `, pronominalUseIds)
      for (const use of uses) {
        const participles = use.participe_present.split('-').map(form => form.trim()).filter(Boolean)
        const pronominalParticiples = participles.map((form) => {
          const first = form.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
          const elide = 'aeiouy'.includes(first) || (first === 'h' && use.type_h_initial !== 'aspire')
          return `${elide ? "s'" : 'se '}${form}`
        })
        verbs.push({
          id: -Number(use.id),
          infinitif: use.infinitif_pronominal,
          participe_present: pronominalParticiples.join('-'),
          participe_passe: use.participe_passe,
          auxiliaire_participe_present: "s'étant",
        } as NonFiniteVerbRow)
      }
    }

    for (const verb of verbs) {
      for (const tense of nonFiniteTenses) {
        const question = formatNonFiniteQuestion(verb, tense)
        if (question) questions.push(question)
      }
    }
  }

  return shuffle(questions).slice(0, request.questionCount)
}
