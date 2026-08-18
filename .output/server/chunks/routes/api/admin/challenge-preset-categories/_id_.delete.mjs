import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  var _a;
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Cat\xE9gorie invalide" });
  const [[usage]] = await useDatabase().execute("SELECT COUNT(*) AS total FROM challenge_presets WHERE category_id=?", [id]);
  if (Number((_a = usage == null ? void 0 : usage.total) != null ? _a : 0) > 0) {
    throw createError({ statusCode: 409, statusMessage: "D\xE9placez ou supprimez d\u2019abord les d\xE9fis de cette cat\xE9gorie" });
  }
  const [result] = await useDatabase().execute("DELETE FROM challenge_preset_categories WHERE id=?", [id]);
  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, statusMessage: "Cat\xE9gorie introuvable" });
  }
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
