import { getLearnerSession } from '../../../utils/learner-session'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'
import { PublicInputError } from '../../../services/public-api-validation'
import { parseChallengeFolderId, parseChallengeFolderPatch, updateChallengeFolder, SavedChallengeFolderError } from '../../../services/saved-challenge-folders'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  try {
    const rawId = getRouterParam(event, 'id') || ''
    const id = parseChallengeFolderId(/^\d+$/u.test(rawId) ? Number(rawId) : undefined)
    const patch = parseChallengeFolderPatch(await readLimitedJsonBody<unknown>(event, 2048))
    return { folder: await updateChallengeFolder(useDatabase(), learner.id, id, patch) }
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message })
    if (error instanceof SavedChallengeFolderError) throw createError({ statusCode: error.statusCode, statusMessage: error.message })
    throw error
  }
})
