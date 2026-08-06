import { deleteExpiredExerciseSummaries } from '../../../services/exercise-summaries'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return {
    ok: true,
    count: await deleteExpiredExerciseSummaries(),
  }
})
