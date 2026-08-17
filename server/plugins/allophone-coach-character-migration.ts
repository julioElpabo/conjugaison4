import {
  ensureCoachConfigurationMigrations,
  migrateAllophoneCoachCharacter,
} from '../../scripts/migrate-allophone-coach-character.mjs'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await ensureCoachConfigurationMigrations(connection)
    await connection.beginTransaction()
    const result = await migrateAllophoneCoachCharacter(connection)
    await connection.commit()
    console.info(result.applied
      ? `[database] Caractère allophone synchronisé : ${result.replyCount} répliques, ${result.ruleCount} règles.`
      : '[database] Caractère allophone déjà synchronisé.')
  }
  catch (error) {
    await connection.rollback()
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code === 'ER_NO_SUCH_TABLE') return
    console.error('[database] Échec de la synchronisation du caractère allophone.', error)
  }
  finally {
    connection.release()
  }
})
