import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { parseChallengeTitle, parseChallengeDescription, PublicInputError } from './public-api-validation'

const readiness = new WeakMap<Pool, Promise<void>>()

// Les requêtes doivent attendre la migration, y compris après un rechargement
// du serveur de développement ou un échec transitoire au démarrage.
export function ensureSavedChallengeMetadata(database: Pool): Promise<void> {
  const pending = readiness.get(database)
  if (pending) return pending
  const promise = initializeSavedChallengeMetadata(database).then(() => {}).catch(error => {
    readiness.delete(database)
    throw error
  })
  readiness.set(database, promise)
  return promise
}

export async function initializeSavedChallengeMetadata(database: Pool): Promise<boolean> {
  const [columns] = await database.query<RowDataPacket[]>('SHOW COLUMNS FROM learner_saved_challenges')
  const additions = []
  if (!columns.some(column => column.Field === 'custom_title')) additions.push('ADD COLUMN custom_title VARCHAR(80) NULL')
  if (!columns.some(column => column.Field === 'custom_description')) additions.push('ADD COLUMN custom_description TEXT NULL')
  if (!additions.length) return false
  try {
    await database.query(`ALTER TABLE learner_saved_challenges ${additions.join(', ')}`)
  } catch (error) {
    // Un autre processus peut avoir ajouté les colonnes après SHOW COLUMNS.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_FIELDNAME') {
      return initializeSavedChallengeMetadata(database)
    }
    throw error
  }
  return true
}

export function parseSavedChallengeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PublicInputError('Modification invalide')
  const body = value as Record<string, unknown>
  if (Object.keys(body).some(key => key !== 'title' && key !== 'description')) throw new PublicInputError('Champ non autorisé')
  if (typeof body.title !== 'string' || typeof body.description !== 'string') throw new PublicInputError('Titre et description requis')
  return { title: parseChallengeTitle(body.title)!, description: parseChallengeDescription(body.description) ?? '' }
}

export async function updateSavedChallengeMetadata(database: Pool, accountId: number, code: string, metadata: { title: string, description: string }) {
  await ensureSavedChallengeMetadata(database)
  const [result] = await database.execute<ResultSetHeader>(`
    UPDATE learner_saved_challenges saved
    INNER JOIN defis d ON d.id = saved.defi_id
    SET saved.custom_title = ?, saved.custom_description = ?
    WHERE saved.account_id = ? AND d.name = ?
  `, [metadata.title, metadata.description, accountId, code])
  return result.affectedRows > 0
}
