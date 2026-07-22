import type { ResultSetHeader } from 'mysql2/promise'
import { parseChallengePresetCategoryPayload } from '../../../services/challenge-presets'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
  const payload = parseChallengePresetCategoryPayload(await readBody(event))
  try {
    const [result] = await useDatabase().execute<ResultSetHeader>(`UPDATE challenge_preset_categories SET
      slug=?,name=?,description=?,sort_order=?,is_active=? WHERE id=?`, [
      payload.slug, payload.name, payload.description, payload.sortOrder, payload.isActive ? 1 : 0, id,
    ])
    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Catégorie introuvable' })
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 409, statusMessage: 'Cette catégorie existe déjà' })
    }
    throw error
  }
  return { ok: true }
})
