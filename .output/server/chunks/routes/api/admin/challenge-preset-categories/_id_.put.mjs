import { d as defineEventHandler, g as getRouterParam, c as createError, p as parseChallengePresetCategoryPayload, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
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
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Cat\xE9gorie invalide" });
  const payload = parseChallengePresetCategoryPayload(await readBody(event));
  try {
    const [result] = await useDatabase().execute(`UPDATE challenge_preset_categories SET
      slug=?,name=?,description=?,sort_order=?,is_active=? WHERE id=?`, [
      payload.slug,
      payload.name,
      payload.description,
      payload.sortOrder,
      payload.isActive ? 1 : 0,
      id
    ]);
    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: "Cat\xE9gorie introuvable" });
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw createError({ statusCode: 409, statusMessage: "Cette cat\xE9gorie existe d\xE9j\xE0" });
    }
    throw error;
  }
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
