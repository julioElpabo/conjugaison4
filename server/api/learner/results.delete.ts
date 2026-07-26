import { getLearnerSession } from '../../utils/learner-session'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(
      'DELETE FROM learner_skill_daily_stats WHERE account_id = ?',
      [learner.id],
    )
    await connection.execute(
      'DELETE FROM learner_challenge_runs WHERE account_id = ?',
      [learner.id],
    )
    await connection.commit()
  }
  catch (error) {
    await connection.rollback()
    throw error
  }
  finally {
    connection.release()
  }

  return { ok: true }
})
