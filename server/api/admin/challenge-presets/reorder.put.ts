import type { RowDataPacket } from 'mysql2/promise'

interface PresetIdRow extends RowDataPacket { id: number }

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody(event)
  const categoryId = Number(body?.categoryId)
  const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds.map(Number) : []
  if (!Number.isInteger(categoryId) || categoryId < 1 || !orderedIds.length
    || orderedIds.some((id: number) => !Number.isInteger(id) || id < 1)
    || new Set(orderedIds).size !== orderedIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'Ordre des défis invalide' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute<PresetIdRow[]>(
      'SELECT id FROM challenge_presets WHERE category_id=? FOR UPDATE', [categoryId],
    )
    const storedIds = rows.map(row => Number(row.id)).sort((a, b) => a - b)
    const requestedIds = [...orderedIds].sort((a, b) => a - b)
    if (storedIds.length !== requestedIds.length || storedIds.some((id, index) => id !== requestedIds[index])) {
      throw createError({ statusCode: 409, statusMessage: 'La liste des défis a changé, rechargez la page' })
    }
    for (const [index, id] of orderedIds.entries()) {
      await connection.execute('UPDATE challenge_presets SET sort_order=? WHERE id=?', [index + 1, id])
    }
    await connection.commit()
    return { ok: true }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
