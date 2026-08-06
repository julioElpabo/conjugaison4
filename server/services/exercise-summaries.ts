import { createHash, randomBytes } from 'node:crypto'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { SUPPORTED_LOCALES, type AppLocale } from '../../shared/i18n/locales'
import type {
  ExerciseSummaryItem,
  ExerciseSummaryShareRequest,
  ExerciseSummaryTense,
  SharedExerciseSummary,
} from '../../shared/types/exercise-summary'
import { useDatabase } from '../utils/database'

interface SummaryRow extends RowDataPacket {
  payload: string
  createdAt: Date | string
}

interface SummaryAdminStatsRow extends RowDataPacket {
  totalCount: number
  expiredCount: number
}

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{24}$/u

export class ExerciseSummaryInputError extends Error {}
export class ExerciseSummaryNotFoundError extends Error {}
export class ExerciseSummaryStorageError extends Error {}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ExerciseSummaryInputError('Bilan invalide')
  }
  return value as Record<string, unknown>
}

function text(value: unknown, maximum: number, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.trim().slice(0, maximum)
}

function stringList(value: unknown, maximumItems: number, maximumLength: number) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(item => text(item, maximumLength)).filter(Boolean))].slice(0, maximumItems)
}

function parseItem(value: unknown, index: number): ExerciseSummaryItem {
  const item = record(value)
  const status = item.status === 'correct' ? 'correct' : item.status === 'incorrect' ? 'incorrect' : null
  const questionLabel = text(item.questionLabel, 1000)
  const expectedAnswer = text(item.expectedAnswer, 1000)
  if (!status || !questionLabel || !expectedAnswer) {
    throw new ExerciseSummaryInputError(`Question ${index + 1} invalide`)
  }
  return {
    index: index + 1,
    status,
    questionLabel,
    learnerAnswer: text(item.learnerAnswer, 1000),
    expectedAnswer,
    errorLabels: stringList(item.errorLabels, 12, 160),
  }
}

function parseTense(value: unknown): ExerciseSummaryTense | null {
  const tense = record(value)
  const name = text(tense.name, 120)
  if (!name) return null
  const mode = text(tense.mode, 120)
  return { name, ...(mode ? { mode } : {}) }
}

export function parseExerciseSummaryShareRequest(value: unknown): ExerciseSummaryShareRequest {
  const input = record(value)
  if (input.version !== 1) throw new ExerciseSummaryInputError('Version de bilan invalide')
  if (!SUPPORTED_LOCALES.includes(input.locale as AppLocale)) {
    throw new ExerciseSummaryInputError('Langue du bilan invalide')
  }
  if (input.presentation !== 'classic' && input.presentation !== 'chat') {
    throw new ExerciseSummaryInputError('Présentation du bilan invalide')
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 100) {
    throw new ExerciseSummaryInputError('Le bilan doit contenir entre 1 et 100 réponses')
  }
  const tenses = Array.isArray(input.tenses)
    ? input.tenses.slice(0, 50).map(parseTense).filter((item): item is ExerciseSummaryTense => Boolean(item))
    : []
  return {
    version: 1,
    locale: input.locale as AppLocale,
    presentation: input.presentation,
    items: input.items.map(parseItem),
    verbs: stringList(input.verbs, 100, 120),
    tenses,
  }
}

export function normalizeExerciseSummaryToken(value: string | undefined) {
  const token = (value || '').trim()
  if (!TOKEN_PATTERN.test(token)) throw new ExerciseSummaryInputError('Lien de bilan invalide')
  return token
}

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

let exerciseSummaryTableReady: Promise<void> | null = null

export function ensureExerciseSummaryTable() {
  if (exerciseSummaryTableReady) return exerciseSummaryTableReady
  exerciseSummaryTableReady = useDatabase().query(`
    CREATE TABLE IF NOT EXISTS shared_exercise_summaries (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
      payload LONGTEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_shared_exercise_summaries_token (token_hash),
      KEY idx_shared_exercise_summaries_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).then(
    () => undefined,
    (error) => {
      exerciseSummaryTableReady = null
      throw error
    },
  )
  return exerciseSummaryTableReady
}

export async function saveExerciseSummary(value: unknown) {
  const summary = parseExerciseSummaryShareRequest(value)
  const token = randomBytes(18).toString('base64url')
  await ensureExerciseSummaryTable()
  await useDatabase().execute(
    'INSERT INTO shared_exercise_summaries (token_hash, payload) VALUES (?, ?)',
    [tokenHash(token), JSON.stringify(summary)],
  )
  return token
}

export async function getExerciseSummary(token: string): Promise<SharedExerciseSummary> {
  await ensureExerciseSummaryTable()
  const [rows] = await useDatabase().execute<SummaryRow[]>(`
    SELECT payload, created_at AS createdAt
    FROM shared_exercise_summaries
    WHERE token_hash = ?
      AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)
    LIMIT 1
  `, [tokenHash(normalizeExerciseSummaryToken(token))])
  const row = rows[0]
  if (!row) throw new ExerciseSummaryNotFoundError('Bilan introuvable')
  try {
    const summary = parseExerciseSummaryShareRequest(JSON.parse(row.payload))
    const correctCount = summary.items.filter(item => item.status === 'correct').length
    return {
      ...summary,
      correctCount,
      score: Math.round(correctCount / summary.items.length * 100),
      createdAt: new Date(row.createdAt).toISOString(),
    }
  } catch (error) {
    if (error instanceof ExerciseSummaryInputError) {
      throw new ExerciseSummaryStorageError('Le bilan enregistré est illisible')
    }
    throw error
  }
}

export async function getExerciseSummaryAdminStats() {
  await ensureExerciseSummaryTable()
  const [[row]] = await useDatabase().execute<SummaryAdminStatsRow[]>(`
    SELECT
      COUNT(*) AS totalCount,
      COALESCE(SUM(created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)), 0) AS expiredCount
    FROM shared_exercise_summaries
  `)
  return {
    totalCount: Number(row?.totalCount || 0),
    expiredCount: Number(row?.expiredCount || 0),
  }
}

export async function deleteExpiredExerciseSummaries() {
  await ensureExerciseSummaryTable()
  const [result] = await useDatabase().execute<ResultSetHeader>(`
    DELETE FROM shared_exercise_summaries
    WHERE created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)
  `)
  return Number(result.affectedRows || 0)
}
