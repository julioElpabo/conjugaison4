import type { ResultSetHeader } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    const [result] = await database.execute<ResultSetHeader>(`
      UPDATE challenge_presets
      SET question_count=10
      WHERE question_count<>10
    `)
    console.info(
      `[database] Défis préfabriqués limités à 10 questions`
      + (result.affectedRows ? ` (${result.affectedRows} mis à jour).` : '.')
    )
  }
  catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code === 'ER_NO_SUCH_TABLE') return
    console.error('[database] Échec de la mise à jour du nombre de questions des défis.', error)
  }
})
