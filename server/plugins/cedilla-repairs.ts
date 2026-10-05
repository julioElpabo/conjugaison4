import { repairDatabaseCedillas } from '../services/cedilla-repairs'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const report = await repairDatabaseCedillas(connection, true)
    await connection.commit()
    console.info('[database] Cédilles contrôlées :', report)
  } catch (error) {
    await connection.rollback()
    console.error('[database] Échec de la correction des cédilles.', error)
  } finally {
    connection.release()
  }
})
