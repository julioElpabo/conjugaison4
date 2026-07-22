import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'

interface UsageRow extends RowDataPacket { total: number }

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
  const [[usage]] = await useDatabase().execute<UsageRow[]>('SELECT COUNT(*) AS total FROM challenge_presets WHERE category_id=?', [id])
  if (Number(usage?.total ?? 0) > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Déplacez ou supprimez d’abord les défis de cette catégorie' })
  }
  const [result] = await useDatabase().execute<ResultSetHeader>('DELETE FROM challenge_preset_categories WHERE id=?', [id])
  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Catégorie introuvable' })
  }
  return { ok: true }
})
