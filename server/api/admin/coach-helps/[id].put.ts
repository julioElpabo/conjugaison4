import { parseCoachHelpPayload, replaceCoachHelpBlocks } from '../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Aide invalide' })
  const { profile, blocks } = parseCoachHelpPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute(`UPDATE coach_help_templates SET
      name=?,description=?,header_title=?,header_description=?,status=? WHERE id=? AND deleted_at IS NULL`,
      [profile.name, profile.description, profile.headerTitle, profile.headerDescription, profile.status, id])
    if (!(result as { affectedRows: number }).affectedRows) throw createError({ statusCode: 404, statusMessage: 'Aide introuvable' })
    await replaceCoachHelpBlocks(connection, id, blocks)
    await connection.commit()
    return { ok: true }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
