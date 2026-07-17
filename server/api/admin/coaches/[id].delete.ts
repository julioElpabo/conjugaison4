import type { ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Coach invalide' })
  const [result] = await useDatabase().execute<ResultSetHeader>('DELETE FROM coaches WHERE id=?', [id])
  if (result.affectedRows === 0) throw createError({ statusCode: 404, statusMessage: 'Coach introuvable' })
  return { ok: true }
})
