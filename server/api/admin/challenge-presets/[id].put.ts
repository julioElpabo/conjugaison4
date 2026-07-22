import type { ResultSetHeader } from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2/promise'
import { parseChallengePresetPayload, reorderChallengePresets, replaceChallengePresetSelections } from '../../../services/challenge-presets'

interface CurrentPresetRow extends RowDataPacket { categoryId: number }

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Défi invalide' })
  const payload = parseChallengePresetPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [[current]] = await connection.execute<CurrentPresetRow[]>(
      'SELECT category_id AS categoryId FROM challenge_presets WHERE id=? FOR UPDATE', [id],
    )
    if (!current) throw createError({ statusCode: 404, statusMessage: 'Défi introuvable' })
    const [result] = await connection.execute<ResultSetHeader>(`UPDATE challenge_presets SET
      preset_key=?,category_id=?,name=?,description=?,question_count=?,exercise_kind=?,
      past_simple_pronouns=?,inclusive_pronouns=?,complement_options=?,
      verb_selection_mode='explicit',criteria_json=JSON_ARRAY(),sort_order=?,is_active=?
      WHERE id=?`, [
      payload.presetKey, payload.categoryId, payload.name, payload.description,
      payload.questionCount, payload.exerciseKind, payload.pastSimplePronouns,
      payload.inclusivePronouns ? 1 : 0, JSON.stringify(payload.complementOptions),
      payload.sortOrder, payload.isActive ? 1 : 0, id,
    ])
    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Défi introuvable' })
    }
    await replaceChallengePresetSelections(connection, id, payload.verbIds, payload.tenseIds)
    const orders = await reorderChallengePresets(connection, payload.categoryId, id, payload.sortOrder)
    if (Number(current.categoryId) !== payload.categoryId) {
      orders.push(...await reorderChallengePresets(connection, Number(current.categoryId)))
    }
    await connection.commit()
    return { ok: true, orders }
  } catch (error) {
    await connection.rollback()
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 409, statusMessage: 'Cet identifiant de défi existe déjà' })
    }
    throw error
  } finally {
    connection.release()
  }
})
