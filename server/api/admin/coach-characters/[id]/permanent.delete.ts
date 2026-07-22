import { deleteCharacterPermanently } from '../../../../services/coach-characters'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Caractère invalide' })

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const deleted = await deleteCharacterPermanently(connection, id)
    if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Caractère introuvable' })
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  return { ok: true }
})
