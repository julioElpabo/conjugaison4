import { getLearnerSession } from '../../../utils/learner-session'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'
import { PublicInputError } from '../../../services/public-api-validation'
import { parseSavedChallengeMove, moveSavedChallenges, SavedChallengeFolderError } from '../../../services/saved-challenge-folders'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  try {
    const { codes, folderId } = parseSavedChallengeMove(await readLimitedJsonBody<unknown>(event, 262144))
    await moveSavedChallenges(useDatabase(), learner.id, codes, folderId)
    return { codes, folderId }
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message })
    if (error instanceof SavedChallengeFolderError) throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    throw error
  }
})
