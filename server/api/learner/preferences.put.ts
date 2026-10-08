import { getLearnerSession } from '../../utils/learner-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { parseLearnerPreferencesPatch, updateLearnerPreferences } from '../../services/learner-preferences'
import { PublicInputError } from '../../services/public-api-validation'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  const body = await readLimitedJsonBody<unknown>(event, 4 * 1024)
  let patch
  try {
    patch = parseLearnerPreferencesPatch(body)
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message })
    throw error
  }
  return updateLearnerPreferences(useDatabase(), learner.id, patch)
})
