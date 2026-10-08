import type { Pool, RowDataPacket } from 'mysql2/promise'
import type { LearnerPreferences } from '../../shared/types/learner-preferences'
import { PublicInputError } from './public-api-validation'

const readiness = new WeakMap<Pool, Promise<void>>()
const columns = {
  interfaceLocale: 'interface_locale',
  colorTheme: 'color_theme',
  tenseClassification: 'tense_classification',
} as const

export function ensureLearnerPreferenceClassification(database: Pool): Promise<void> {
  const pending = readiness.get(database)
  if (pending) return pending
  const promise = initializeLearnerPreferenceClassification(database).then(() => {}).catch(error => {
    readiness.delete(database)
    throw error
  })
  readiness.set(database, promise)
  return promise
}

export async function initializeLearnerPreferenceClassification(database: Pool): Promise<boolean> {
  const [existing] = await database.query<RowDataPacket[]>('SHOW COLUMNS FROM learner_preferences')
  if (existing.some(column => column.Field === 'tense_classification')) return false
  try {
    await database.query("ALTER TABLE learner_preferences ADD COLUMN tense_classification VARCHAR(15) NOT NULL DEFAULT 'traditional'")
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_FIELDNAME') {
      return initializeLearnerPreferenceClassification(database)
    }
    throw error
  }
  return true
}

export function parseLearnerPreferencesPatch(value: unknown): Partial<LearnerPreferences> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PublicInputError('Préférences invalides')
  const body = value as Record<string, unknown>
  if (!Object.keys(body).length || Object.keys(body).some(key => !Object.hasOwn(columns, key))) throw new PublicInputError('Préférences invalides')
  const choices = {
    interfaceLocale: ['fr', 'de', 'en', 'it', 'es', 'nl', 'nl-NL'],
    colorTheme: ['light', 'dark'],
    tenseClassification: ['traditional', 'modern'],
  }
  for (const key of Object.keys(choices) as (keyof LearnerPreferences)[]) {
    if (key in body && (typeof body[key] !== 'string' || !choices[key].includes(body[key] as string))) {
      throw new PublicInputError('Préférences invalides')
    }
  }
  return body as Partial<LearnerPreferences>
}

export async function readLearnerPreferences(database: Pool, accountId: number): Promise<LearnerPreferences> {
  await ensureLearnerPreferenceClassification(database)
  const [[preferences]] = await database.execute<RowDataPacket[]>(`
    SELECT interface_locale AS interfaceLocale, color_theme AS colorTheme,
      tense_classification AS tenseClassification
    FROM learner_preferences WHERE account_id=? LIMIT 1
  `, [accountId])
  return {
    interfaceLocale: preferences?.interfaceLocale || 'fr',
    colorTheme: preferences?.colorTheme === 'dark' ? 'dark' : 'light',
    tenseClassification: preferences?.tenseClassification === 'modern' ? 'modern' : 'traditional',
  }
}

export async function updateLearnerPreferences(database: Pool, accountId: number, patch: Partial<LearnerPreferences>) {
  await ensureLearnerPreferenceClassification(database)
  const keys = (Object.keys(columns) as (keyof LearnerPreferences)[]).filter(key => patch[key] !== undefined)
  const names = keys.map(key => columns[key])
  await database.execute(`
    INSERT INTO learner_preferences (account_id, ${names.join(', ')})
    VALUES (?, ${keys.map(() => '?').join(', ')})
    ON DUPLICATE KEY UPDATE ${names.map(name => `${name}=VALUES(${name})`).join(', ')}
  `, [accountId, ...keys.map(key => patch[key]!)])
  return readLearnerPreferences(database, accountId)
}
