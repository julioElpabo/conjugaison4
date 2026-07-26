import type { ResultSetHeader } from 'mysql2/promise'
import { clearLearnerSession, getLearnerSession } from '../../utils/learner-session'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })

  const [result] = await useDatabase().execute<ResultSetHeader>(
    'DELETE FROM learner_accounts WHERE id = ?',
    [learner.id],
  )
  if (result.affectedRows !== 1) {
    throw createError({ statusCode: 409, statusMessage: 'Le compte n’a pas pu être supprimé' })
  }

  await clearLearnerSession(event)
  return { ok: true }
})
