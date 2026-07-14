import type { ResultSetHeader } from 'mysql2/promise'
import { parseCoachPayload } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const { profile } = parseCoachPayload(await readBody(event))
  const [result] = await useDatabase().execute<ResultSetHeader>(`INSERT INTO coaches
    (slug, first_name, last_name, gender, avatar_path, description, character_id, personality, pedagogical_style, theme_color, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, '', '', ?, ?, ?)`, [profile.slug, profile.firstName, profile.lastName, profile.gender, profile.avatarPath,
    profile.description, profile.characterId, profile.themeColor, 'draft', profile.sortOrder])
  return { ok: true, id: result.insertId }
})
