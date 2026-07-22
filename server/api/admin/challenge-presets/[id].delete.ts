import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { reorderChallengePresets } from '../../../services/challenge-presets'

interface CurrentPresetRow extends RowDataPacket { categoryId: number }

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Défi invalide' })
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [[current]] = await connection.execute<CurrentPresetRow[]>(
      'SELECT category_id AS categoryId FROM challenge_presets WHERE id=? FOR UPDATE', [id],
    )
    const [result] = await connection.execute<ResultSetHeader>('DELETE FROM challenge_presets WHERE id=?', [id])
    if (result.affectedRows === 0 || !current) {
      throw createError({ statusCode: 404, statusMessage: 'Défi introuvable' })
    }
    await reorderChallengePresets(connection, Number(current.categoryId))
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  return { ok: true }
})
