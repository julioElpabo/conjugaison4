import type { Pool, ResultSetHeader } from 'mysql2/promise'
import { normalizeDefiCode } from './defis'
import { PublicInputError } from './public-api-validation'

export function parseSavedChallengeRemoval(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PublicInputError('Sélection invalide')
  const body = value as Record<string, unknown>
  if (Object.keys(body).some(key => key !== 'codes') || !Array.isArray(body.codes) || !body.codes.length) {
    throw new PublicInputError('Sélection invalide')
  }
  return [...new Set(body.codes.map(code => {
    if (typeof code !== 'string') throw new PublicInputError('Code de défi invalide')
    return normalizeDefiCode(code)
  }))]
}

export async function removeSavedChallenges(database: Pool, accountId: number, codes: string[]) {
  if (!codes.length) return 0
  // Seule l'association au compte est retirée. Les défis partagés et les
  // résultats d'entraînement ne sont jamais supprimés par cette requête.
  const [result] = await database.execute<ResultSetHeader>(`
    DELETE saved FROM learner_saved_challenges saved
    INNER JOIN defis d ON d.id = saved.defi_id
    WHERE saved.account_id = ? AND d.name IN (${codes.map(() => '?').join(', ')})
  `, [accountId, ...codes])
  return result.affectedRows
}
