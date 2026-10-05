import { repairFeedbackComplements } from '../services/feedback-complement-repairs'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const report = await repairFeedbackComplements(connection, true)
    await connection.commit()
    console.info('[database] Compléments des feedbacks contrôlés :', report)
  } catch (error) {
    await connection.rollback()
    console.error('[database] Échec de la correction des compléments des feedbacks.', error)
  } finally {
    connection.release()
  }
})
