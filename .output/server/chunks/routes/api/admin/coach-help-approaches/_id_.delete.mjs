import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
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
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Approche d\u2019aide invalide" });
  const database = useDatabase();
  const [[usage]] = await database.execute(
    "SELECT COUNT(*) AS total FROM coach_characters WHERE help_approach_id=?",
    [id]
  );
  if (Number(usage == null ? void 0 : usage.total)) {
    throw createError({ statusCode: 409, statusMessage: "Cette approche est encore utilis\xE9e par un caract\xE8re" });
  }
  const [[remaining]] = await database.execute("SELECT COUNT(*) AS total FROM coach_help_approaches");
  if (Number(remaining == null ? void 0 : remaining.total) <= 1) throw createError({ statusCode: 409, statusMessage: "Il faut conserver au moins une approche" });
  const [result] = await database.execute("DELETE FROM coach_help_approaches WHERE id=?", [id]);
  if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: "Approche d\u2019aide introuvable" });
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
