import { migratePronominalUses } from '../services/pronominal-use-migration'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const database = useDatabase()
  const connection = await database.getConnection()

  try {
    await connection.beginTransaction()
    const result = await migratePronominalUses(connection)
    await connection.commit()
    console.info(
      `[database] Catalogue pronominal disponible : ${result.activeUseCount} emplois actifs `
      + `(${result.inserted} ajoutés, ${result.reactivated} réactivés).`
    )
  }
  catch (error) {
    await connection.rollback()
    console.error('[database] Échec de la migration automatique du catalogue pronominal.', error)
  }
  finally {
    connection.release()
  }
})
