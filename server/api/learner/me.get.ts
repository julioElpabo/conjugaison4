import { getLearnerSession } from '../../utils/learner-session'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const user = await getLearnerSession(event, true)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  return { user: { id: user.id, username: user.username } }
})
