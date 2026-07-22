import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
import type {
  ChallengePreset,
  ComplementOption,
  ExerciseKind,
  PastSimplePronouns,
  Verb,
} from '../../shared/types/conjugation'
import type { ChallengePresetDefinition, VerbCriterion } from '../../shared/data/challenge-presets'
import { resolveChallengePresetDefinitions } from '../../shared/data/challenge-presets'
import { legacyComplementConfig, normalizeComplementOptions } from '../../shared/utils/complement-options'

type Executor = Pool | PoolConnection

interface CategoryRow extends RowDataPacket {
  id: number
  slug: string
  name: string
  description: string
  sortOrder: number
  isActive: number
}

interface PresetRow extends RowDataPacket {
  databaseId: number
  presetKey: string
  categoryId: number
  categorySlug: string
  categoryName: string
  categoryOrder: number
  name: string
  description: string
  questionCount: number
  exerciseKind: ExerciseKind
  pastSimplePronouns: PastSimplePronouns
  inclusivePronouns: number
  complementOptions: string | ComplementOption[]
  verbSelectionMode: 'criteria' | 'explicit'
  criteriaJson: string | VerbCriterion[]
  sortOrder: number
  isActive: number
}

interface SelectionRow extends RowDataPacket {
  presetId: number
  selectionId: number
}

export interface AdminChallengePresetCategory {
  id: number
  slug: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

export interface AdminChallengePreset extends ChallengePreset {
  databaseId: number
  categoryId: number
  sortOrder: number
  isActive: boolean
  verbSelectionMode: 'criteria' | 'explicit'
}

function parseArray<T>(value: string | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function listChallengePresetCategories(
  database: Executor,
  activeOnly = false,
): Promise<AdminChallengePresetCategory[]> {
  const [rows] = await database.execute<CategoryRow[]>(`SELECT id,slug,name,description,
    sort_order AS sortOrder,is_active AS isActive FROM challenge_preset_categories
    ${activeOnly ? 'WHERE is_active=1' : ''} ORDER BY sort_order,name,id`)
  return rows.map(row => ({ ...row, isActive: Boolean(row.isActive) }))
}

export async function listStoredChallengePresets(
  database: Executor,
  verbs: readonly Verb[],
  activeOnly = false,
): Promise<AdminChallengePreset[]> {
  const where = activeOnly ? 'WHERE p.is_active=1 AND category.is_active=1' : ''
  const [[presetRows], [verbRows], [tenseRows]] = await Promise.all([
    database.execute<PresetRow[]>(`SELECT p.id AS databaseId,p.preset_key AS presetKey,
      p.category_id AS categoryId,category.slug AS categorySlug,category.name AS categoryName,
      category.sort_order AS categoryOrder,p.name,p.description,p.question_count AS questionCount,
      p.exercise_kind AS exerciseKind,p.past_simple_pronouns AS pastSimplePronouns,
      p.inclusive_pronouns AS inclusivePronouns,p.complement_options AS complementOptions,
      p.verb_selection_mode AS verbSelectionMode,p.criteria_json AS criteriaJson,
      p.sort_order AS sortOrder,p.is_active AS isActive
      FROM challenge_presets p
      INNER JOIN challenge_preset_categories category ON category.id=p.category_id
      ${where} ORDER BY category.sort_order,p.sort_order,p.name,p.id`),
    database.execute<SelectionRow[]>(`SELECT preset_id AS presetId,selection_id AS selectionId
      FROM challenge_preset_verbs ORDER BY preset_id,sort_order,selection_id`),
    database.execute<SelectionRow[]>(`SELECT preset_id AS presetId,tense_id AS selectionId
      FROM challenge_preset_tenses ORDER BY preset_id,sort_order,tense_id`),
  ])
  const verbIdsByPreset = new Map<number, number[]>()
  for (const row of verbRows) {
    const ids = verbIdsByPreset.get(Number(row.presetId)) ?? []
    ids.push(Number(row.selectionId))
    verbIdsByPreset.set(Number(row.presetId), ids)
  }
  const tenseIdsByPreset = new Map<number, number[]>()
  for (const row of tenseRows) {
    const ids = tenseIdsByPreset.get(Number(row.presetId)) ?? []
    ids.push(Number(row.selectionId))
    tenseIdsByPreset.set(Number(row.presetId), ids)
  }

  return presetRows.map((row) => {
    const complementOptions = normalizeComplementOptions(parseArray(row.complementOptions))
    const legacy = legacyComplementConfig(complementOptions)
    const criteria = parseArray<VerbCriterion>(row.criteriaJson)
    const definition: ChallengePresetDefinition = {
      id: row.presetKey,
      label: row.name,
      description: row.description,
      group: row.categorySlug,
      criteria,
      tenseIds: tenseIdsByPreset.get(Number(row.databaseId)) ?? [],
      questionCount: Number(row.questionCount),
    }
    const resolved = row.verbSelectionMode === 'explicit'
      ? (verbIdsByPreset.get(Number(row.databaseId)) ?? [])
      : resolveChallengePresetDefinitions([definition], verbs)[0]?.verbIds ?? []
    return {
      databaseId: Number(row.databaseId),
      id: row.presetKey,
      label: row.name,
      description: row.description,
      group: row.categorySlug,
      groupLabel: row.categoryName,
      groupOrder: Number(row.categoryOrder),
      categoryId: Number(row.categoryId),
      criteria,
      verbIds: resolved,
      tenseIds: [...definition.tenseIds],
      questionCount: Number(row.questionCount),
      exerciseKind: row.exerciseKind,
      pastSimplePronouns: row.pastSimplePronouns,
      inclusivePronouns: Boolean(row.inclusivePronouns),
      includeComplements: legacy.includeComplements,
      complementPlacement: legacy.complementPlacement,
      complementOptions,
      sortOrder: Number(row.sortOrder),
      isActive: Boolean(row.isActive),
      verbSelectionMode: row.verbSelectionMode,
    }
  })
}

function text(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function integer(value: unknown, minimum: number, maximum: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null
}

function uniqueIds(value: unknown, allowNegative = false) {
  if (!Array.isArray(value)) return null
  const ids = value.map(Number)
  if (ids.some(id => !Number.isInteger(id) || id === 0 || (!allowNegative && id < 1))) return null
  return [...new Set(ids)]
}

export function parseChallengePresetPayload(value: unknown) {
  const body = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const presetKey = text(body.id, 80)
  const name = text(body.label, 120)
  const description = text(body.description, 500)
  const categoryId = integer(body.categoryId, 1, Number.MAX_SAFE_INTEGER)
  const questionCount = integer(body.questionCount, 1, 100)
  const sortOrder = integer(body.sortOrder, -32768, 32767)
  const verbIds = uniqueIds(body.verbIds, true)
  const tenseIds = uniqueIds(body.tenseIds)
  const exerciseKind = body.exerciseKind
  const pastSimplePronouns = body.pastSimplePronouns
  const complementOptions = normalizeComplementOptions(body.complementOptions)
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/u.test(presetKey) || !name || !categoryId
    || !questionCount || sortOrder === null || !verbIds?.length || !tenseIds?.length
    || !['conjugation', 'tense-identification'].includes(String(exerciseKind))
    || !['all', 'third-person-only'].includes(String(pastSimplePronouns))
    || !Array.isArray(body.complementOptions) || complementOptions.length !== body.complementOptions.length
    || typeof body.inclusivePronouns !== 'boolean' || typeof body.isActive !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Défi pré-enregistré invalide' })
  }
  return {
    presetKey,
    name,
    description,
    categoryId,
    questionCount,
    exerciseKind: exerciseKind as ExerciseKind,
    pastSimplePronouns: pastSimplePronouns as PastSimplePronouns,
    inclusivePronouns: body.inclusivePronouns,
    complementOptions,
    verbIds,
    tenseIds,
    sortOrder,
    isActive: body.isActive,
  }
}

export function parseChallengePresetCategoryPayload(value: unknown) {
  const body = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const slug = text(body.slug, 80).toLocaleLowerCase('fr')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '')
  const name = text(body.name, 120)
  const description = text(body.description, 500)
  const sortOrder = integer(body.sortOrder, -32768, 32767)
  if (!slug || !name || sortOrder === null || typeof body.isActive !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Catégorie de défis invalide' })
  }
  return { slug, name, description, sortOrder, isActive: body.isActive }
}

export async function replaceChallengePresetSelections(
  connection: PoolConnection,
  presetId: number,
  verbIds: readonly number[],
  tenseIds: readonly number[],
) {
  await connection.execute('DELETE FROM challenge_preset_verbs WHERE preset_id=?', [presetId])
  for (const [index, id] of verbIds.entries()) {
    await connection.execute(`INSERT INTO challenge_preset_verbs
      (preset_id,selection_id,sort_order) VALUES (?,?,?)`, [presetId, id, index])
  }
  await connection.execute('DELETE FROM challenge_preset_tenses WHERE preset_id=?', [presetId])
  for (const [index, id] of tenseIds.entries()) {
    await connection.execute(`INSERT INTO challenge_preset_tenses
      (preset_id,tense_id,sort_order) VALUES (?,?,?)`, [presetId, id, index])
  }
}

export async function reorderChallengePresets(
  connection: PoolConnection,
  categoryId: number,
  presetId?: number,
  requestedOrder?: number,
) {
  const [rows] = await connection.execute<Array<RowDataPacket & { id: number }>>(`SELECT id
    FROM challenge_presets WHERE category_id=? ${presetId ? 'AND id<>?' : ''}
    ORDER BY sort_order,name,id`, presetId ? [categoryId, presetId] : [categoryId])
  const ids = rows.map(row => Number(row.id))
  if (presetId) {
    const position = Math.max(0, Math.min(ids.length, Number(requestedOrder ?? ids.length + 1) - 1))
    ids.splice(position, 0, presetId)
  }
  for (const [index, id] of ids.entries()) {
    await connection.execute('UPDATE challenge_presets SET sort_order=? WHERE id=?', [index + 1, id])
  }
  return ids.map((id, index) => ({ id, sortOrder: index + 1 }))
}
