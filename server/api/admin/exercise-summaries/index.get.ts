import { getExerciseSummaryAdminStats } from '../../../services/exercise-summaries'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return await getExerciseSummaryAdminStats()
})
