import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'

interface UserRow extends RowDataPacket { id: number, privilegeId: number }
interface CountRow extends RowDataPacket { count: number }

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const id = Number.parseInt(getRouterParam(event, 'id') || '', 10)
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Utilisateur invalide' })
  if (administrator.id === id) throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas supprimer votre propre compte' })

  const database = useDatabase()
  const [[user]] = await database.execute<UserRow[]>('SELECT id, privilege_id AS privilegeId FROM users WHERE id = ? LIMIT 1', [id])
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  if (Number(user.privilegeId) === 1) {
    const [[administrators]] = await database.execute<CountRow[]>('SELECT COUNT(*) AS count FROM users WHERE privilege_id = 1')
    if (Number(administrators?.count || 0) <= 1) {
      throw createError({ statusCode: 400, statusMessage: 'Le dernier administrateur ne peut pas être supprimé' })
    }
  }

  const [result] = await database.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [id])
  if (result.affectedRows !== 1) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  return { ok: true }
})
