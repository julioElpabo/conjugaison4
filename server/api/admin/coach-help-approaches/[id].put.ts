import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { parseCoachHelpApproachPayload } from '../../../services/coach-help-approaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Approche d’aide invalide' })
  const profile = parseCoachHelpApproachPayload(await readBody(event))
  const database = useDatabase()
  const [result] = await database.execute<ResultSetHeader>(
    'UPDATE coach_help_approaches SET name=?,engine_key=?,sort_order=? WHERE id=?',
    [profile.name, profile.engineKey, profile.sortOrder, id],
  )
  if (!result.affectedRows) {
    const [existing] = await database.execute<RowDataPacket[]>('SELECT id FROM coach_help_approaches WHERE id=? LIMIT 1', [id])
    if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Approche d’aide introuvable' })
  }
  return { ok: true }
})
