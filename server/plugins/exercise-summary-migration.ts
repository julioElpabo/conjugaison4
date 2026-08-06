import { ensureExerciseSummaryTable } from '../services/exercise-summaries'

export default defineNitroPlugin(async () => {
  try {
    await ensureExerciseSummaryTable()
    console.info('[database] Partage des bilans disponible.')
  } catch (error) {
    console.error('[database] Échec de la préparation du partage des bilans.', error)
  }
})
