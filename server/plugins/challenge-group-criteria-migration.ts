import { migrateChallengeGroupCriteria } from '../../scripts/migrate-challenge-group-criteria.mjs'
import { invalidateCatalogueCache } from '../services/catalogue'
import { useDatabase } from '../utils/database'

/**
 * Les défis standards de groupes doivent suivre le catalogue complet. Une
 * sélection explicite obligerait à les modifier après chaque import de verbes.
 */
export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const result = await migrateChallengeGroupCriteria(connection)
    await connection.commit()
    invalidateCatalogueCache()
    console.info(
      `[database] ${result.presetCount} défis de groupes résolus dynamiquement`
      + (result.removedSelections
        ? ` ; ${result.removedSelections} anciennes sélections explicites supprimées.`
        : ' ; aucune sélection explicite restante.'),
    )
  }
  catch (error) {
    await connection.rollback()
    console.error('[database] Échec de la migration dynamique des défis de groupes.', error)
  }
  finally {
    connection.release()
  }
})
