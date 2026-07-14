import type { ResultSetHeader } from 'mysql2/promise'
import { parseCharacterPayload } from '../../../services/coaches'
import { replaceCharacterChildren } from '../../../services/coach-characters'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const { profile, replies, assignments, rules } = parseCharacterPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO coach_characters
      (slug,name,description,pedagogical_style,status,sort_order) VALUES (?,?,?,?,?,?)`,
    [profile.slug, profile.name, profile.description, profile.pedagogicalStyle, profile.status, profile.sortOrder])
    await replaceCharacterChildren(connection, result.insertId, replies, assignments, rules)
    await connection.commit()
    return { ok: true, id: result.insertId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally { connection.release() }
})
