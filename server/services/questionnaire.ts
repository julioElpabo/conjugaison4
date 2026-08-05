import type { RowDataPacket } from 'mysql2/promise'
import type { ExerciseQuestion, QuestionnaireRequest } from '../types/public-api'
import { useDatabase } from '../utils/database'
import { formatAnswer, formatConjugationQuestion } from './question-formatter'
import { formatNonFiniteQuestion } from './non-finite-formatter'
import { generatePronominalRow, type PronominalSourceRow } from './pronominal-formatter'
import { decodePronominalSelectionId } from '../../shared/utils/pronominal-selection'
import { MODE_IDENTIFICATION_INSTRUCTION, TENSE_IDENTIFICATION_INSTRUCTION } from '../../shared/utils/exercise-instructions'
import type { ComplementOption } from '../../shared/types/conjugation'
import { indirectRelative } from './indirect-relative'
import { resolveVariableAuxiliary } from './compound-auxiliary'
import { buildRadicalReference } from '../../shared/utils/radical-reference'
import {
  buildNearFutureParadigm,
  isNearFutureTense,
  isPronominalNearFutureInfinitive,
  nearFutureReflexivePronoun,
  type NearFutureAuxiliaryForm,
} from '../../shared/utils/near-future'

interface IdRow extends RowDataPacket { id: number }

interface TenseSelectionRow extends RowDataPacket {
  id: number
  name: string
  code: ExerciseQuestion['tenseCode']
  mode_name: string
  mode_code: ExerciseQuestion['modeCode']
  nous_form: string | null
  is_compound: number
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
  tense_code: ExerciseQuestion['tenseCode']
  is_compound: number
  mode_name: string
  mode_code: ExerciseQuestion['modeCode']
  base_verbe_id?: number
  type_h_initial?: string | null
  future_simple_forms?: string[]
}

interface LiteraryCitationRow extends RowDataPacket {
  id: number
  verb_id: number
  tense_id: number
  person_id: number
  sentence_text: string
  target_text: string
  target_start: number
  target_end: number
  author: string
  work: string
  chapter: string | null
  source_url: string
  infinitif: string
  pronom: string
  tense_name: string
  tense_code: ExerciseQuestion['tenseCode']
  is_compound: number
  mode_name: string
  mode_code: ExerciseQuestion['modeCode']
}

interface RadicalReferenceRow extends RowDataPacket {
  verbe_id: number
  personne_id: number
  temp_id: number
  pronom: string
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
  mode_name: string
  temps_name: string
}

export function conjugationConfusionsFor(
  row: ConjugationRow,
  references: ReadonlyMap<number, readonly RadicalReferenceRow[]>,
) {
  const forms = references.get(Number(row.base_verbe_id || row.verbe_id)) || []
  return forms
    .filter(form => Number(form.personne_id) === Number(row.personne_id)
      && Number(form.temp_id) !== Number(row.temp_id))
    .map(form => ({
      tense: form.temps_name,
      mode: form.mode_name,
      forms: unique([form.conjugaison1, form.conjugaison2, form.conjugaison3]),
    }))
    .filter(candidate => candidate.forms.length)
}

interface NonFiniteVerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire_infinitif: string | null
  auxiliaire_participe_present: string | null
  present_nous: string | null
}

interface PronominalUseRow extends RowDataPacket {
  id: number
  infinitif_pronominal: string
  participe_present: string
  participe_passe: string
  type_h_initial: string | null
  present_nous: string | null
}

interface AuxiliaryFormRow extends RowDataPacket {
  personne_id: number
  mode_name: string
  temps_name: string
  conjugaison1: string
}

interface NearFutureAllerRow extends RowDataPacket {
  personne_id: number
  pronom: string
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}

interface NearFutureVerbRow extends RowDataPacket {
  id: number
  infinitif: string
  type_h_initial: string | null
  personnes_disponibles: string | number[] | null
}

interface NearFutureUseRow extends RowDataPacket {
  id: number
  verbe_id: number
  infinitif_pronominal: string
  type_h_initial: string | null
  personnes_autorisees: string | number[] | null
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

function nearFutureAuxiliaryForms(rows: readonly NearFutureAllerRow[]): NearFutureAuxiliaryForm[] {
  return rows.map(row => ({
    personId: Number(row.personne_id),
    pronoun: row.pronom,
    forms: unique([row.conjugaison1, row.conjugaison2, row.conjugaison3]),
  }))
}

function nearFutureRows(
  tense: TenseSelectionRow,
  verbs: readonly NearFutureVerbRow[],
  pronominalUses: readonly NearFutureUseRow[],
  allerRows: readonly NearFutureAllerRow[],
): ConjugationRow[] {
  const auxiliaryForms = nearFutureAuxiliaryForms(allerRows)
  const sources = [
    ...verbs.map(verb => ({
      selectionId: Number(verb.id),
      baseVerbId: Number(verb.id),
      infinitive: verb.infinitif,
      typeHInitial: verb.type_h_initial,
      allowedPersonIds: allowedPersons(verb.personnes_disponibles),
    })),
    ...pronominalUses.map(use => ({
      selectionId: -Number(use.id),
      baseVerbId: Number(use.verbe_id),
      infinitive: use.infinitif_pronominal,
      typeHInitial: use.type_h_initial,
      allowedPersonIds: allowedPersons(use.personnes_autorisees),
    })),
  ]

  return sources.flatMap((source) => {
    const paradigm = buildNearFutureParadigm(
      Number(tense.id),
      source.selectionId,
      source.infinitive,
      auxiliaryForms,
      {
        typeHInitial: source.typeHInitial,
        allowedPersonIds: source.allowedPersonIds,
      },
    )
    const nousForm = paradigm.find(form => form.personId === 7)?.forms[0] ?? null
    return paradigm.map(form => ({
      id: form.id,
      verbe_id: source.selectionId,
      base_verbe_id: source.baseVerbId,
      personne_id: form.personId,
      temp_id: Number(tense.id),
      conjugaison1: form.forms[0] ?? '',
      conjugaison2: form.forms[1] ?? '',
      conjugaison3: form.forms[2] ?? '',
      infinitif: source.infinitive,
      auxiliaire: 'aller',
      participe_present: '',
      participe_passe: '',
      auxiliaire_infinitif: null,
      auxiliaire_participe_present: null,
      pronom: form.pronoun,
      temps_name: tense.name,
      tense_code: tense.code,
      is_compound: 0,
      mode_name: tense.mode_name,
      mode_code: tense.mode_code,
      nous_form: nousForm,
      type_h_initial: source.typeHInitial,
    }))
  }) as unknown as ConjugationRow[]
}

function shuffle<T>(values: T[]) {
  return shuffleWith(values, Math.random)
}

function shuffleWith<T>(values: T[], random: () => number) {
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
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

function radicalReferenceFor(
  row: ConjugationRow,
  references: ReadonlyMap<number, readonly RadicalReferenceRow[]>,
): ExerciseQuestion['radicalReference'] | undefined {
  const forms = references.get(Number(row.base_verbe_id || row.verbe_id)) || []
  const reference = buildRadicalReference({
    infinitive: row.infinitif,
    mode: row.mode_name,
    tense: row.temps_name,
    personId: Number(row.personne_id),
    conjugation: row.conjugaison1,
    isCompound: Boolean(row.is_compound),
  }, forms.map(form => ({
    mode: form.mode_name,
    tense: form.temps_name,
    personId: Number(form.personne_id),
    pronoun: form.pronom,
    form: form.conjugaison1,
  })))
  if (!reference) return undefined
  const paradigmForms = forms
    .filter(form => normalized(form.mode_name) === normalized(row.mode_name)
      && normalized(form.temps_name) === normalized(row.temps_name))
    .sort((left, right) => Number(left.personne_id) - Number(right.personne_id))
    .map(form => ({
      subject: form.pronom,
      form: form.conjugaison1,
      personId: Number(form.personne_id),
    }))
  return {
    ...reference,
    ...(paradigmForms.length ? { paradigmForms } : {}),
  }
}

export function futureSimpleFormsFor(
  row: ConjugationRow,
  references: ReadonlyMap<number, readonly RadicalReferenceRow[]>,
) {
  if (!isNearFutureTense({ code: row.tense_code, name: row.temps_name })) return []
  const forms = references.get(Number(row.base_verbe_id || row.verbe_id)) || []
  const futureForms = forms
    .filter(form => Number(form.personne_id) === Number(row.personne_id)
      && normalized(form.mode_name) === 'indicatif'
      && normalized(form.temps_name) === 'futur')
    .flatMap(form => unique([form.conjugaison1, form.conjugaison2, form.conjugaison3]))
  if (!isPronominalNearFutureInfinitive(row.infinitif) || Number(row.verbe_id) > 0) {
    return unique(futureForms)
  }
  const proclitic = nearFutureReflexivePronoun(
    Number(row.personne_id),
    row.infinitif,
    row.type_h_initial,
  )
  return unique(futureForms.map(form => `${proclitic}${form}`))
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

export function choosePronoun(
  pronom: string,
  inclusive: boolean,
  includeOn: boolean,
  random: () => number = Math.random,
) {
  if (pronom === 'il') {
    const choices = ['il', 'elle']
    if (inclusive) choices.push('iel')
    if (includeOn) choices.push('on')
    return choices[Math.floor(random() * choices.length)]!
  }
  if (pronom === 'ils') {
    const choices = inclusive ? ['ils', 'elles', 'iels'] : ['ils', 'elles']
    return choices[Math.floor(random() * choices.length)]!
  }
  return pronom
}

/**
 * Prend une question de chaque verbe avant de commencer un nouveau tour.
 * Les temps et les personnes restent aléatoires à l'intérieur de chaque verbe.
 */
export function diverseConjugationQuestions(
  questions: ExerciseQuestion[],
  count: number,
  random: () => number = Math.random,
) {
  const byVerb = new Map<number, ExerciseQuestion[]>()
  for (const question of shuffleWith([...questions], random)) {
    const verbId = Number(question.verbeId)
    const key = Number.isFinite(verbId) ? verbId : Number.MIN_SAFE_INTEGER + byVerb.size
    const group = byVerb.get(key) || []
    group.push(question)
    byVerb.set(key, group)
  }

  const groups = shuffleWith([...byVerb.values()], random)
  const selected: ExerciseQuestion[] = []
  while (selected.length < count && groups.some(group => group.length)) {
    for (const group of shuffleWith([...groups], random)) {
      const question = group.shift()
      if (question) selected.push(question)
      if (selected.length >= count) break
    }
  }
  return selected
}

function articleForTense(tense: string, mode: string) {
  if (normalized(mode) === 'infinitif') {
    return `L'infinitif ${tense}`
  }
  const article = startsWithVowel(tense) ? "L'" : 'Le '
  const normalizedMode = normalized(mode)
  if (normalizedMode === 'indicatif' || normalizedMode === 'impératif') {
    return `${article}${tense} de l'${normalizedMode}`
  }
  return `${article}${tense} du ${normalizedMode}`
}

function literaryIdentificationQuestion(citation: LiteraryCitationRow, modeOnly: boolean) {
  return identificationQuestion({
    id: citation.id,
    verbe_id: citation.verb_id,
    personne_id: citation.person_id,
    temp_id: citation.tense_id,
    conjugaison1: citation.target_text,
    conjugaison2: '',
    conjugaison3: '',
    infinitif: citation.infinitif,
    auxiliaire: '',
    participe_present: '',
    participe_passe: '',
    auxiliaire_infinitif: null,
    auxiliaire_participe_present: null,
    pronom: citation.pronom,
    temps_name: citation.tense_name,
    tense_code: citation.tense_code,
    is_compound: citation.is_compound,
    mode_name: citation.mode_name,
    mode_code: citation.mode_code,
  } as ConjugationRow, citation, modeOnly)
}

export function identificationQuestion(row: ConjugationRow, citation?: LiteraryCitationRow, modeOnly = false): ExerciseQuestion {
  const pronoun = row.pronom
  const phrase = formatAnswer(pronoun, row.conjugaison1, row.mode_name)
  const tense = normalized(row.temps_name)
  const mode = normalized(row.mode_name)
  const modeCorrection = `${startsWithVowel(mode) ? "L'" : 'Le '}${mode}`
  const correction = modeOnly ? modeCorrection : articleForTense(tense, mode)
  const answers = modeOnly ? [mode, `mode ${mode}`, modeCorrection] : [
    `${tense} ${mode}`,
    `${mode} ${tense}`,
    correction,
    `${tense} ${mode === 'indicatif' || mode === 'impératif' ? "de l'" : 'du '}${mode}`
  ]
  if (!modeOnly && tense === 'futur' && mode === 'indicatif') {
    answers.push('futur simple indicatif', 'indicatif futur simple', "futur simple de l'indicatif")
  }

  return {
    id: citation ? `lt-${citation.id}` : `t-${row.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    instruction: modeOnly ? MODE_IDENTIFICATION_INSTRUCTION : TENSE_IDENTIFICATION_INSTRUCTION,
    consigne: phrase,
    reponses: unique(answers),
    reponsesPourCorrige: [correction],
    infinitif: row.infinitif,
    pronom: pronoun,
    temps: row.temps_name,
    mode: row.mode_name,
    conjugaison1: row.conjugaison1,
    conjugaison2: row.conjugaison2 || '',
    conjugaison3: row.conjugaison3 || '',
    nousForm: row.nous_form || null,
    ...(citation ? {
      consigne: citation.sentence_text,
      literaryCitation: {
        before: citation.sentence_text.slice(0, Number(citation.target_start)),
        target: citation.sentence_text.slice(Number(citation.target_start), Number(citation.target_end)),
        after: citation.sentence_text.slice(Number(citation.target_end)),
        author: citation.author,
        work: citation.work,
        chapter: citation.chapter,
        sourceUrl: citation.source_url,
      },
    } : {}),
  }
}

function literaryCitationKey(verbId: number, tenseId: number, personId: number) {
  return `${verbId}:${tenseId}:${personId}`
}

async function validatedLiteraryCitations(
  verbIds: readonly number[] | null,
  tenseIds: readonly number[],
  literaryRegister: 'all' | 'courant' | 'soutenu' = 'all',
) {
  const citations = new Map<string, LiteraryCitationRow[]>()
  if (!tenseIds.length || (verbIds !== null && !verbIds.length)) return citations
  const database = useDatabase()
  try {
    const register = literaryRegister === 'courant' || literaryRegister === 'soutenu' ? literaryRegister : ''
    const coverageRegisterClause = register ? `AND coveredSource.language_register='${register}'` : ''
    const randomRegisterClause = register ? `AND source.language_register='${register}'` : ''
    const verbClause = verbIds === null
      ? ''
      : `AND target.verb_id IN (${placeholders(verbIds)})`
    const parameters = verbIds === null ? [...tenseIds] : [...verbIds, ...tenseIds]
    const [coverageRows, randomRows] = await Promise.all([
      database.execute<LiteraryCitationRow[]>(`
      SELECT target.id,target.verb_id,target.tense_id,target.person_id,
             sentence.sentence_text,target.target_text,target.target_start,target.target_end,
             source.author,source.title AS work,sentence.chapter,COALESCE(sentence.source_url,source.source_url) AS source_url,
             verb.infinitif,person.pronom,tense.name AS tense_name,tense.code AS tense_code,
             tense.isTempsCompose AS is_compound,mode.name AS mode_name,mode.code AS mode_code
      FROM literary_targets target
      INNER JOIN (
        SELECT covered.tense_id, MIN(covered.id) AS id
        FROM literary_targets covered
        INNER JOIN literary_sentences coveredSentence ON coveredSentence.id=covered.sentence_id
        INNER JOIN literary_sources coveredSource ON coveredSource.id=coveredSentence.source_id
        WHERE covered.review_status='validated'
          ${verbIds === null ? '' : `AND covered.verb_id IN (${placeholders(verbIds)})`}
          AND covered.tense_id IN (${placeholders(tenseIds)})
          ${coverageRegisterClause}
        GROUP BY covered.tense_id
      ) coverage ON coverage.id=target.id
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      INNER JOIN verbes verb ON verb.id=target.verb_id
      INNER JOIN personnes person ON person.id=target.person_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      INNER JOIN modes mode ON mode.id=tense.mode_id
    `, parameters),
      database.execute<LiteraryCitationRow[]>(`
      SELECT target.id,target.verb_id,target.tense_id,target.person_id,
             sentence.sentence_text,target.target_text,target.target_start,target.target_end,
             source.author,source.title AS work,sentence.chapter,COALESCE(sentence.source_url,source.source_url) AS source_url,
             verb.infinitif,person.pronom,tense.name AS tense_name,tense.code AS tense_code,
             tense.isTempsCompose AS is_compound,mode.name AS mode_name,mode.code AS mode_code
      FROM literary_targets target
      INNER JOIN literary_sentences sentence ON sentence.id=target.sentence_id
      INNER JOIN literary_sources source ON source.id=sentence.source_id
      INNER JOIN verbes verb ON verb.id=target.verb_id
      INNER JOIN personnes person ON person.id=target.person_id
      INNER JOIN temps tense ON tense.id=target.tense_id
      INNER JOIN modes mode ON mode.id=tense.mode_id
      WHERE target.review_status='validated'
        ${verbClause}
        AND target.tense_id IN (${placeholders(tenseIds)})
        ${randomRegisterClause}
      ORDER BY RAND()
      LIMIT 500
    `, parameters),
    ])
    const seen = new Set<number>()
    for (const row of [...coverageRows[0], ...randomRows[0]]) {
      if (seen.has(Number(row.id))) continue
      seen.add(Number(row.id))
      const key = literaryCitationKey(Number(row.verb_id), Number(row.tense_id), Number(row.person_id))
      const group = citations.get(key) || []
      group.push(row)
      citations.set(key, group)
    }
  }
  catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : ''
    if (code !== 'ER_NO_SUCH_TABLE') throw error
  }
  return citations
}

export function balancedIdentificationQuestions(questions: ExerciseQuestion[], count: number) {
  const groupsByMode = new Map<string, Map<string, ExerciseQuestion[]>>()
  for (const question of shuffle([...questions])) {
    const mode = normalized(question.mode || '')
    const tense = question.tenseId === undefined
      ? normalized(question.temps || '')
      : String(question.tenseId)
    if (!mode || !tense) continue
    const modeGroups = groupsByMode.get(mode) || new Map<string, ExerciseQuestion[]>()
    modeGroups.set(tense, [...(modeGroups.get(tense) || []), question])
    groupsByMode.set(mode, modeGroups)
  }

  const preferredModeOrder = ['indicatif', 'subjonctif', 'conditionnel', 'impératif', 'infinitif']
  const modes = [...groupsByMode.keys()].sort((left, right) => {
    const leftOrder = preferredModeOrder.indexOf(left)
    const rightOrder = preferredModeOrder.indexOf(right)
    return (leftOrder < 0 ? preferredModeOrder.length : leftOrder)
      - (rightOrder < 0 ? preferredModeOrder.length : rightOrder)
  })
  const unusedGroupsByMode = new Map(modes.map((mode) => {
    const groups = [...(groupsByMode.get(mode)?.values() || [])]
      .map(group => ({ group, tieBreaker: Math.random() }))
      .sort((left, right) => left.group.length - right.group.length || left.tieBreaker - right.tieBreaker)
      .map(item => item.group)
    return [mode, groups] as const
  }))

  const balanced: ExerciseQuestion[] = []
  while (balanced.length < count && modes.some(mode => unusedGroupsByMode.get(mode)?.length)) {
    for (const mode of shuffle([...modes])) {
      const group = unusedGroupsByMode.get(mode)?.shift()
      const question = group?.shift()
      if (question) balanced.push(question)
      if (balanced.length >= count) break
    }
  }

  const repeatedGroups = shuffle([...groupsByMode.values()].flatMap(modeGroups => [...modeGroups.values()]))
  while (balanced.length < count && repeatedGroups.some(group => group.length)) {
    for (const group of repeatedGroups) {
      const question = group.shift()
      if (question) balanced.push(question)
      if (balanced.length >= count) break
    }
  }
  return shuffle(balanced)
}

export function balancedModeIdentificationQuestions(questions: ExerciseQuestion[], count: number) {
  const groups = new Map<string, ExerciseQuestion[]>()
  for (const question of shuffle(questions.filter(item => item.literaryCitation))) {
    const mode = normalized(question.mode || '')
    groups.set(mode, [...(groups.get(mode) || []), question])
  }
  const modeOrder = ['indicatif', 'subjonctif', 'conditionnel', 'impératif', 'infinitif']
  const balanced: ExerciseQuestion[] = []
  while (balanced.length < count && modeOrder.some(mode => groups.get(mode)?.length)) {
    for (const mode of shuffle([...modeOrder])) {
      const question = groups.get(mode)?.shift()
      if (question) balanced.push(question)
      if (balanced.length >= count) break
    }
  }
  return shuffle(balanced)
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
      `SELECT t.id, t.name, t.code, m.name AS mode_name, m.code AS mode_code,
              t.isTempsCompose AS is_compound
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
  const nonFiniteModes = ['participe', 'gérondif', 'infinitif']
  const finiteTenses = selectedTenses.filter(row => !nonFiniteModes.includes(normalized(row.mode_name)))
  const nonFiniteTenses = selectedTenses.filter(row => nonFiniteModes.includes(normalized(row.mode_name)))
  const database = useDatabase()
  const questions: ExerciseQuestion[] = []
  const requestedComplementOptions = request.complementOptions || []
  const onlyBeforeComplements = requestedComplementOptions.length > 0
    && requestedComplementOptions.every(option => option.endsWith('-before'))
  const verbIds = request.verbIds.filter(id => id > 0)
  const pronominalUseIds = request.verbIds
    .filter(id => id < 0)
    .map(decodePronominalSelectionId)
    .filter((id): id is number => id !== null)
  const usesLiteraryCitations = request.exerciseKind === 'mode-identification'
    || (request.exerciseKind === 'tense-identification' && request.identificationSource === 'literary-corpus')

  if (usesLiteraryCitations) {
    const citations = await validatedLiteraryCitations(
      null,
      selectedTenses.map(row => Number(row.id)),
      request.literaryRegister ?? 'all',
    )
    const literaryQuestions = [...citations.values()].flat()
      .map(citation => literaryIdentificationQuestion(citation, request.exerciseKind === 'mode-identification'))
    if (!literaryQuestions.length) {
      throw new QuestionnaireSelectionError('Aucune citation validée ne correspond aux temps sélectionnés')
    }
    return request.exerciseKind === 'mode-identification'
      ? balancedModeIdentificationQuestions(literaryQuestions, request.questionCount)
      : balancedIdentificationQuestions(literaryQuestions, request.questionCount)
  }

  if (finiteTenses.length > 0) {
    const nearFutureTenses = usesLiteraryCitations ? [] : finiteTenses.filter(isNearFutureTense)
    const storedFiniteTenses = finiteTenses.filter(tense => !isNearFutureTense(tense))
    const finiteIds = storedFiniteTenses.map(row => Number(row.id))
    const pastSimpleClause = request.pastSimplePronouns === 'third-person-only'
      ? "AND (t.name NOT IN ('passé simple', 'passé antérieur') OR p.pronom IN ('il', 'ils'))"
      : ''
    const rows: ConjugationRow[] = []
    const literaryCitations = usesLiteraryCitations
      ? await validatedLiteraryCitations(null, finiteIds)
      : new Map<string, LiteraryCitationRow[]>()
    const selectedVerbCount = verbIds.length + pronominalUseIds.length
    const limit = request.exerciseKind === 'conjugation'
      ? Math.min(3_000, Math.max(request.questionCount * 10, selectedVerbCount * 3, request.questionCount))
      : 600
    const questionVerbIds = usesLiteraryCitations
      ? [...new Set([...literaryCitations.values()].flat().map(citation => Number(citation.verb_id)))]
      : verbIds
    const literaryCoordinates = usesLiteraryCitations
      ? [...literaryCitations.keys()].map((key) => {
          const [verbId, tenseId, personId] = key.split(':').map(Number)
          return [verbId!, tenseId!, personId!] as const
        })
      : []
    const exactLiteraryClause = literaryCoordinates.length
      ? `AND (vc.verbe_id,vc.temp_id,vc.personne_id) IN (${literaryCoordinates.map(() => '(?,?,?)').join(',')})`
      : ''
    const literaryOrderClause = literaryCitations.size
      ? `CASE WHEN EXISTS (
          SELECT 1 FROM literary_targets prioritized
          WHERE prioritized.review_status='validated'
            AND prioritized.verb_id=vc.verbe_id
            AND prioritized.tense_id=vc.temp_id
            AND prioritized.person_id=vc.personne_id
        ) THEN 0 ELSE 1 END,`
      : ''
    let radicalReferences = new Map<number, RadicalReferenceRow[]>()
    let etreAuxiliaryForms: AuxiliaryFormRow[] = []
    if (questionVerbIds.length > 0 && finiteIds.length > 0) {
      const [storedRows] = await database.execute<ConjugationRow[]>(`
      SELECT vc.id, vc.verbe_id, vc.personne_id, vc.temp_id,
             vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
             v.infinitif, v.auxiliaire,
             v.\`participe_présent\` AS participe_present,
             v.\`participe_passé\` AS participe_passe,
             auxiliary.infinitif AS auxiliaire_infinitif,
             auxiliary.\`participe_présent\` AS auxiliaire_participe_present,
             p.pronom, t.name AS temps_name, t.code AS tense_code,
             t.isTempsCompose AS is_compound,
             m.name AS mode_name, m.code AS mode_code,
             (SELECT nous.conjugaison1 FROM verbesconjugues nous
              WHERE nous.verbe_id=vc.verbe_id AND nous.temp_id=vc.temp_id
                AND nous.personne_id=7 AND nous.conjugaison1<>'' LIMIT 1) AS nous_form
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      INNER JOIN personnes p ON p.id = vc.personne_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE vc.verbe_id IN (${placeholders(questionVerbIds)})
        AND vc.temp_id IN (${placeholders(finiteIds)})
        ${exactLiteraryClause}
        AND vc.conjugaison1 <> ''
        ${pastSimpleClause}
      ORDER BY ${literaryOrderClause} RAND()
      LIMIT ${limit}
      `, [...questionVerbIds, ...finiteIds, ...literaryCoordinates.flat()])
      rows.push(...storedRows)
    }

    if (!usesLiteraryCitations && pronominalUseIds.length > 0 && finiteIds.length > 0) {
      const [sourceRows, auxiliaryForms] = await Promise.all([
        database.execute<PronominalSourceRow[]>(`
          SELECT vc.id, -ep.id AS verbe_id, ep.verbe_id AS base_verbe_id, vc.personne_id, vc.temp_id,
                 vc.conjugaison1 AS base_conjugaison1,
                 vc.conjugaison2 AS base_conjugaison2,
                 vc.conjugaison3 AS base_conjugaison3,
                 vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
                 ep.id AS pronominal_use_id, ep.infinitif_pronominal,
                 ep.regle_accord, ep.personnes_autorisees, base.type_h_initial,
                 base.infinitif, base.auxiliaire,
                 base.\`participe_passé\` AS participe_passe,
                 p.pronom, t.name AS temps_name, t.code AS tense_code,
                 t.isTempsCompose AS is_compound,
                 m.name AS mode_name, m.code AS mode_code,
                 (SELECT nous.conjugaison1 FROM verbesconjugues nous
                  WHERE nous.verbe_id=vc.verbe_id AND nous.temp_id=vc.temp_id
                    AND nous.personne_id=7 AND nous.conjugaison1<>'' LIMIT 1) AS nous_form
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
      etreAuxiliaryForms = auxiliaryForms[0]
      rows.push(...sourceRows[0]
        .filter((row) => {
          const persons = allowedPersons(row.personnes_autorisees)
          return persons === null || persons.includes(Number(row.personne_id))
        })
        .map(row => generatePronominalRow(row, auxiliaryForms[0]))
        .filter(row => row.conjugaison1) as ConjugationRow[])
    }

    if (nearFutureTenses.length > 0) {
      const [nearFutureVerbs, nearFutureUses, allerRows] = await Promise.all([
        verbIds.length
          ? database.execute<NearFutureVerbRow[]>(`
              SELECT id, infinitif, type_h_initial, personnes_disponibles
              FROM verbes
              WHERE id IN (${placeholders(verbIds)}) AND est_archive = 0
            `, verbIds)
          : Promise.resolve([[]] as unknown as Awaited<ReturnType<typeof database.execute<NearFutureVerbRow[]>>>),
        pronominalUseIds.length
          ? database.execute<NearFutureUseRow[]>(`
              SELECT ep.id, ep.verbe_id, ep.infinitif_pronominal,
                     ep.personnes_autorisees, base.type_h_initial
              FROM emplois_pronominaux ep
              INNER JOIN verbes base ON base.id = ep.verbe_id AND base.est_archive = 0
              WHERE ep.id IN (${placeholders(pronominalUseIds)})
                AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
            `, pronominalUseIds)
          : Promise.resolve([[]] as unknown as Awaited<ReturnType<typeof database.execute<NearFutureUseRow[]>>>),
        database.execute<NearFutureAllerRow[]>(`
          SELECT vc.personne_id, p.pronom,
                 vc.conjugaison1, vc.conjugaison2, vc.conjugaison3
          FROM verbesconjugues vc
          INNER JOIN verbes v ON v.id = vc.verbe_id
          INNER JOIN personnes p ON p.id = vc.personne_id
          INNER JOIN temps t ON t.id = vc.temp_id
          INNER JOIN modes m ON m.id = t.mode_id
          WHERE v.infinitif = 'aller' AND m.name = 'indicatif'
            AND t.name = 'présent' AND vc.conjugaison1 <> ''
          ORDER BY p.id
        `),
      ])
      for (const tense of nearFutureTenses) {
        rows.push(...nearFutureRows(tense, nearFutureVerbs[0], nearFutureUses[0], allerRows[0]))
      }
    }

    const radicalReferenceVerbIds = [...new Set(
      rows.map(row => Number(row.base_verbe_id || row.verbe_id)).filter(id => id > 0),
    )]
    if (radicalReferenceVerbIds.length > 0) {
      const [referenceRows] = await database.execute<RadicalReferenceRow[]>(`
        SELECT vc.verbe_id, vc.personne_id, vc.temp_id, p.pronom,
               vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
               m.name AS mode_name, t.name AS temps_name
        FROM verbesconjugues vc
        INNER JOIN personnes p ON p.id = vc.personne_id
        INNER JOIN temps t ON t.id = vc.temp_id
        INNER JOIN modes m ON m.id = t.mode_id
        WHERE vc.verbe_id IN (${placeholders(radicalReferenceVerbIds)})
          AND vc.conjugaison1 <> ''
      `, radicalReferenceVerbIds)
      for (const reference of referenceRows) {
        const candidates = radicalReferences.get(Number(reference.verbe_id)) || []
        candidates.push(reference)
        radicalReferences.set(Number(reference.verbe_id), candidates)
      }
    }

    if (!etreAuxiliaryForms.length && rows.some(row => normalized(row.infinitif) === 'sortir' && Boolean(row.is_compound))) {
      const [auxiliaryForms] = await database.execute<AuxiliaryFormRow[]>(`
        SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
        FROM verbesconjugues vc
        INNER JOIN verbes v ON v.id = vc.verbe_id
        INNER JOIN temps t ON t.id = vc.temp_id
        INNER JOIN modes m ON m.id = t.mode_id
        WHERE v.infinitif = 'être' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
      `)
      etreAuxiliaryForms = auxiliaryForms
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

    const eligibleRows = usesLiteraryCitations
      ? rows.filter(row => literaryCitations.has(literaryCitationKey(
          Number(row.verbe_id), Number(row.temp_id), Number(row.personne_id),
        )))
      : rows
    const rowsForQuestions = onlyBeforeComplements
      ? eligibleRows.filter(row => normalized(row.mode_name) !== 'impératif'
        && (requestedComplementOptions.includes('coi-before') || Boolean(row.is_compound)))
      : eligibleRows

    questions.push(...rowsForQuestions.map((row) => {
      const candidates = complementsByVerb.get(Number(row.verbe_id)) ?? []
      const availableOptions = requestedComplementOptions.flatMap((option) => {
        const [functionObject, position] = option.split('-') as ['cod' | 'coi', 'after' | 'before']
        const matching = candidates.filter(candidate => candidate.fonction_objet === functionObject)
          .filter((candidate) => {
            if (position === 'after') return true
            if (functionObject === 'cod') return allowsAnteposedComplement(row) && hasVisibleAnteposedAgreement(candidate)
            return normalized(row.mode_name) !== 'impératif'
              && Boolean(indirectRelative(candidate.texte, candidate.preposition, candidate.genre, candidate.nombre))
          })
        return matching.length ? [{ option, matching }] : []
      })
      const selectedOption = availableOptions[Math.floor(Math.random() * availableOptions.length)]
      const complement = selectedOption ? randomComplement(selectedOption.matching) : null
      const option = selectedOption?.option as ComplementOption | undefined
      const useBefore = option?.endsWith('-before') || false
      const relative = complement && option === 'coi-before'
        ? indirectRelative(complement.texte, complement.preposition, complement.genre, complement.nombre)
        : null
      const canUseComplement = Boolean(complement) && (!useBefore
        || (option === 'cod-before' ? Boolean(complement?.texte_antepose) : Boolean(relative)))
      const enrichedRow = complement && canUseComplement
        ? {
            ...row,
            complement_phrase: complement.texte,
            complement_position: useBefore ? 'before' as const : 'after' as const,
            complement_anteposed: useBefore ? (relative?.antecedent || complement.texte_antepose) : null,
            complement_relative_pronoun: relative?.relativePronoun || null,
            complement_gender: option === 'cod-before' ? complement.genre : null,
            complement_number: option === 'cod-before' ? complement.nombre : null,
            complement_function: complement.fonction_objet,
            complement_preposition: complement.preposition,
          }
        : row
      const semanticRow = resolveVariableAuxiliary(enrichedRow, etreAuxiliaryForms)
      const radicalReference = isNearFutureTense({ code: row.tense_code, name: row.temps_name })
        ? undefined
        : radicalReferenceFor(row, radicalReferences)
      const futureSimpleForms = futureSimpleFormsFor(row, radicalReferences)
      const conjugationConfusions = conjugationConfusionsFor(row, radicalReferences)
      return request.exerciseKind === 'conjugation'
        ? formatConjugationQuestion({
            ...semanticRow,
            radical_reference: radicalReference,
            future_simple_forms: futureSimpleForms,
            conjugation_confusions: conjugationConfusions,
          }, choosePronoun(row.pronom, request.inclusivePronouns, request.includeOnPronoun))
        : identificationQuestion(
            semanticRow,
            literaryCitations.get(literaryCitationKey(
              Number(row.verbe_id), Number(row.temp_id), Number(row.personne_id),
            ))?.shift(),
            request.exerciseKind === 'mode-identification',
          )
    }))
  }

  if (nonFiniteTenses.length > 0 && request.exerciseKind === 'conjugation'
      && !onlyBeforeComplements) {
    const verbs: NonFiniteVerbRow[] = []
    const selectedNonFiniteRequirePresentParticiple = nonFiniteTenses.every((tense) => {
      const mode = normalized(tense.mode_name)
      return mode === 'gérondif' || (mode === 'participe' && normalized(tense.name) === 'présent')
    })
    const presentParticipleClause = selectedNonFiniteRequirePresentParticiple
      ? "AND NULLIF(NULLIF(TRIM(v.`participe_présent`), ''), '-') IS NOT NULL"
      : ''
    if (verbIds.length > 0) {
      const [storedVerbs] = await database.execute<NonFiniteVerbRow[]>(`
      SELECT v.id, v.infinitif,
             v.\`participe_présent\` AS participe_present,
             v.\`participe_passé\` AS participe_passe,
             auxiliary.infinitif AS auxiliaire_infinitif,
             auxiliary.\`participe_présent\` AS auxiliaire_participe_present,
             (SELECT vc.conjugaison1 FROM verbesconjugues vc
              INNER JOIN temps present_tense ON present_tense.id=vc.temp_id
              INNER JOIN modes present_mode ON present_mode.id=present_tense.mode_id
              INNER JOIN personnes present_person ON present_person.id=vc.personne_id
              WHERE vc.verbe_id=v.id AND present_mode.name='indicatif' AND present_tense.name='présent'
                AND present_person.pronom='nous' AND vc.conjugaison1<>'' LIMIT 1) AS present_nous
      FROM verbes v
      LEFT JOIN verbes auxiliary ON auxiliary.infinitif = v.auxiliaire
      WHERE v.id IN (${placeholders(verbIds)})
        ${presentParticipleClause}
      `, verbIds)
      verbs.push(...storedVerbs)
    }

    if (pronominalUseIds.length > 0) {
      const [uses] = await database.execute<PronominalUseRow[]>(`
        SELECT ep.id, ep.infinitif_pronominal,
               base.\`participe_présent\` AS participe_present,
               base.\`participe_passé\` AS participe_passe,
               base.type_h_initial,
               (SELECT vc.conjugaison1 FROM verbesconjugues vc
                INNER JOIN temps present_tense ON present_tense.id=vc.temp_id
                INNER JOIN modes present_mode ON present_mode.id=present_tense.mode_id
                INNER JOIN personnes present_person ON present_person.id=vc.personne_id
                WHERE vc.verbe_id=base.id AND present_mode.name='indicatif' AND present_tense.name='présent'
                  AND present_person.pronom='nous' AND vc.conjugaison1<>'' LIMIT 1) AS present_nous
        FROM emplois_pronominaux ep
        INNER JOIN verbes base ON base.id = ep.verbe_id
        WHERE ep.id IN (${placeholders(pronominalUseIds)})
          AND ep.actif = 1 AND ep.verbe_id IS NOT NULL
          ${selectedNonFiniteRequirePresentParticiple
            ? "AND NULLIF(NULLIF(TRIM(base.`participe_présent`), ''), '-') IS NOT NULL"
            : ''}
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
          auxiliaire_infinitif: 'être',
          auxiliaire_participe_present: "s'étant",
          present_nous: use.present_nous,
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

  if (usesLiteraryCitations && !questions.length) {
    throw new QuestionnaireSelectionError('Aucune citation validée ne correspond aux temps sélectionnés')
  }

  if (request.exerciseKind === 'mode-identification') {
    return balancedModeIdentificationQuestions(questions, request.questionCount)
  }
  return request.exerciseKind === 'tense-identification'
    ? balancedIdentificationQuestions(questions, request.questionCount)
    : diverseConjugationQuestions(questions, request.questionCount)
}
