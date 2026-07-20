import { parseCoachPayload } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Coach invalide' })
  const { profile } = parseCoachPayload(await readBody(event))
  await useDatabase().execute(`UPDATE coaches SET slug=?, first_name=?, last_name=?, gender=?, avatar_path=?, description=?, likes=?, character_id=?,
    theme_color=?, status=?, sort_order=? WHERE id=?`, [profile.slug, profile.firstName, profile.lastName, profile.gender,
    profile.avatarPath, profile.description, profile.likes, profile.characterId, profile.themeColor, profile.status, profile.sortOrder, id])
  return { ok: true }
})
