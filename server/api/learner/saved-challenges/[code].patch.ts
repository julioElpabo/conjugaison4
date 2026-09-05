import { getLearnerSession } from '../../../utils/learner-session'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'
import { normalizeDefiCode } from '../../../services/defis'
import { PublicInputError } from '../../../services/public-api-validation'
import { parseSavedChallengeMetadata, updateSavedChallengeMetadata } from '../../../services/saved-challenge-metadata'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  try {
    const code = normalizeDefiCode(getRouterParam(event, 'code'))
    const metadata = parseSavedChallengeMetadata(await readLimitedJsonBody<unknown>(event, 8192))
    if (!await updateSavedChallengeMetadata(useDatabase(), learner.id, code, metadata)) {
      throw createError({ statusCode: 404, statusMessage: 'Défi absent de ton compte' })
    }
    return { code, ...metadata }
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message })
    throw error
  }
})
