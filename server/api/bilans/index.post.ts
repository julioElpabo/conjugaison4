import {
  ExerciseSummaryInputError,
  saveExerciseSummary,
} from '../../services/exercise-summaries'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.summaryCreate)
  try {
    const body = await readLimitedJsonBody<unknown>(event, 768 * 1024)
    return { token: await saveExerciseSummary(body) }
  } catch (error) {
    if (error instanceof ExerciseSummaryInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    console.error('Impossible de partager le bilan', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de partager le bilan' })
  }
})
