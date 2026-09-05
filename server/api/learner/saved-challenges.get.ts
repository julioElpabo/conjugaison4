import type { RowDataPacket } from 'mysql2/promise'
import type { DefiDefinition } from '../../types/public-api'
import { parseDefiDefinition } from '../../services/public-api-validation'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'
import { ensureSavedChallengeMetadata } from '../../services/saved-challenge-metadata'

interface SavedChallengeRow extends RowDataPacket {
  code: string
  definitionJson: string
  savedAt: string
  customTitle: string | null
  customDescription: string | null
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  const database = useDatabase()
  await ensureSavedChallengeMetadata(database)
  const [rows] = await database.execute<SavedChallengeRow[]>(`
    SELECT d.name AS code, d.defi AS definitionJson, saved.saved_at AS savedAt,
      saved.custom_title AS customTitle, saved.custom_description AS customDescription
    FROM learner_saved_challenges saved
    INNER JOIN defis d ON d.id=saved.defi_id
    WHERE saved.account_id=?
    ORDER BY saved.saved_at DESC, d.id DESC
  `, [learner.id])

  return {
    challenges: rows.flatMap((row) => {
      try {
        const definition: DefiDefinition = parseDefiDefinition(JSON.parse(row.definitionJson))
        return [{
          code: row.code,
          title: row.customTitle ?? (definition.title || `Défi ${row.code}`),
          description: row.customDescription ?? (definition.description || ''),
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
