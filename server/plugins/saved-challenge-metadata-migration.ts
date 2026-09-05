import { useDatabase } from '../utils/database'
import { ensureSavedChallengeMetadata } from '../services/saved-challenge-metadata'

export default defineNitroPlugin(async () => {
  try {
    await ensureSavedChallengeMetadata(useDatabase())
    console.info('[database] Titres et descriptions personnels des défis disponibles.')
  } catch (error) {
    console.error('[database] Échec de la migration des titres et descriptions personnels.', error)
    // La première requête retentera la migration après les autres plugins.
  }
})
