import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase, b as reorderChallengePresets } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "D\xE9fi invalide" });
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [[current]] = await connection.execute(
      "SELECT category_id AS categoryId FROM challenge_presets WHERE id=? FOR UPDATE",
      [id]
    );
    const [result] = await connection.execute("DELETE FROM challenge_presets WHERE id=?", [id]);
    if (result.affectedRows === 0 || !current) {
      throw createError({ statusCode: 404, statusMessage: "D\xE9fi introuvable" });
    }
    await reorderChallengePresets(connection, Number(current.categoryId));
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
