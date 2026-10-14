import { getLearnerSession } from '../../utils/learner-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { PublicInputError } from '../../services/public-api-validation'
import { parseSavedChallengeRemoval, removeSavedChallenges } from '../../services/saved-challenge-removal'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  try {
    const codes = parseSavedChallengeRemoval(await readLimitedJsonBody<unknown>(event, 262144))
    const removedCount = await removeSavedChallenges(useDatabase(), learner.id, codes)
    return { codes, removedCount }
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message })
    throw error
  }
})
