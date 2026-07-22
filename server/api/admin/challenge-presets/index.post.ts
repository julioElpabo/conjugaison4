import type { ResultSetHeader } from 'mysql2/promise'
import { parseChallengePresetPayload, reorderChallengePresets, replaceChallengePresetSelections } from '../../../services/challenge-presets'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const payload = parseChallengePresetPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO challenge_presets
      (preset_key,category_id,name,description,question_count,exercise_kind,
       past_simple_pronouns,inclusive_pronouns,complement_options,
       verb_selection_mode,criteria_json,sort_order,is_active)
      VALUES (?,?,?,?,?,?,?,?,?,'explicit',JSON_ARRAY(),?,?)`, [
      payload.presetKey, payload.categoryId, payload.name, payload.description,
      payload.questionCount, payload.exerciseKind, payload.pastSimplePronouns,
      payload.inclusivePronouns ? 1 : 0, JSON.stringify(payload.complementOptions),
      payload.sortOrder, payload.isActive ? 1 : 0,
    ])
    await replaceChallengePresetSelections(connection, result.insertId, payload.verbIds, payload.tenseIds)
    const orders = await reorderChallengePresets(connection, payload.categoryId, result.insertId, payload.sortOrder)
    await connection.commit()
    return { ok: true, id: result.insertId, orders }
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
