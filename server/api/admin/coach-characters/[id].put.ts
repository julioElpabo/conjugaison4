import { parseCharacterPayload } from '../../../services/coaches'
import { replaceCharacterChildren } from '../../../services/coach-characters'
import { ensureCoachCharacterHelp } from '../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Caractère invalide' })
  const { profile, replies, assignments, rules } = parseCharacterPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(`UPDATE coach_characters SET slug=?,name=?,masculine_name=?,feminine_name=?,emoticon=?,description=?,
      pedagogical_style=?,status=?,sort_order=? WHERE id=?`,
    [profile.slug, profile.masculineName, profile.masculineName, profile.feminineName, profile.emoticon, profile.description,
      profile.pedagogicalStyle, profile.status, profile.sortOrder, id])
    await ensureCoachCharacterHelp(connection, id)
    await replaceCharacterChildren(connection, id, replies, assignments, rules)
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally { connection.release() }
  return { ok: true }
})
