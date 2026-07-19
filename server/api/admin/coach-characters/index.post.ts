import type { ResultSetHeader } from 'mysql2/promise'
import { parseCharacterPayload } from '../../../services/coaches'
import { replaceCharacterChildren } from '../../../services/coach-characters'
import { createCoachHelpForCharacter } from '../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const { profile, replies, assignments, rules } = parseCharacterPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const helpId = await createCoachHelpForCharacter(connection, profile.masculineName, profile.description)
    const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO coach_characters
      (slug,name,masculine_name,feminine_name,emoticon,description,pedagogical_style,help_id,status,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [profile.slug, profile.masculineName, profile.masculineName, profile.feminineName, profile.emoticon, profile.description,
      profile.pedagogicalStyle, helpId, profile.status, profile.sortOrder])
    await replaceCharacterChildren(connection, result.insertId, replies, assignments, rules)
    await connection.commit()
    return { ok: true, id: result.insertId, helpId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally { connection.release() }
})
