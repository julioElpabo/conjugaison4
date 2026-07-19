import { ensureCoachCharacterHelp } from '../../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const characterId = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(characterId) || characterId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Caractère invalide' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const helpId = await ensureCoachCharacterHelp(connection, characterId)
    await connection.commit()
    return { ok: true, helpId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
