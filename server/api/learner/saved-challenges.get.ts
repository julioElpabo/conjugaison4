import type { RowDataPacket } from 'mysql2/promise'
import type { DefiDefinition } from '../../types/public-api'
import { parseDefiDefinition } from '../../services/public-api-validation'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface SavedChallengeRow extends RowDataPacket {
  code: string
  definitionJson: string
  savedAt: string
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const [rows] = await useDatabase().execute<SavedChallengeRow[]>(`
    SELECT d.name AS code, d.defi AS definitionJson, saved.saved_at AS savedAt
    FROM learner_saved_challenges saved
    INNER JOIN defis d ON d.id=saved.defi_id
    WHERE saved.account_id=?
      AND (d.isANePasEffacer = 1 OR d.expires_at > CURRENT_TIMESTAMP)
    ORDER BY saved.saved_at DESC, d.id DESC
  `, [learner.id])

  return {
    challenges: rows.flatMap((row) => {
      try {
        const definition: DefiDefinition = parseDefiDefinition(JSON.parse(row.definitionJson))
        return [{
          code: row.code,
          title: definition.title || `Défi ${row.code}`,
          description: definition.description || '',
          questionCount: definition.questionCount,
          verbCount: definition.verbIds.length,
          tenseCount: definition.tenseIds.length,
          savedAt: row.savedAt,
        }]
      }
      catch {
        return []
      }
    }),
  }
})
