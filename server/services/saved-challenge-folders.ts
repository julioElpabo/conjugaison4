import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { SavedChallengeFolder } from '../../shared/types/saved-challenge'
import { PublicInputError } from './public-api-validation'
import { parseSavedChallengeRemoval } from './saved-challenge-removal'
import { DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR, isSavedChallengeFolderColor, savedChallengeFolderColor, type SavedChallengeFolderColor } from '../../shared/utils/saved-challenge-folder-colors'

const readiness = new WeakMap<Pool, Promise<void>>()

export class SavedChallengeFolderError extends Error {
  constructor(message: string, public readonly statusCode: 404 | 409) { super(message) }
}

export function ensureSavedChallengeFolders(database: Pool): Promise<void> {
  const pending = readiness.get(database)
  if (pending) return pending
  const promise = initializeSavedChallengeFolders(database).catch(error => {
    readiness.delete(database)
    throw error
  })
  readiness.set(database, promise)
  return promise
}

export async function initializeSavedChallengeFolders(database: Pool): Promise<void> {
  await database.query(`
    CREATE TABLE IF NOT EXISTS learner_challenge_folders (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      account_id BIGINT UNSIGNED NOT NULL,
      name VARCHAR(80) NOT NULL,
      color VARCHAR(16) NOT NULL DEFAULT '${DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR}',
      UNIQUE KEY uq_learner_challenge_folder_name (account_id, name),
      CONSTRAINT fk_learner_challenge_folder_account
        FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  const [folderColumns] = await database.query<RowDataPacket[]>('SHOW COLUMNS FROM learner_challenge_folders')
  if (!folderColumns.some(column => column.Field === 'color')) {
    try {
      await database.query(`ALTER TABLE learner_challenge_folders ADD COLUMN color VARCHAR(16) NOT NULL DEFAULT '${DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR}'`)
    } catch (error) {
      if (!hasDatabaseCode(error, 'ER_DUP_FIELDNAME')) throw error
    }
  }
  const [columns] = await database.query<RowDataPacket[]>('SHOW COLUMNS FROM learner_saved_challenges')
  if (!columns.some(column => column.Field === 'folder_id')) {
    try {
      await database.query('ALTER TABLE learner_saved_challenges ADD COLUMN folder_id BIGINT UNSIGNED NULL')
    } catch (error) {
      if (!hasDatabaseCode(error, 'ER_DUP_FIELDNAME')) throw error
    }
  }
  const [indexes] = await database.query<RowDataPacket[]>('SHOW INDEX FROM learner_saved_challenges')
  if (!indexes.some(index => index.Key_name === 'idx_learner_saved_challenges_folder')) {
    try {
      await database.query('ALTER TABLE learner_saved_challenges ADD KEY idx_learner_saved_challenges_folder (account_id, folder_id)')
    } catch (error) {
      if (!hasDatabaseCode(error, 'ER_DUP_KEYNAME')) throw error
    }
  }
  const [constraints] = await database.query<RowDataPacket[]>(`
    SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'learner_saved_challenges'
      AND COLUMN_NAME = 'folder_id' AND REFERENCED_TABLE_NAME = 'learner_challenge_folders'
  `)
  if (!constraints.length) {
    try {
      // Supprimer un dossier libère les cartes ; aucun défi n'est supprimé.
      await database.query(`ALTER TABLE learner_saved_challenges
        ADD CONSTRAINT fk_learner_saved_challenges_folder FOREIGN KEY (folder_id)
        REFERENCES learner_challenge_folders(id) ON DELETE SET NULL`)
    } catch (error) {
      // Plusieurs instances de l'application peuvent démarrer simultanément.
      if (!hasDatabaseCode(error, 'ER_FK_DUP_NAME')) throw error
    }
  }
}

function hasDatabaseCode(error: unknown, code: string) {
  return !!error && typeof error === 'object' && 'code' in error && error.code === code
}

export function parseChallengeFolderName(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PublicInputError('Dossier invalide')
  const body = value as Record<string, unknown>
  if (Object.keys(body).some(key => key !== 'name') || typeof body.name !== 'string') throw new PublicInputError('Nom de dossier requis')
  const name = body.name.trim()
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/u.test(name)) throw new PublicInputError('Nom de dossier invalide (1 à 80 caractères)')
  return name
}

export function parseChallengeFolderId(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) throw new PublicInputError('Dossier invalide')
  return value
}

export function parseChallengeFolderPatch(value: unknown): { name?: string, color?: SavedChallengeFolderColor } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PublicInputError('Dossier invalide')
  const body = value as Record<string, unknown>
  if (!Object.keys(body).length || Object.keys(body).some(key => key !== 'name' && key !== 'color')) throw new PublicInputError('Champ non autorisé')
  const patch: { name?: string, color?: SavedChallengeFolderColor } = {}
  if ('name' in body) patch.name = parseChallengeFolderName({ name: body.name })
  if ('color' in body) {
    if (!isSavedChallengeFolderColor(body.color)) throw new PublicInputError('Couleur de dossier invalide')
    patch.color = body.color
  }
  return patch
}

export function parseChallengeFolderCreation(value: unknown): { name: string, color: SavedChallengeFolderColor } {
  const folder = parseChallengeFolderPatch(value)
  if (!folder.name) throw new PublicInputError('Nom de dossier requis')
  return { name: folder.name, color: folder.color ?? DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR }
}

export function parseSavedChallengeMove(value: unknown): { codes: string[], folderId: number | null } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PublicInputError('Déplacement invalide')
  const body = value as Record<string, unknown>
  if (Object.keys(body).some(key => key !== 'codes' && key !== 'folderId')) throw new PublicInputError('Champ non autorisé')
  return {
    codes: parseSavedChallengeRemoval({ codes: body.codes }),
    folderId: body.folderId === null ? null : parseChallengeFolderId(body.folderId),
  }
}

export async function listSavedChallengeFolders(database: Pool, accountId: number): Promise<SavedChallengeFolder[]> {
  await ensureSavedChallengeFolders(database)
  const [rows] = await database.execute<RowDataPacket[]>(
    'SELECT id, name, color FROM learner_challenge_folders WHERE account_id = ? ORDER BY name, id', [accountId],
  )
  return rows.map(row => ({ id: Number(row.id), name: row.name, color: savedChallengeFolderColor(row.color) }))
}

export async function updateChallengeFolder(database: Pool, accountId: number, id: number, patch: { name?: string, color?: SavedChallengeFolderColor }): Promise<SavedChallengeFolder> {
  await ensureSavedChallengeFolders(database)
  const keys = (['name', 'color'] as const).filter(key => patch[key] !== undefined)
  if (!keys.length) throw new PublicInputError('Modification de dossier vide')
  try {
    const [result] = await database.execute<ResultSetHeader>(
      `UPDATE learner_challenge_folders SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ? AND account_id = ?`,
      [...keys.map(key => patch[key]!), id, accountId],
    )
    if (!result.affectedRows) throw new SavedChallengeFolderError('Dossier introuvable', 404)
    const [[folder]] = await database.execute<RowDataPacket[]>(
      'SELECT id, name, color FROM learner_challenge_folders WHERE id = ? AND account_id = ?', [id, accountId],
    )
    if (!folder) throw new SavedChallengeFolderError('Dossier introuvable', 404)
    return { id: Number(folder.id), name: folder.name, color: savedChallengeFolderColor(folder.color) }
  } catch (error) {
    if (hasDatabaseCode(error, 'ER_DUP_ENTRY')) throw new SavedChallengeFolderError('Un dossier porte déjà ce nom', 409)
    throw error
  }
}

export async function saveChallengeFolder(database: Pool, accountId: number, name: string, id?: number, color: SavedChallengeFolderColor = DEFAULT_SAVED_CHALLENGE_FOLDER_COLOR): Promise<SavedChallengeFolder> {
  await ensureSavedChallengeFolders(database)
  try {
    if (id !== undefined) {
      return await updateChallengeFolder(database, accountId, id, { name })
    }
    const [result] = await database.execute<ResultSetHeader>(
      'INSERT INTO learner_challenge_folders (account_id, name, color) VALUES (?, ?, ?)', [accountId, name, color],
    )
    return { id: result.insertId, name, color }
  } catch (error) {
    if (hasDatabaseCode(error, 'ER_DUP_ENTRY')) throw new SavedChallengeFolderError('Un dossier porte déjà ce nom', 409)
    throw error
  }
}

export async function deleteChallengeFolder(database: Pool, accountId: number, id: number): Promise<void> {
  await ensureSavedChallengeFolders(database)
  const [result] = await database.execute<ResultSetHeader>(
    'DELETE FROM learner_challenge_folders WHERE id = ? AND account_id = ?', [id, accountId],
  )
  if (!result.affectedRows) throw new SavedChallengeFolderError('Dossier introuvable', 404)
}

export async function moveSavedChallenges(database: Pool, accountId: number, codes: string[], folderId: number | null): Promise<void> {
  await ensureSavedChallengeFolders(database)
  const connection = await database.getConnection()
  try {
    await connection.beginTransaction()
    if (folderId !== null) {
      const [folders] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM learner_challenge_folders WHERE id = ? AND account_id = ? FOR UPDATE', [folderId, accountId],
      )
      if (!folders.length) throw new SavedChallengeFolderError('Dossier introuvable', 404)
    }
    const placeholders = codes.map(() => '?').join(', ')
    const [challenges] = await connection.execute<RowDataPacket[]>(`
      SELECT d.name AS code FROM learner_saved_challenges saved
      INNER JOIN defis d ON d.id = saved.defi_id
      WHERE saved.account_id = ? AND d.name IN (${placeholders}) FOR UPDATE
    `, [accountId, ...codes])
    if (new Set(challenges.map(challenge => challenge.code)).size !== codes.length) {
      throw new SavedChallengeFolderError('Un défi est absent de ton compte', 404)
    }
    await connection.execute(`
      UPDATE learner_saved_challenges saved INNER JOIN defis d ON d.id = saved.defi_id
      SET saved.folder_id = ? WHERE saved.account_id = ? AND d.name IN (${placeholders})
    `, [folderId, accountId, ...codes])
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
