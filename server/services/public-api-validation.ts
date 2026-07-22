import type {
  ChallengePrintOptions,
  ComplementOption,
  ComplementPlacement,
  DefiDefinition,
  ExerciseKind,
  PastSimplePronouns,
  QuestionnaireRequest
} from '../types/public-api'
import { legacyComplementConfig, legacyComplementOptions, normalizeComplementOptions } from '../../shared/utils/complement-options'
import { DEFAULT_SHARED_CHALLENGE_OPTIONS } from '../../shared/utils/challenge-defaults'

export class PublicInputError extends Error {}

const QUESTIONNAIRE_KEYS = new Set([
  'verbIds',
  'tenseIds',
  'questionCount',
  'exerciseKind',
  'pastSimplePronouns',
  'inclusivePronouns',
  'includeComplements',
  'complementPlacement',
  'complementOptions'
])

const DEFI_KEYS = new Set([
  'version',
  'verbIds',
  'tenseIds',
  'questionCount',
  'exerciseKind',
  'pastSimplePronouns',
  'inclusivePronouns',
  'includeComplements',
  'complementPlacement',
  'complementOptions',
  'printOptions'
])

const PRINT_OPTION_KEYS = new Set([
  'title',
  'questionSpacingMm',
  'titleSpacingMm',
  'showGrade',
  'showVerbs',
  'showTenses',
  'showFirstName',
  'showLastName',
  'showDate',
  'showRandomNumber'
])
const BOOLEAN_PRINT_OPTION_KEYS = [
  'showGrade',
  'showVerbs',
  'showTenses',
  'showFirstName',
  'showLastName',
  'showDate',
  'showRandomNumber',
] as const

const DEFAULT_PRINT_OPTIONS: ChallengePrintOptions = {
  title: 'Défi de conjugaison',
  questionSpacingMm: 8,
  titleSpacingMm: 30,
  showGrade: true,
  showVerbs: false,
  showTenses: false,
  showFirstName: true,
  showLastName: true,
  showDate: true,
  showRandomNumber: true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertOnlyKeys(value: Record<string, unknown>, allowed: Set<string>) {
  const unexpected = Object.keys(value).filter(key => !allowed.has(key))
  if (unexpected.length > 0) {
    throw new PublicInputError(`Champs non reconnus : ${unexpected.join(', ')}`)
  }
}

function parseIds(value: unknown, label: string, maximum: number, allowVirtual = false): number[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > maximum) {
    throw new PublicInputError(`${label} doit contenir entre 1 et ${maximum} identifiants`)
  }

  const ids = value.map((id) => {
    if (!Number.isSafeInteger(id) || Number(id) === 0 || (!allowVirtual && Number(id) < 0)) {
      throw new PublicInputError(`${label} contient un identifiant invalide`)
    }
    return Number(id)
  })

  if (new Set(ids).size !== ids.length) {
    throw new PublicInputError(`${label} ne doit pas contenir de doublons`)
  }

  return ids
}

function parseQuestionCount(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 1 || Number(value) > 100) {
    throw new PublicInputError('questionCount doit être un entier entre 1 et 100')
  }
  return Number(value)
}

function parseExerciseKind(value: unknown): ExerciseKind {
  if (value === 'conjugation' || value === 'normal') {
    return 'conjugation'
  }
  if (value === 'tense-identification' || value === 'temps-mode') {
    return 'tense-identification'
  }
  throw new PublicInputError('exerciseKind doit valoir conjugation ou tense-identification')
}

function parsePastSimplePronouns(value: unknown): PastSimplePronouns {
  if (value === 'all' || value === 'tous') {
    return 'all'
  }
  if (value === 'third-person-only' || value === 'ililsonly') {
    return 'third-person-only'
  }
  throw new PublicInputError('pastSimplePronouns doit valoir all ou third-person-only')
}

function parseComplementPlacement(value: unknown): ComplementPlacement {
  if (value === 'after' || value === 'mixed' || value === 'before') return value
  throw new PublicInputError('complementPlacement doit valoir after, mixed ou before')
}

function parseComplementOptions(value: unknown): ComplementOption[] {
  const parsed = normalizeComplementOptions(value)
  if (!Array.isArray(value) || parsed.length !== value.length) {
    throw new PublicInputError('complementOptions contient une option invalide')
  }
  return parsed
}

function parsePrintOptions(value: unknown): ChallengePrintOptions {
  if (value === undefined) {
    return { ...DEFAULT_PRINT_OPTIONS }
  }
  if (!isRecord(value)) {
    throw new PublicInputError('printOptions doit être un objet')
  }
  assertOnlyKeys(value, PRINT_OPTION_KEYS)

  const title = value.title === undefined ? DEFAULT_PRINT_OPTIONS.title : value.title
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 120) {
    throw new PublicInputError('Le titre d’impression doit contenir entre 1 et 120 caractères')
  }

  const parsed = { ...DEFAULT_PRINT_OPTIONS, title: title.trim() }
  const numericOptions = {
    questionSpacingMm: { minimum: 2, maximum: 15 },
    titleSpacingMm: { minimum: 8, maximum: 30 },
  } as const
  for (const [key, limits] of Object.entries(numericOptions)) {
    if (value[key] === undefined) continue
    const number = Number(value[key])
    if (!Number.isFinite(number) || number < limits.minimum || number > limits.maximum) {
      throw new PublicInputError(`printOptions.${key} doit être compris entre ${limits.minimum} et ${limits.maximum}`)
    }
    parsed[key as keyof typeof numericOptions] = number
  }
  for (const key of BOOLEAN_PRINT_OPTION_KEYS) {
    if (value[key] === undefined) continue
    if (typeof value[key] !== 'boolean') {
      throw new PublicInputError(`printOptions.${key} doit être un booléen`)
    }
    parsed[key] = value[key]
  }
  return parsed
}

export function parseQuestionnaireRequest(value: unknown): QuestionnaireRequest {
  if (!isRecord(value)) {
    throw new PublicInputError('Le corps de la requête doit être un objet JSON')
  }
  assertOnlyKeys(value, QUESTIONNAIRE_KEYS)

  if (typeof value.inclusivePronouns !== 'boolean') {
    throw new PublicInputError('inclusivePronouns doit être un booléen')
  }
  const includeComplements = value.includeComplements ?? false
  if (typeof includeComplements !== 'boolean') {
    throw new PublicInputError('includeComplements doit être un booléen')
  }

  const complementPlacement = value.complementPlacement === undefined
    ? 'after'
    : parseComplementPlacement(value.complementPlacement)
  const complementOptions = value.complementOptions === undefined
    ? legacyComplementOptions(includeComplements, complementPlacement)
    : parseComplementOptions(value.complementOptions)
  const resolvedLegacy = legacyComplementConfig(complementOptions)
  return {
    verbIds: parseIds(value.verbIds, 'verbIds', 500, true),
    tenseIds: parseIds(value.tenseIds, 'tenseIds', 30),
    questionCount: parseQuestionCount(value.questionCount),
    exerciseKind: parseExerciseKind(value.exerciseKind),
    pastSimplePronouns: parsePastSimplePronouns(value.pastSimplePronouns),
    inclusivePronouns: value.inclusivePronouns,
    includeComplements: resolvedLegacy.includeComplements,
    complementPlacement: resolvedLegacy.complementPlacement,
    complementOptions,
  }
}

export function parseDefiDefinition(value: unknown): DefiDefinition {
  let modernValue: Record<string, unknown>
  let legacyPastSimple: unknown
  let legacyInclusive: unknown

  if (Array.isArray(value)) {
    if (value.length < 3 || value.length > 5) {
      throw new PublicInputError('Le défi historique doit contenir entre 3 et 5 éléments')
    }
    modernValue = {
      verbIds: value[0],
      tenseIds: value[1],
      questionCount: value[2]
    }
    legacyPastSimple = Array.isArray(value[3]) ? value[3][0] : value[3]
    legacyInclusive = value[4]
  } else if (isRecord(value)) {
    assertOnlyKeys(value, DEFI_KEYS)
    modernValue = value
  } else {
    throw new PublicInputError('Le corps du défi doit être un objet JSON')
  }

  if (modernValue.version !== undefined && modernValue.version !== 1) {
    throw new PublicInputError('Version de défi non prise en charge')
  }

  const exerciseKind = modernValue.exerciseKind === undefined
    ? DEFAULT_SHARED_CHALLENGE_OPTIONS.exerciseKind
    : parseExerciseKind(modernValue.exerciseKind)
  const pastSimplePronouns = modernValue.pastSimplePronouns === undefined
    ? (legacyPastSimple === undefined ? DEFAULT_SHARED_CHALLENGE_OPTIONS.pastSimplePronouns : parsePastSimplePronouns(legacyPastSimple))
    : parsePastSimplePronouns(modernValue.pastSimplePronouns)
  const inclusivePronouns = modernValue.inclusivePronouns === undefined
    ? (legacyInclusive === undefined ? DEFAULT_SHARED_CHALLENGE_OPTIONS.inclusivePronouns : legacyInclusive === 'afficherIel')
    : modernValue.inclusivePronouns

  if (typeof inclusivePronouns !== 'boolean') {
    throw new PublicInputError('inclusivePronouns doit être un booléen')
  }
  const includeComplements = modernValue.includeComplements ?? DEFAULT_SHARED_CHALLENGE_OPTIONS.includeComplements
  if (typeof includeComplements !== 'boolean') {
    throw new PublicInputError('includeComplements doit être un booléen')
  }

  const complementPlacement = modernValue.complementPlacement === undefined
    ? DEFAULT_SHARED_CHALLENGE_OPTIONS.complementPlacement
    : parseComplementPlacement(modernValue.complementPlacement)
  const complementOptions = modernValue.complementOptions === undefined
    ? legacyComplementOptions(includeComplements, complementPlacement)
    : parseComplementOptions(modernValue.complementOptions)
  const resolvedLegacy = legacyComplementConfig(complementOptions)
  return {
    version: 1,
    verbIds: parseIds(modernValue.verbIds, 'verbIds', 500, true),
    tenseIds: parseIds(modernValue.tenseIds, 'tenseIds', 30),
    questionCount: parseQuestionCount(modernValue.questionCount),
    exerciseKind,
    pastSimplePronouns,
    inclusivePronouns,
    includeComplements: resolvedLegacy.includeComplements,
    complementPlacement: resolvedLegacy.complementPlacement,
    complementOptions,
    printOptions: parsePrintOptions(modernValue.printOptions)
  }
}

export function serializeDefi(definition: DefiDefinition): string {
  return JSON.stringify(definition)
}
