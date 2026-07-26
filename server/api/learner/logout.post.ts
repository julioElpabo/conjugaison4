import { clearLearnerSession } from '../../utils/learner-session'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  await clearLearnerSession(event)
  return { ok: true }
})
