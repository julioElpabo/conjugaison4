import {
  ExerciseSummaryInputError,
  ExerciseSummaryNotFoundError,
  getExerciseSummary,
} from '../../services/exercise-summaries'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.summaryRead)
  try {
    const summary = await getExerciseSummary(getRouterParam(event, 'token') || '')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
    return summary
  } catch (error) {
    if (error instanceof ExerciseSummaryInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    if (error instanceof ExerciseSummaryNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: 'Bilan introuvable' })
    }
    console.error('Impossible de charger le bilan partagé', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de charger le bilan partagé' })
  }
})
