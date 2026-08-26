import type { ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const [result] = await useDatabase().execute<ResultSetHeader>(
    `DELETE FROM coach_help_feedback WHERE origin='user'`,
  )

  return { ok: true, count: Number(result.affectedRows || 0) }
})
