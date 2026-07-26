import type { RowDataPacket } from 'mysql2/promise'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface PreferenceRow extends RowDataPacket {
  interfaceLocale: string
  colorTheme: string
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const [[preferences]] = await useDatabase().execute<PreferenceRow[]>(`
    SELECT interface_locale AS interfaceLocale, color_theme AS colorTheme
    FROM learner_preferences
    WHERE account_id=?
    LIMIT 1
  `, [learner.id])
  return {
    interfaceLocale: preferences?.interfaceLocale || 'fr',
    colorTheme: preferences?.colorTheme === 'dark' ? 'dark' : 'light',
  }
})
