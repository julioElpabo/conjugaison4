import type { RowDataPacket } from 'mysql2/promise'
import { getDefi, normalizeDefiCode, DefiNotFoundError, DefiStorageError } from '../../services/defis'
import { PublicInputError } from '../../services/public-api-validation'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { requireLearnerDataSubject } from '../../utils/learner-data-subject'

interface DefiIdRow extends RowDataPacket { id: number }

export default defineEventHandler(async (event) => {
  const learner = await requireLearnerDataSubject(event)
  try {
    const body = await readLimitedJsonBody<{ code?: unknown }>(event, 1024)
    const code = normalizeDefiCode(typeof body?.code === 'string' ? body.code : undefined)
    await getDefi(code)
    const [[defi]] = await useDatabase().execute<DefiIdRow[]>(
      'SELECT id FROM defis WHERE name=? ORDER BY id DESC LIMIT 1',
      [code],
    )
    if (!defi) throw new DefiNotFoundError('Défi introuvable')
    const [result] = await useDatabase().execute(`
      INSERT IGNORE INTO learner_saved_challenges (account_id, defi_id)
      VALUES (?, ?)
    `, [learner.id, defi.id])
    return { code, added: Number((result as { affectedRows?: number }).affectedRows || 0) > 0 }
  }
  catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    if (error instanceof DefiNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: 'Défi introuvable' })
    }
    if (error instanceof DefiStorageError) {
      throw createError({ statusCode: 422, statusMessage: 'Ce défi est illisible' })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    console.error('[learner] Impossible d’enregistrer le défi dans le compte.', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d’enregistrer ce défi' })
  }
})
