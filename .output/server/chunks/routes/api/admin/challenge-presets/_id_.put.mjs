import { d as defineEventHandler, g as getRouterParam, c as createError, e as parseChallengePresetPayload, r as readBody, u as useDatabase, f as replaceChallengePresetSelections, b as reorderChallengePresets } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';

const _id__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "D\xE9fi invalide" });
  const payload = parseChallengePresetPayload(await readBody(event));
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [[current]] = await connection.execute(
      "SELECT category_id AS categoryId FROM challenge_presets WHERE id=? FOR UPDATE",
      [id]
    );
    if (!current) throw createError({ statusCode: 404, statusMessage: "D\xE9fi introuvable" });
    const [result] = await connection.execute(`UPDATE challenge_presets SET
      preset_key=?,category_id=?,name=?,description=?,question_count=?,exercise_kind=?,
      past_simple_pronouns=?,inclusive_pronouns=?,complement_options=?,
      verb_selection_mode=?,criteria_json=?,sort_order=?,is_active=?
      WHERE id=?`, [
      payload.presetKey,
      payload.categoryId,
      payload.name,
      payload.description,
      payload.questionCount,
      payload.exerciseKind,
      payload.pastSimplePronouns,
      payload.inclusivePronouns ? 1 : 0,
      JSON.stringify(payload.complementOptions),
      payload.verbSelectionMode,
      JSON.stringify(payload.criteria),
      payload.sortOrder,
      payload.isActive ? 1 : 0,
      id
    ]);
    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: "D\xE9fi introuvable" });
    }
    await replaceChallengePresetSelections(connection, id, payload.verbIds, payload.tenseIds);
    const orders = await reorderChallengePresets(connection, payload.categoryId, id, payload.sortOrder);
    if (Number(current.categoryId) !== payload.categoryId) {
      orders.push(...await reorderChallengePresets(connection, Number(current.categoryId)));
    }
    await connection.commit();
    return { ok: true, orders };
  } catch (error) {
    await connection.rollback();
    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw createError({ statusCode: 409, statusMessage: "Cet identifiant de d\xE9fi existe d\xE9j\xE0" });
    }
    throw error;
  } finally {
    connection.release();
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
