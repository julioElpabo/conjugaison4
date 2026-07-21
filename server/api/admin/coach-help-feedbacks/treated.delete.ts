import type { ResultSetHeader } from 'mysql2/promise'

interface DeleteTreatedFeedbacksBody {
  origin?: unknown
  includeRemoved?: unknown
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<DeleteTreatedFeedbacksBody>(event)
  const origin = body?.origin === 'user'
    ? 'user'
    : body?.origin === 'automatic'
      ? 'automatic'
      : null
  if (!origin) {
    throw createError({ statusCode: 400, statusMessage: 'Origine inconnue' })
  }
  const includeRemoved = origin === 'user' && body?.includeRemoved === true

  const [result] = await useDatabase().execute<ResultSetHeader>(
    `DELETE FROM coach_help_feedback
     WHERE origin=?
       AND (validation_status='validated' OR (?=1 AND moderation_status='removed'))`,
    [origin, includeRemoved ? 1 : 0],
  )

  return { ok: true, count: Number(result.affectedRows || 0) }
})
