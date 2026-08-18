import { d as defineEventHandler, f as parseChallengePresetPayload, r as readBody, u as useDatabase, h as replaceChallengePresetSelections, e as reorderChallengePresets, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const payload = parseChallengePresetPayload(await readBody(event));
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`INSERT INTO challenge_presets
      (preset_key,category_id,name,description,question_count,exercise_kind,
       past_simple_pronouns,inclusive_pronouns,complement_options,
       learning_support_mode,verb_selection_mode,criteria_json,sort_order,is_active)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
      payload.presetKey,
      payload.categoryId,
      payload.name,
      payload.description,
      payload.questionCount,
      payload.exerciseKind,
      payload.pastSimplePronouns,
      payload.inclusivePronouns ? 1 : 0,
      JSON.stringify(payload.complementOptions),
      payload.learningSupportMode,
      payload.verbSelectionMode,
      JSON.stringify(payload.criteria),
      payload.sortOrder,
      payload.isActive ? 1 : 0
    ]);
    await replaceChallengePresetSelections(connection, result.insertId, payload.verbIds, payload.tenseIds);
    const orders = await reorderChallengePresets(connection, payload.categoryId, result.insertId, payload.sortOrder);
    await connection.commit();
    return { ok: true, id: result.insertId, orders };
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

export { index_post as default };
//# sourceMappingURL=index3.post.mjs.map
