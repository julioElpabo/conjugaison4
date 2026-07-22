import type { ResultSetHeader } from 'mysql2/promise'
import { parseChallengePresetCategoryPayload } from '../../../services/challenge-presets'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const payload = parseChallengePresetCategoryPayload(await readBody(event))
  try {
    const [result] = await useDatabase().execute<ResultSetHeader>(`INSERT INTO challenge_preset_categories
      (slug,name,description,sort_order,is_active) VALUES (?,?,?,?,?)`, [
      payload.slug, payload.name, payload.description, payload.sortOrder, payload.isActive ? 1 : 0,
    ])
    return { ok: true, id: result.insertId }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 409, statusMessage: 'Cette catégorie existe déjà' })
    }
    throw error
  }
})
