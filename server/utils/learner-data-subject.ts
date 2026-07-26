import type { H3Event } from 'h3'
import type { RowDataPacket } from 'mysql2/promise'
import { getLearnerSession, type LearnerSessionUser } from './learner-session'

interface LearnerAccountRow extends RowDataPacket {
  id: number
  username: string
  status: string
}

/**
 * Résout le compte dont les données peuvent être lues.
 *
 * Sans paramètre, il s’agit toujours du compte élève authentifié. Le paramètre
 * adminLearnerId n’est accepté qu’avec une session administrateur valide.
 */
export async function requireLearnerDataSubject(event: H3Event): Promise<LearnerSessionUser> {
  const rawAdminLearnerId = getQuery(event).adminLearnerId
  if (rawAdminLearnerId !== undefined) {
    requireAdministrator(event)
    const id = Number.parseInt(String(rawAdminLearnerId), 10)
    if (!Number.isSafeInteger(id) || id < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Utilisateur invalide' })
    }
    const [[account]] = await useDatabase().execute<LearnerAccountRow[]>(`
      SELECT id, username, status
      FROM learner_accounts
      WHERE id=? AND deleted_at IS NULL
      LIMIT 1
    `, [id])
    if (!account) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
    return { id: Number(account.id), username: account.username, status: account.status }
  }

  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  return learner
}
