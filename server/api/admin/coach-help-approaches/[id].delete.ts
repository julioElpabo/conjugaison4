import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Approche d’aide invalide' })
  const database = useDatabase()
  const [[usage]] = await database.execute<(RowDataPacket & { total: number })[]>(
    'SELECT COUNT(*) AS total FROM coach_characters WHERE help_approach_id=?', [id],
  )
  if (Number(usage?.total)) {
    throw createError({ statusCode: 409, statusMessage: 'Cette approche est encore utilisée par un caractère' })
  }
  const [[remaining]] = await database.execute<(RowDataPacket & { total: number })[]>('SELECT COUNT(*) AS total FROM coach_help_approaches')
  if (Number(remaining?.total) <= 1) throw createError({ statusCode: 409, statusMessage: 'Il faut conserver au moins une approche' })
  const [result] = await database.execute<ResultSetHeader>('DELETE FROM coach_help_approaches WHERE id=?', [id])
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: 'Approche d’aide introuvable' })
  return { ok: true }
})
