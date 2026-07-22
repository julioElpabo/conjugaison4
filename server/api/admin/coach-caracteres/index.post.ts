import type { ResultSetHeader } from 'mysql2/promise'
import { parseCaracterePayload } from '../../../services/coaches'
import { replaceCaractereChildren } from '../../../services/coach-caracteres'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody(event)
  const { profile, replies, assignments, rules } = parseCaracterePayload(body)
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO coach_characters
      (slug,name,masculine_name,emoticon,pedagogical_style,help_approach_id,status,sort_order)
      VALUES (?,?,?,?,?,?,?,?)`,
    [profile.slug, profile.masculineName, profile.masculineName, profile.emoticon, profile.pedagogicalStyle,
      profile.helpApproachId, profile.status, profile.sortOrder])
    await replaceCaractereChildren(connection, result.insertId, replies, assignments, rules)
    await connection.commit()
    return { ok: true, id: result.insertId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally { connection.release() }
})
