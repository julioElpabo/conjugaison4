import { useDatabase } from '../utils/database'
import { initializeDefisUsage } from '../services/defis-cleanup'

export default defineNitroPlugin(async () => {
  const database = useDatabase()
  try {
    if (await initializeDefisUsage(database)) {
      console.info('[database] Suivi de l’utilisation des défis initialisé ; liens sans expiration automatique.')
    }
  } catch (error) {
    console.error('[database] Échec de la migration du suivi des défis.', error)
    throw error
  }
})
