import type { RowDataPacket } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const helpId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ characterId?: number | null }>(event)
  const characterId = body.characterId === null || body.characterId === undefined ? null : Number(body.characterId)
  if (!Number.isInteger(helpId) || helpId < 1
    || (characterId !== null && (!Number.isInteger(characterId) || characterId < 1))) {
    throw createError({ statusCode: 400, statusMessage: 'Association invalide' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [helps] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM coach_help_templates WHERE id=? AND deleted_at IS NULL LIMIT 1', [helpId],
    )
    if (!helps.length) throw createError({ statusCode: 404, statusMessage: 'Aide introuvable' })
    if (characterId !== null) {
      const [characters] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM coach_characters WHERE id=? LIMIT 1', [characterId],
      )
      if (!characters.length) throw createError({ statusCode: 404, statusMessage: 'Caractère introuvable' })
    }
    await connection.execute('UPDATE coach_characters SET help_id=NULL WHERE help_id=?', [helpId])
    if (characterId !== null) await connection.execute('UPDATE coach_characters SET help_id=? WHERE id=?', [helpId, characterId])
    await connection.execute("UPDATE coach_help_templates SET status='draft' WHERE id=?", [helpId])
    await connection.commit()
    return { ok: true }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
