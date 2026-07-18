import { publishCoachHelps } from '../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const count = await publishCoachHelps(connection)
    await connection.commit()
    return { ok: true, count, publishedAt: new Date().toISOString() }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
