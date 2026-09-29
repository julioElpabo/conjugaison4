import { migrateSuccessMediaFrequency } from '../../scripts/migrate-success-media-frequency.mjs'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const result = await migrateSuccessMediaFrequency(connection)
    await connection.commit()
    console.info(result.applied
      ? `[database] GIFs de réussite renforcés : ${result.updatedRuleCount} règle(s) synchronisée(s).`
      : '[database] Fréquence des GIFs de réussite déjà synchronisée.')
  }
  catch (error) {
    await connection.rollback()
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code === 'ER_NO_SUCH_TABLE') return
    console.error('[database] Échec de la synchronisation des GIFs de réussite.', error)
  }
  finally {
    connection.release()
  }
})
