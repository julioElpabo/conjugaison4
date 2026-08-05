import { migrateUsefulAllophoneChallenge } from '../../scripts/migrate-useful-allophone-challenge.mjs'
import { invalidateCatalogueCache } from '../services/catalogue'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const result = await migrateUsefulAllophoneChallenge(connection)
    await connection.commit()
    invalidateCatalogueCache()
    console.info(
      `[database] Défi pour allophones prêt : ${result.verbCount} verbes, ${result.tenseCount} temps.`,
    )
  }
  catch (error) {
    await connection.rollback()
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code === 'ER_NO_SUCH_TABLE') return
    console.error('[database] Échec de la création du défi pour allophones.', error)
  }
  finally {
    connection.release()
  }
})
