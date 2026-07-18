import type { ResultSetHeader } from 'mysql2/promise'
import { parseCoachHelpPayload, replaceCoachHelpBlocks } from '../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const { profile, blocks } = parseCoachHelpPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO coach_help_templates
        (name,description,header_title,header_description,status) VALUES (?,?,?,?,?)`,
      [profile.name, profile.description, profile.headerTitle, profile.headerDescription, profile.status],
    )
    await replaceCoachHelpBlocks(connection, result.insertId, blocks)
    await connection.commit()
    return { ok: true, id: result.insertId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
